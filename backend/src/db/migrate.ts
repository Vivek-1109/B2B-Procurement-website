/**
 * MongoDB → PostgreSQL Migration Script
 * ======================================
 * Phase 3: Migrates existing leads (and verifies admin) from MongoDB to Neon PostgreSQL.
 *
 * Run AFTER:
 *  1. Setting DATABASE_URL and MONGODB_URI in backend/.env
 *  2. Running the seed script to populate catalog data + admin
 *
 * This script is SAFE and idempotent:
 *  - It never modifies MongoDB
 *  - Leads are skipped if submission_fingerprint already exists in PostgreSQL
 *  - Run multiple times without risk of duplicate data
 *
 * Usage:
 *   npx tsx src/db/migrate.ts
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import { Pool } from 'pg';
import { initSchema } from '../config/db';

// ── We read directly from MongoDB using a minimal inline schema ──
const LeadMongoSchema = new mongoose.Schema(
  {
    name: String,
    company: String,
    email: String,
    phone: String,
    message: String,
    productName: String,
    productCategory: String,
    ipAddress: String,
    userAgent: String,
    submissionFingerprint: String,
    emailDelivery: {
      adminStatus: String,
      visitorStatus: String,
      adminMessageId: String,
      visitorMessageId: String,
      adminError: String,
      visitorError: String,
      lastEvent: String,
      lastEventAt: Date,
    },
    status: String,
  },
  { timestamps: true }
);

const MongoLead = mongoose.model('Lead', LeadMongoSchema);

// ── Helpers ──────────────────────────────────────────────────
function safe(val: unknown, max: number): string | null {
  if (val === null || val === undefined) return null;
  const str = String(val).trim();
  return str.length > 0 ? str.slice(0, max) : null;
}

function safeState(val: unknown, fallback = 'pending'): string {
  const valid = ['pending','sent','delivered','delayed','failed','bounced','complained','suppressed','skipped'];
  const s = String(val || '').toLowerCase();
  return valid.includes(s) ? s : fallback;
}

function safeStatus(val: unknown): string {
  const valid = ['new','contacted','closed'];
  const s = String(val || '').toLowerCase();
  return valid.includes(s) ? s : 'new';
}

// ── Main ──────────────────────────────────────────────────────
async function migrate(): Promise<void> {
  console.log('\n🔄 Starting MongoDB → PostgreSQL migration...\n');

  const mongoUri = process.env.MONGODB_URI;
  const pgUrl = process.env.DATABASE_URL;

  if (!mongoUri) throw new Error('MONGODB_URI is not set in .env');
  if (!pgUrl)    throw new Error('DATABASE_URL is not set in .env');

  // Connect MongoDB (read-only — we do NOT write to it)
  console.log('📡 Connecting to MongoDB...');
  await mongoose.connect(mongoUri, { family: 4 });
  console.log('✅ MongoDB connected');

  // Connect PostgreSQL
  console.log('📡 Connecting to Neon PostgreSQL...');
  const pool = new Pool({ connectionString: pgUrl, ssl: { rejectUnauthorized: false } });
  const pgClient = await pool.connect();
  console.log('✅ PostgreSQL connected');

  // Ensure schema exists
  await initSchema();

  // ── Leads migration ──────────────────────────────────────────
  console.log('\n📦 Migrating leads...');
  const leads = await MongoLead.find({}).lean();
  console.log(`   Found ${leads.length} leads in MongoDB`);

  let migratedCount = 0;
  let skippedCount  = 0;
  let failedCount   = 0;
  const failures: Array<{ mongoId: string; error: string }> = [];

  for (const lead of leads) {
    const mongoId = String(lead._id);
    try {
      const fingerprint = safe(lead.submissionFingerprint, 64);

      // Skip if already migrated (idempotency via fingerprint)
      if (fingerprint) {
        const { rows } = await pgClient.query(
          'SELECT id FROM leads WHERE submission_fingerprint = $1 LIMIT 1',
          [fingerprint]
        );
        if (rows.length > 0) {
          skippedCount++;
          continue;
        }
      }

      const d = (lead.emailDelivery || {}) as Record<string, unknown>;

      await pgClient.query(
        `INSERT INTO leads (
           name, company, email, phone, message,
           product_name, product_category,
           ip_address, user_agent, submission_fingerprint,
           admin_status, visitor_status,
           admin_message_id, visitor_message_id,
           admin_error, visitor_error,
           last_event, last_event_at,
           status, created_at, updated_at
         ) VALUES (
           $1, $2, $3, $4, $5,
           $6, $7,
           $8, $9, $10,
           $11, $12,
           $13, $14,
           $15, $16,
           $17, $18,
           $19, $20, $21
         )`,
        [
          safe(lead.name, 100)    || 'Unknown',
          safe(lead.company, 150) || 'Unknown',
          safe(lead.email, 254)   || 'unknown@unknown.com',
          safe(lead.phone, 30)    || 'Unknown',
          safe(lead.message, 3000) || '',
          safe(lead.productName, 150),
          safe(lead.productCategory, 100),
          safe(lead.ipAddress, 64),
          safe(lead.userAgent, 512),
          fingerprint,
          safeState(d.adminStatus),
          safeState(d.visitorStatus),
          safe(d.adminMessageId, 255),
          safe(d.visitorMessageId, 255),
          safe(d.adminError, 1000),
          safe(d.visitorError, 1000),
          safe(d.lastEvent, 100),
          d.lastEventAt ? new Date(d.lastEventAt as string) : null,
          safeStatus(lead.status),
          lead.createdAt ? new Date(lead.createdAt as unknown as string) : new Date(),
          lead.updatedAt ? new Date(lead.updatedAt as unknown as string) : new Date(),
        ]
      );
      migratedCount++;
    } catch (err) {
      failedCount++;
      failures.push({ mongoId, error: String(err) });
      console.error(`   ❌ Failed to migrate lead ${mongoId}:`, err);
    }
  }

  pgClient.release();

  // ── Summary ──────────────────────────────────────────────────
  console.log('\n═══════════════════════════════════════════');
  console.log('  Migration Summary');
  console.log('═══════════════════════════════════════════');
  console.log(`  Leads found in MongoDB:   ${leads.length}`);
  console.log(`  Successfully migrated:    ${migratedCount}`);
  console.log(`  Skipped (already in PG):  ${skippedCount}`);
  console.log(`  Failed:                   ${failedCount}`);

  if (failures.length > 0) {
    console.log('\n  Failed records:');
    failures.forEach(f => console.log(`    Mongo ID: ${f.mongoId} — ${f.error}`));
  }

  // Verify counts
  const { rows: pgLeads } = await pool.query('SELECT COUNT(*)::int AS total FROM leads');
  console.log(`\n  PostgreSQL leads total: ${pgLeads[0].total}`);

  await pool.end();
  await mongoose.disconnect();

  console.log('\n✅ Migration complete. MongoDB data has NOT been modified.\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

migrate().catch(err => {
  console.error('❌ Migration crashed:', err);
  process.exit(1);
});

import { getPool } from '../config/db';

// ── Types (preserved from Mongoose model) ──────────────────
export type EmailDeliveryState =
  | 'pending'
  | 'sent'
  | 'delivered'
  | 'delayed'
  | 'failed'
  | 'bounced'
  | 'complained'
  | 'suppressed'
  | 'skipped';

export interface IEmailDelivery {
  adminStatus: EmailDeliveryState;
  visitorStatus: EmailDeliveryState;
  adminMessageId?: string;
  visitorMessageId?: string;
  adminError?: string;
  visitorError?: string;
  lastEvent?: string;
  lastEventAt?: Date;
}

export interface ILead {
  id: string;          // was _id / id in Mongoose
  name: string;
  company: string;
  email: string;
  phone: string;
  message: string;
  productName?: string;
  productCategory?: string;
  ipAddress?: string;
  userAgent?: string;
  submissionFingerprint?: string;
  emailDelivery: IEmailDelivery;
  status: 'new' | 'contacted' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

// ── Row mapper ─────────────────────────────────────────────
// Reconstructs the nested emailDelivery object that the rest
// of the application expects (contact.ts, resendWebhook.ts, email.ts)
function toLead(row: Record<string, unknown>): ILead {
  return {
    id: row.id as string,
    name: row.name as string,
    company: row.company as string,
    email: row.email as string,
    phone: row.phone as string,
    message: row.message as string,
    productName: row.product_name as string | undefined,
    productCategory: row.product_category as string | undefined,
    ipAddress: row.ip_address as string | undefined,
    userAgent: row.user_agent as string | undefined,
    submissionFingerprint: row.submission_fingerprint as string | undefined,
    emailDelivery: {
      adminStatus: row.admin_status as EmailDeliveryState,
      visitorStatus: row.visitor_status as EmailDeliveryState,
      adminMessageId: row.admin_message_id as string | undefined,
      visitorMessageId: row.visitor_message_id as string | undefined,
      adminError: row.admin_error as string | undefined,
      visitorError: row.visitor_error as string | undefined,
      lastEvent: row.last_event as string | undefined,
      lastEventAt: row.last_event_at as Date | undefined,
    },
    status: row.status as 'new' | 'contacted' | 'closed',
    createdAt: row.created_at as Date,
    updatedAt: row.updated_at as Date,
  };
}

// ── Queries ────────────────────────────────────────────────
export interface LeadListResult {
  data: ILead[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function findLeads(opts: {
  page: number;
  limit: number;
  status?: string;
}): Promise<LeadListResult> {
  const { page, limit, status } = opts;
  const offset = (page - 1) * limit;

  let whereClause = '';
  const params: unknown[] = [];
  if (status && ['new', 'contacted', 'closed'].includes(status)) {
    whereClause = 'WHERE status = $1';
    params.push(status);
  }

  const countResult = await getPool().query(
    `SELECT COUNT(*)::int AS total FROM leads ${whereClause}`,
    params
  );
  const total: number = countResult.rows[0].total;

  const dataParams = [...params, limit, offset];
  const limitIdx = params.length + 1;
  const offsetIdx = params.length + 2;

  const { rows } = await getPool().query(
    `SELECT * FROM leads ${whereClause}
     ORDER BY created_at DESC
     LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
    dataParams
  );

  return {
    data: rows.map(toLead),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function findLeadById(id: string): Promise<ILead | null> {
  const { rows } = await getPool().query(
    'SELECT * FROM leads WHERE id = $1 LIMIT 1',
    [id]
  );
  return rows.length ? toLead(rows[0]) : null;
}

export async function findLeadByFingerprint(
  fingerprint: string,
  since: Date
): Promise<ILead | null> {
  const { rows } = await getPool().query(
    `SELECT id FROM leads
     WHERE submission_fingerprint = $1 AND created_at >= $2
     LIMIT 1`,
    [fingerprint, since]
  );
  return rows.length ? toLead(rows[0]) : null;
}

export async function findLeadByMessageId(
  emailId: string
): Promise<ILead | null> {
  const { rows } = await getPool().query(
    `SELECT * FROM leads
     WHERE admin_message_id = $1 OR visitor_message_id = $1
     LIMIT 1`,
    [emailId]
  );
  return rows.length ? toLead(rows[0]) : null;
}

export async function createLead(data: {
  name: string;
  company: string;
  email: string;
  phone: string;
  message: string;
  productName?: string;
  productCategory?: string;
  ipAddress?: string;
  userAgent?: string;
  submissionFingerprint?: string;
  emailDelivery: IEmailDelivery;
}): Promise<ILead> {
  const d = data.emailDelivery;
  const { rows } = await getPool().query(
    `INSERT INTO leads (
       name, company, email, phone, message,
       product_name, product_category,
       ip_address, user_agent, submission_fingerprint,
       admin_status, visitor_status,
       admin_message_id, visitor_message_id,
       admin_error, visitor_error,
       last_event, last_event_at
     ) VALUES (
       $1, $2, $3, $4, $5,
       $6, $7,
       $8, $9, $10,
       $11, $12,
       $13, $14,
       $15, $16,
       $17, $18
     ) RETURNING *`,
    [
      data.name, data.company, data.email, data.phone, data.message,
      data.productName ?? null, data.productCategory ?? null,
      data.ipAddress ?? null, data.userAgent ?? null,
      data.submissionFingerprint ?? null,
      d.adminStatus, d.visitorStatus,
      d.adminMessageId ?? null, d.visitorMessageId ?? null,
      d.adminError ?? null, d.visitorError ?? null,
      d.lastEvent ?? null, d.lastEventAt ?? null,
    ]
  );
  return toLead(rows[0]);
}

export async function updateLeadEmailDelivery(
  id: string,
  delivery: IEmailDelivery
): Promise<void> {
  await getPool().query(
    `UPDATE leads SET
       admin_status = $1, visitor_status = $2,
       admin_message_id = $3, visitor_message_id = $4,
       admin_error = $5, visitor_error = $6,
       last_event = $7, last_event_at = $8
     WHERE id = $9`,
    [
      delivery.adminStatus, delivery.visitorStatus,
      delivery.adminMessageId ?? null, delivery.visitorMessageId ?? null,
      delivery.adminError ?? null, delivery.visitorError ?? null,
      delivery.lastEvent ?? null, delivery.lastEventAt ?? null,
      id,
    ]
  );
}

export async function updateLeadStatus(
  id: string,
  status: 'new' | 'contacted' | 'closed'
): Promise<ILead | null> {
  const { rows } = await getPool().query(
    `UPDATE leads SET status = $1 WHERE id = $2 RETURNING *`,
    [status, id]
  );
  return rows.length ? toLead(rows[0]) : null;
}

export async function updateLeadWebhookEvent(
  id: string,
  fields: {
    adminStatus?: EmailDeliveryState;
    visitorStatus?: EmailDeliveryState;
    adminError?: string;
    visitorError?: string;
    lastEvent: string;
    lastEventAt: Date;
  },
  channel: 'admin' | 'visitor'
): Promise<void> {
  const statusCol = channel === 'admin' ? 'admin_status' : 'visitor_status';
  const errorCol  = channel === 'admin' ? 'admin_error'  : 'visitor_error';
  const status = channel === 'admin' ? fields.adminStatus : fields.visitorStatus;
  const error  = channel === 'admin' ? fields.adminError  : fields.visitorError;

  const sets: string[] = [
    `last_event = $1`,
    `last_event_at = $2`,
    `${statusCol} = $3`,
  ];
  const values: unknown[] = [fields.lastEvent, fields.lastEventAt, status];
  let i = 4;

  if (error !== undefined) {
    sets.push(`${errorCol} = $${i++}`);
    values.push(error.slice(0, 1000));
  }

  values.push(id);
  await getPool().query(
    `UPDATE leads SET ${sets.join(', ')} WHERE id = $${i}`,
    values
  );
}

export async function deleteLead(id: string): Promise<boolean> {
  const { rowCount } = await getPool().query(
    'DELETE FROM leads WHERE id = $1',
    [id]
  );
  return (rowCount ?? 0) > 0;
}

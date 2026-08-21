import { getPool } from '../config/db';
import bcrypt from 'bcryptjs';

export type AdminRole = 'admin' | 'super_admin';

export interface IAdmin {
  id: string;
  email: string;
  passwordHash: string;
  role: AdminRole;
  createdAt: Date;
  updatedAt: Date;
}

// ── Row mapper ─────────────────────────────────────────────
function toAdmin(row: Record<string, unknown>): IAdmin {
  return {
    id: row.id as string,
    email: row.email as string,
    passwordHash: row.password_hash as string,
    role: row.role as AdminRole,
    createdAt: row.created_at as Date,
    updatedAt: row.updated_at as Date,
  };
}

// ── Query helpers ──────────────────────────────────────────
export async function findAdminByEmail(email: string): Promise<IAdmin | null> {
  const { rows } = await getPool().query(
    'SELECT * FROM admins WHERE email = $1 LIMIT 1',
    [email.toLowerCase().trim()]
  );
  return rows.length ? toAdmin(rows[0]) : null;
}

export async function findAdminById(id: string): Promise<IAdmin | null> {
  const { rows } = await getPool().query(
    'SELECT * FROM admins WHERE id = $1 LIMIT 1',
    [id]
  );
  return rows.length ? toAdmin(rows[0]) : null;
}

export async function createAdmin(data: {
  email: string;
  plainPassword: string;
  role?: AdminRole;
}): Promise<IAdmin> {
  const salt = await bcrypt.genSalt(12);
  const hash = await bcrypt.hash(data.plainPassword, salt);
  const { rows } = await getPool().query(
    `INSERT INTO admins (email, password_hash, role)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [data.email.toLowerCase().trim(), hash, data.role ?? 'admin']
  );
  return toAdmin(rows[0]);
}

export async function compareAdminPassword(
  admin: IAdmin,
  plain: string
): Promise<boolean> {
  return bcrypt.compare(plain, admin.passwordHash);
}

// ── Refresh token helpers (replaces refreshTokens[] array) ──
export async function addRefreshToken(
  adminId: string,
  tokenHash: string
): Promise<void> {
  await getPool().query(
    'INSERT INTO admin_refresh_tokens (admin_id, token_hash) VALUES ($1, $2)',
    [adminId, tokenHash]
  );
}

export async function hasRefreshToken(
  adminId: string,
  tokenHash: string
): Promise<boolean> {
  const { rows } = await getPool().query(
    'SELECT 1 FROM admin_refresh_tokens WHERE admin_id = $1 AND token_hash = $2 LIMIT 1',
    [adminId, tokenHash]
  );
  return rows.length > 0;
}

export async function removeRefreshToken(
  adminId: string,
  tokenHash: string
): Promise<void> {
  await getPool().query(
    'DELETE FROM admin_refresh_tokens WHERE admin_id = $1 AND token_hash = $2',
    [adminId, tokenHash]
  );
}

export async function removeAllRefreshTokens(adminId: string): Promise<void> {
  await getPool().query(
    'DELETE FROM admin_refresh_tokens WHERE admin_id = $1',
    [adminId]
  );
}

import { getPool } from '../config/db';

export interface IClient {
  id: string;
  name: string;
  logoUrl: string;
  cloudinaryPublicId: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

function toClient(row: Record<string, unknown>): IClient {
  return {
    id: row.id as string,
    name: row.name as string,
    logoUrl: (row.logo_url as string) ?? '',
    cloudinaryPublicId: (row.cloudinary_public_id as string) ?? '',
    order: row.order as number,
    isActive: row.is_active as boolean,
    createdAt: row.created_at as Date,
    updatedAt: row.updated_at as Date,
  };
}

export async function findActiveClients(): Promise<IClient[]> {
  const { rows } = await getPool().query(
    `SELECT id, name, logo_url, "order", is_active, created_at
     FROM clients
     WHERE is_active = true
     ORDER BY "order" ASC, name ASC`
  );
  return rows.map(toClient);
}

export async function findAllClients(): Promise<IClient[]> {
  const { rows } = await getPool().query(
    `SELECT * FROM clients ORDER BY "order" ASC, name ASC`
  );
  return rows.map(toClient);
}

export async function findClientById(id: string): Promise<IClient | null> {
  const { rows } = await getPool().query(
    'SELECT * FROM clients WHERE id = $1 LIMIT 1',
    [id]
  );
  return rows.length ? toClient(rows[0]) : null;
}

export async function createClient(data: {
  name: string;
  logoUrl?: string;
  order?: number;
  isActive?: boolean;
}): Promise<IClient> {
  const { rows } = await getPool().query(
    `INSERT INTO clients (name, logo_url, "order", is_active)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [data.name, data.logoUrl ?? '', data.order ?? 0, data.isActive ?? true]
  );
  return toClient(rows[0]);
}

export async function updateClient(
  id: string,
  data: Partial<{
    name: string;
    logoUrl: string;
    cloudinaryPublicId: string;
    order: number;
    isActive: boolean;
  }>
): Promise<IClient | null> {
  const sets: string[] = [];
  const values: unknown[] = [];
  let i = 1;

  if (data.name !== undefined)               { sets.push(`name = $${i++}`);                  values.push(data.name); }
  if (data.logoUrl !== undefined)            { sets.push(`logo_url = $${i++}`);               values.push(data.logoUrl); }
  if (data.cloudinaryPublicId !== undefined) { sets.push(`cloudinary_public_id = $${i++}`);  values.push(data.cloudinaryPublicId); }
  if (data.order !== undefined)              { sets.push(`"order" = $${i++}`);                values.push(data.order); }
  if (data.isActive !== undefined)           { sets.push(`is_active = $${i++}`);              values.push(data.isActive); }

  if (sets.length === 0) return findClientById(id);

  values.push(id);
  const { rows } = await getPool().query(
    `UPDATE clients SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`,
    values
  );
  return rows.length ? toClient(rows[0]) : null;
}

export async function deleteClient(id: string): Promise<boolean> {
  const { rowCount } = await getPool().query(
    'DELETE FROM clients WHERE id = $1',
    [id]
  );
  return (rowCount ?? 0) > 0;
}

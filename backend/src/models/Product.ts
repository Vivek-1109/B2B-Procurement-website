import { getPool } from '../config/db';

export interface IProduct {
  id: string;
  name: string;
  category: string;
  description: string;
  imageUrl: string;
  cloudinaryPublicId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ── Row mapper ─────────────────────────────────────────────
function toProduct(row: Record<string, unknown>): IProduct {
  return {
    id: row.id as string,
    name: row.name as string,
    category: row.category as string,
    description: row.description as string,
    imageUrl: (row.image_url as string) ?? '',
    cloudinaryPublicId: (row.cloudinary_public_id as string) ?? '',
    isActive: row.is_active as boolean,
    createdAt: row.created_at as Date,
    updatedAt: row.updated_at as Date,
  };
}

// ── Queries ────────────────────────────────────────────────
export async function findActiveProducts(): Promise<IProduct[]> {
  const { rows } = await getPool().query(
    `SELECT id, name, category, description, image_url, created_at
     FROM products
     WHERE is_active = true
     ORDER BY created_at DESC`
  );
  return rows.map(toProduct);
}

export async function findProductById(id: string): Promise<IProduct | null> {
  const { rows } = await getPool().query(
    'SELECT * FROM products WHERE id = $1 LIMIT 1',
    [id]
  );
  return rows.length ? toProduct(rows[0]) : null;
}

export async function createProduct(data: {
  name: string;
  category: string;
  description: string;
  imageUrl?: string;
}): Promise<IProduct> {
  const { rows } = await getPool().query(
    `INSERT INTO products (name, category, description, image_url)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [data.name, data.category, data.description, data.imageUrl ?? '']
  );
  return toProduct(rows[0]);
}

export async function updateProduct(
  id: string,
  data: Partial<{
    name: string;
    category: string;
    description: string;
    imageUrl: string;
    cloudinaryPublicId: string;
    isActive: boolean;
  }>
): Promise<IProduct | null> {
  const sets: string[] = [];
  const values: unknown[] = [];
  let i = 1;

  if (data.name !== undefined)                { sets.push(`name = $${i++}`);                  values.push(data.name); }
  if (data.category !== undefined)            { sets.push(`category = $${i++}`);               values.push(data.category); }
  if (data.description !== undefined)         { sets.push(`description = $${i++}`);            values.push(data.description); }
  if (data.imageUrl !== undefined)            { sets.push(`image_url = $${i++}`);              values.push(data.imageUrl); }
  if (data.cloudinaryPublicId !== undefined)  { sets.push(`cloudinary_public_id = $${i++}`);  values.push(data.cloudinaryPublicId); }
  if (data.isActive !== undefined)            { sets.push(`is_active = $${i++}`);              values.push(data.isActive); }

  if (sets.length === 0) return findProductById(id);

  values.push(id);
  const { rows } = await getPool().query(
    `UPDATE products SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`,
    values
  );
  return rows.length ? toProduct(rows[0]) : null;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const { rowCount } = await getPool().query(
    'DELETE FROM products WHERE id = $1',
    [id]
  );
  return (rowCount ?? 0) > 0;
}

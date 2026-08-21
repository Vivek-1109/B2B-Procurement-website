import { getPool } from '../config/db';

export interface ICategory {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  cloudinaryPublicId: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

function toCategory(row: Record<string, unknown>): ICategory {
  return {
    id: row.id as string,
    name: row.name as string,
    description: row.description as string,
    imageUrl: (row.image_url as string) ?? '',
    cloudinaryPublicId: (row.cloudinary_public_id as string) ?? '',
    isActive: row.is_active as boolean,
    order: row.order as number,
    createdAt: row.created_at as Date,
    updatedAt: row.updated_at as Date,
  };
}

export async function findActiveCategories(): Promise<ICategory[]> {
  const { rows } = await getPool().query(
    `SELECT id, name, description, image_url, "order", created_at
     FROM categories
     WHERE is_active = true
     ORDER BY "order" ASC, name ASC`
  );
  return rows.map(toCategory);
}

export async function findCategoryById(id: string): Promise<ICategory | null> {
  const { rows } = await getPool().query(
    'SELECT * FROM categories WHERE id = $1 LIMIT 1',
    [id]
  );
  return rows.length ? toCategory(rows[0]) : null;
}

export async function createCategory(data: {
  name: string;
  description: string;
  imageUrl?: string;
  order?: number;
}): Promise<ICategory> {
  const { rows } = await getPool().query(
    `INSERT INTO categories (name, description, image_url, "order")
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [data.name, data.description, data.imageUrl ?? '', data.order ?? 0]
  );
  return toCategory(rows[0]);
}

export async function updateCategory(
  id: string,
  data: Partial<{
    name: string;
    description: string;
    imageUrl: string;
    cloudinaryPublicId: string;
    isActive: boolean;
    order: number;
  }>
): Promise<ICategory | null> {
  const sets: string[] = [];
  const values: unknown[] = [];
  let i = 1;

  if (data.name !== undefined)               { sets.push(`name = $${i++}`);                  values.push(data.name); }
  if (data.description !== undefined)        { sets.push(`description = $${i++}`);            values.push(data.description); }
  if (data.imageUrl !== undefined)           { sets.push(`image_url = $${i++}`);              values.push(data.imageUrl); }
  if (data.cloudinaryPublicId !== undefined) { sets.push(`cloudinary_public_id = $${i++}`);  values.push(data.cloudinaryPublicId); }
  if (data.isActive !== undefined)           { sets.push(`is_active = $${i++}`);              values.push(data.isActive); }
  if (data.order !== undefined)              { sets.push(`"order" = $${i++}`);                values.push(data.order); }

  if (sets.length === 0) return findCategoryById(id);

  values.push(id);
  const { rows } = await getPool().query(
    `UPDATE categories SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`,
    values
  );
  return rows.length ? toCategory(rows[0]) : null;
}

export async function deleteCategory(id: string): Promise<boolean> {
  const { rowCount } = await getPool().query(
    'DELETE FROM categories WHERE id = $1',
    [id]
  );
  return (rowCount ?? 0) > 0;
}

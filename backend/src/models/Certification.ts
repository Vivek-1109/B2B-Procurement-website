import { getPool } from '../config/db';

export interface ICertification {
  id: string;
  title: string;
  imageUrl: string;
  cloudinaryPublicId: string;
  issuer: string;
  year: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

function toCertification(row: Record<string, unknown>): ICertification {
  return {
    id: row.id as string,
    title: row.title as string,
    imageUrl: (row.image_url as string) ?? '',
    cloudinaryPublicId: (row.cloudinary_public_id as string) ?? '',
    issuer: (row.issuer as string) ?? '',
    year: (row.year as string) ?? '',
    order: row.order as number,
    createdAt: row.created_at as Date,
    updatedAt: row.updated_at as Date,
  };
}

export async function findAllCertifications(): Promise<ICertification[]> {
  const { rows } = await getPool().query(
    `SELECT id, title, image_url, issuer, year, "order"
     FROM certifications
     ORDER BY "order" ASC`
  );
  return rows.map(toCertification);
}

export async function findCertificationById(id: string): Promise<ICertification | null> {
  const { rows } = await getPool().query(
    'SELECT * FROM certifications WHERE id = $1 LIMIT 1',
    [id]
  );
  return rows.length ? toCertification(rows[0]) : null;
}

export async function createCertification(data: {
  title: string;
  imageUrl?: string;
  issuer?: string;
  year?: string;
  order?: number;
}): Promise<ICertification> {
  const { rows } = await getPool().query(
    `INSERT INTO certifications (title, image_url, issuer, year, "order")
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [data.title, data.imageUrl ?? '', data.issuer ?? '', data.year ?? '', data.order ?? 0]
  );
  return toCertification(rows[0]);
}

export async function updateCertification(
  id: string,
  data: Partial<{
    title: string;
    imageUrl: string;
    cloudinaryPublicId: string;
    issuer: string;
    year: string;
    order: number;
  }>
): Promise<ICertification | null> {
  const sets: string[] = [];
  const values: unknown[] = [];
  let i = 1;

  if (data.title !== undefined)              { sets.push(`title = $${i++}`);                  values.push(data.title); }
  if (data.imageUrl !== undefined)           { sets.push(`image_url = $${i++}`);              values.push(data.imageUrl); }
  if (data.cloudinaryPublicId !== undefined) { sets.push(`cloudinary_public_id = $${i++}`);  values.push(data.cloudinaryPublicId); }
  if (data.issuer !== undefined)             { sets.push(`issuer = $${i++}`);                 values.push(data.issuer); }
  if (data.year !== undefined)               { sets.push(`year = $${i++}`);                   values.push(data.year); }
  if (data.order !== undefined)              { sets.push(`"order" = $${i++}`);                values.push(data.order); }

  if (sets.length === 0) return findCertificationById(id);

  values.push(id);
  const { rows } = await getPool().query(
    `UPDATE certifications SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`,
    values
  );
  return rows.length ? toCertification(rows[0]) : null;
}

export async function deleteCertification(id: string): Promise<boolean> {
  const { rowCount } = await getPool().query(
    'DELETE FROM certifications WHERE id = $1',
    [id]
  );
  return (rowCount ?? 0) > 0;
}

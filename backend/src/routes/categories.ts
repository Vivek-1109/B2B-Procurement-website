import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  findActiveCategories,
  findCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../models/Category';
import { requireAuth, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { uploadSingle, uploadBufferToCloudinary } from '../middleware/upload';
import cloudinary from '../config/cloudinary';
import { isValidUUID } from '../utils/uuid';

const router = Router();

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long').trim(),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(500, 'Description too long')
    .trim(),
  imageUrl: z.string().url('Invalid image URL').optional().or(z.literal('')),
  order: z.number().int().min(0).optional(),
});

const updateCategorySchema = categorySchema.partial();

// GET /api/categories — Public
router.get(
  '/',
  async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const categories = await findActiveCategories();
      res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
      res.json(categories);
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/categories — Admin only
router.post(
  '/',
  requireAuth,
  requireRole(['admin', 'super_admin']),
  validate(categorySchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const category = await createCategory(req.body);
      res.status(201).json(category);
    } catch (err) {
      next(err);
    }
  }
);

// PUT /api/categories/:id — Admin only
router.put(
  '/:id',
  requireAuth,
  requireRole(['admin', 'super_admin']),
  validate(updateCategorySchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      if (!isValidUUID(id)) {
        res.status(400).json({ error: 'Invalid category ID' });
        return;
      }

      const category = await updateCategory(id, {
        name: req.body.name,
        description: req.body.description,
        imageUrl: req.body.imageUrl,
        order: req.body.order,
      });

      if (!category) {
        res.status(404).json({ error: 'Category not found' });
        return;
      }

      res.json(category);
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/categories/:id — Admin only
router.delete(
  '/:id',
  requireAuth,
  requireRole(['admin', 'super_admin']),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      if (!isValidUUID(id)) {
        res.status(400).json({ error: 'Invalid category ID' });
        return;
      }

      const category = await findCategoryById(id);

      if (!category) {
        res.status(404).json({ error: 'Category not found' });
        return;
      }

      if (category.cloudinaryPublicId) {
        try {
          await cloudinary.uploader.destroy(category.cloudinaryPublicId);
        } catch (cloudinaryErr) {
          console.error('Cloudinary deletion failed:', cloudinaryErr);
        }
      }

      await deleteCategory(id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/categories/:id/image — Admin only
router.post(
  '/:id/image',
  requireAuth,
  requireRole(['admin', 'super_admin']),
  (req: Request, res: Response, next: NextFunction): void => {
    uploadSingle(req, res, (err) => {
      if (err) next(err);
      else next();
    });
  },
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      if (!isValidUUID(id)) {
        res.status(400).json({ error: 'Invalid category ID' });
        return;
      }

      if (!req.file) {
        res.status(400).json({ error: 'No image file provided' });
        return;
      }

      const cloudinaryResult = await uploadBufferToCloudinary(req.file.buffer, 'prosource/categories');

      const existing = await findCategoryById(id);
      if (existing?.cloudinaryPublicId) {
        await cloudinary.uploader.destroy(existing.cloudinaryPublicId).catch(console.error);
      }

      const category = await updateCategory(id, {
        imageUrl: cloudinaryResult.secure_url,
        cloudinaryPublicId: cloudinaryResult.public_id,
      });

      if (!category) {
        res.status(404).json({ error: 'Category not found' });
        return;
      }

      res.json(category);
    } catch (err) {
      next(err);
    }
  }
);

export default router;

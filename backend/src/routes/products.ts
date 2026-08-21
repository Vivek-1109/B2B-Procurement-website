import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  findActiveProducts,
  findProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../models/Product';
import { requireAuth, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { uploadSingle, uploadBufferToCloudinary } from '../middleware/upload';
import cloudinary from '../config/cloudinary';
import { isValidUUID } from '../utils/uuid';

const router = Router();

const productSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name too long').trim(),
  category: z.string().min(1, 'Category is required').trim(),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(2000, 'Description too long')
    .trim(),
  imageUrl: z.string().url('Invalid image URL').optional().or(z.literal('')),
});

const updateProductSchema = productSchema.partial();

// GET /api/products — Public
router.get(
  '/',
  async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const products = await findActiveProducts();
      res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
      res.json(products);
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/products — Admin only
router.post(
  '/',
  requireAuth,
  requireRole(['admin', 'super_admin']),
  validate(productSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const product = await createProduct(req.body);
      res.status(201).json(product);
    } catch (err) {
      next(err);
    }
  }
);

// PUT /api/products/:id — Admin only
router.put(
  '/:id',
  requireAuth,
  requireRole(['admin', 'super_admin']),
  validate(updateProductSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      if (!isValidUUID(id)) {
        res.status(400).json({ error: 'Invalid product ID' });
        return;
      }

      const product = await updateProduct(id, {
        name: req.body.name,
        category: req.body.category,
        description: req.body.description,
        imageUrl: req.body.imageUrl,
      });

      if (!product) {
        res.status(404).json({ error: 'Product not found' });
        return;
      }

      res.json(product);
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/products/:id — Admin only
router.delete(
  '/:id',
  requireAuth,
  requireRole(['admin', 'super_admin']),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      if (!isValidUUID(id)) {
        res.status(400).json({ error: 'Invalid product ID' });
        return;
      }

      const product = await findProductById(id);

      if (!product) {
        res.status(404).json({ error: 'Product not found' });
        return;
      }

      if (product.cloudinaryPublicId) {
        try {
          await cloudinary.uploader.destroy(product.cloudinaryPublicId);
        } catch (cloudinaryErr) {
          console.error('Cloudinary deletion failed:', cloudinaryErr);
        }
      }

      await deleteProduct(id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/products/:id/image — Admin only
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
        res.status(400).json({ error: 'Invalid product ID' });
        return;
      }

      if (!req.file) {
        res.status(400).json({ error: 'No image file provided' });
        return;
      }

      const cloudinaryResult = await uploadBufferToCloudinary(req.file.buffer);

      const existing = await findProductById(id);
      if (existing?.cloudinaryPublicId) {
        await cloudinary.uploader.destroy(existing.cloudinaryPublicId).catch(console.error);
      }

      const product = await updateProduct(id, {
        imageUrl: cloudinaryResult.secure_url,
        cloudinaryPublicId: cloudinaryResult.public_id,
      });

      if (!product) {
        res.status(404).json({ error: 'Product not found' });
        return;
      }

      res.json(product);
    } catch (err) {
      next(err);
    }
  }
);

export default router;

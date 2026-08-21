import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  findAllCertifications,
  findCertificationById,
  createCertification,
  updateCertification,
  deleteCertification,
} from '../models/Certification';
import { requireAuth, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import cloudinary from '../config/cloudinary';
import { isValidUUID } from '../utils/uuid';

const router = Router();

const certificationSchema = z.object({
  title: z.string().min(1, 'Title is required').trim(),
  imageUrl: z.string().url('Invalid image URL').optional().or(z.literal('')),
  issuer: z.string().optional().default(''),
  year: z.string().optional().default(''),
  order: z.number().int().optional().default(0),
});

const updateCertificationSchema = certificationSchema.partial();

// GET /api/certifications — Public
router.get(
  '/',
  async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const certifications = await findAllCertifications();
      res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
      res.json(certifications);
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/certifications — Admin only
router.post(
  '/',
  requireAuth,
  requireRole(['admin', 'super_admin']),
  validate(certificationSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const certification = await createCertification(req.body);
      res.status(201).json(certification);
    } catch (err) {
      next(err);
    }
  }
);

// PUT /api/certifications/:id — Admin only
router.put(
  '/:id',
  requireAuth,
  requireRole(['admin', 'super_admin']),
  validate(updateCertificationSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      if (!isValidUUID(id)) {
        res.status(400).json({ error: 'Invalid certification ID' });
        return;
      }

      const certification = await updateCertification(id, {
        title: req.body.title,
        imageUrl: req.body.imageUrl,
        issuer: req.body.issuer,
        year: req.body.year,
        order: req.body.order,
      });

      if (!certification) {
        res.status(404).json({ error: 'Certification not found' });
        return;
      }

      res.json(certification);
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/certifications/:id — Admin only
router.delete(
  '/:id',
  requireAuth,
  requireRole(['admin', 'super_admin']),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      if (!isValidUUID(id)) {
        res.status(400).json({ error: 'Invalid certification ID' });
        return;
      }

      const certification = await findCertificationById(id);

      if (!certification) {
        res.status(404).json({ error: 'Certification not found' });
        return;
      }

      if (certification.cloudinaryPublicId) {
        try {
          await cloudinary.uploader.destroy(certification.cloudinaryPublicId);
        } catch (cloudinaryErr) {
          console.error('Cloudinary deletion failed:', cloudinaryErr);
        }
      }

      await deleteCertification(id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
);

export default router;

import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  findLeads,
  findLeadById,
  updateLeadStatus,
  deleteLead,
} from '../models/Lead';
import { requireAuth, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { isValidUUID } from '../utils/uuid';

const router = Router();

const statusSchema = z.object({
  status: z.enum(['new', 'contacted', 'closed'], {
    errorMap: () => ({ message: 'Status must be new, contacted, or closed' }),
  }),
});

// All routes require authentication and admin role
router.use(requireAuth);
router.use(requireRole(['admin', 'super_admin']));

// GET /api/leads — Paginated list
router.get(
  '/',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page  = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
      const status = req.query.status as string | undefined;

      const result = await findLeads({ page, limit, status });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /api/leads/:id/status
router.patch(
  '/:id/status',
  validate(statusSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      if (!isValidUUID(id)) {
        res.status(400).json({ error: 'Invalid lead ID' });
        return;
      }

      const lead = await updateLeadStatus(id, req.body.status);

      if (!lead) {
        res.status(404).json({ error: 'Lead not found' });
        return;
      }

      res.json(lead);
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/leads/:id
router.delete(
  '/:id',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      if (!isValidUUID(id)) {
        res.status(400).json({ error: 'Invalid lead ID' });
        return;
      }

      const existed = await findLeadById(id);
      if (!existed) {
        res.status(404).json({ error: 'Lead not found' });
        return;
      }

      await deleteLead(id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
);

export default router;

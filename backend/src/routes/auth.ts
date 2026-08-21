import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import crypto from 'crypto';
import {
  findAdminByEmail,
  findAdminById,
  compareAdminPassword,
  addRefreshToken,
  hasRefreshToken,
  removeRefreshToken,
  removeAllRefreshTokens,
} from '../models/Admin';
import { validate } from '../middleware/validate';
import { requireAuth } from '../middleware/auth';

const router = Router();

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// POST /api/auth/login
router.post(
  '/login',
  validate(loginSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body as z.infer<typeof loginSchema>;

      const admin = await findAdminByEmail(email);
      if (!admin) {
        res.status(401).json({ error: 'Invalid email or password' });
        return;
      }

      const isValid = await compareAdminPassword(admin, password);
      if (!isValid) {
        res.status(401).json({ error: 'Invalid email or password' });
        return;
      }

      const jwtSecret = process.env.JWT_SECRET;
      const refreshSecret = process.env.JWT_REFRESH_SECRET;

      if (!jwtSecret || !refreshSecret) {
        throw new Error('JWT secrets are not configured');
      }

      const payload = { id: admin.id, email: admin.email, role: admin.role };

      const token = jwt.sign(payload, jwtSecret, { expiresIn: '15m' });
      const refreshToken = jwt.sign(payload, refreshSecret, { expiresIn: '7d' });

      const hashedToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
      await addRefreshToken(admin.id, hashedToken);

      const isProd = process.env.NODE_ENV === 'production';
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/api/auth',
      });

      res.json({
        token,
        expiresIn: 900,
        user: { email: admin.email, role: admin.role },
      });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/auth/logout
router.post(
  '/logout',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const refreshToken = req.cookies?.refreshToken as string | undefined;

      if (refreshToken && req.user) {
        const hashedToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
        await removeRefreshToken(req.user.id, hashedToken);
      }

      const isProd = process.env.NODE_ENV === 'production';
      res.clearCookie('refreshToken', {
        path: '/api/auth',
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
      });

      res.json({ message: 'Logged out successfully' });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/auth/refresh
router.post(
  '/refresh',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const refreshToken = req.cookies?.refreshToken as string | undefined;

      if (!refreshToken) {
        res.status(401).json({ error: 'Refresh token not found' });
        return;
      }

      const refreshSecret = process.env.JWT_REFRESH_SECRET;
      const jwtSecret = process.env.JWT_SECRET;

      if (!refreshSecret || !jwtSecret) {
        throw new Error('JWT secrets are not configured');
      }

      let decoded: { id: string; email: string; role: string };
      const isProd = process.env.NODE_ENV === 'production';

      try {
        decoded = jwt.verify(refreshToken, refreshSecret) as {
          id: string;
          email: string;
          role: string;
        };
      } catch (err) {
        res.clearCookie('refreshToken', {
          path: '/api/auth',
          secure: isProd,
          sameSite: isProd ? 'none' : 'lax',
        });

        // Clean up expired token from DB
        try {
          const unverifiedDecoded = jwt.decode(refreshToken) as { id?: string } | null;
          if (unverifiedDecoded?.id) {
            const expiredHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
            await removeRefreshToken(unverifiedDecoded.id, expiredHash);
          }
        } catch (_) { /* ignore cleanup failures */ }

        res.status(401).json({ error: 'Session expired or invalid' });
        return;
      }

      const admin = await findAdminById(decoded.id);
      if (!admin) {
        res.clearCookie('refreshToken', {
          path: '/api/auth',
          secure: isProd,
          sameSite: isProd ? 'none' : 'lax',
        });
        res.status(401).json({ error: 'Account no longer exists' });
        return;
      }

      const incomingHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

      // Token reuse detection — if hash not in DB, revoke ALL sessions
      const tokenExists = await hasRefreshToken(admin.id, incomingHash);
      if (!tokenExists) {
        await removeAllRefreshTokens(admin.id);
        res.clearCookie('refreshToken', {
          path: '/api/auth',
          secure: isProd,
          sameSite: isProd ? 'none' : 'lax',
        });
        res.status(401).json({ error: 'Access denied: session compromise detected' });
        return;
      }

      // Rotate token: remove old, issue new
      await removeRefreshToken(admin.id, incomingHash);

      const payload = { id: admin.id, email: admin.email, role: admin.role };
      const newAccessToken  = jwt.sign(payload, jwtSecret,     { expiresIn: '15m' });
      const newRefreshToken = jwt.sign(payload, refreshSecret, { expiresIn: '7d' });

      const newHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');
      await addRefreshToken(admin.id, newHash);

      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/api/auth',
      });

      res.json({ token: newAccessToken, expiresIn: 900 });
    } catch (err) {
      next(err);
    }
  }
);

export default router;

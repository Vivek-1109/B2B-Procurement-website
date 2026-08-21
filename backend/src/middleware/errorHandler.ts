import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import jwt from 'jsonwebtoken';

// PostgreSQL error codes
const PG_UNIQUE_VIOLATION = '23505';
const PG_FOREIGN_KEY_VIOLATION = '23503';
const PG_NOT_NULL_VIOLATION = '23502';
const PG_CHECK_VIOLATION = '23514';
const PG_INVALID_TEXT_REPRESENTATION = '22P02'; // e.g. invalid UUID

interface AppError extends Error {
  statusCode?: number;
  status?: string;
  // pg driver attaches this to errors
  code?: string;
  detail?: string;
  constraint?: string;
  column?: string;
}

const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    console.error('🔴 Error:', err);
  } else {
    console.error(`[ERROR] ${req.method} ${req.path}: ${err.message}`);
  }

  // ── PostgreSQL errors ──────────────────────────────────────
  if (err.code === PG_UNIQUE_VIOLATION) {
    // Extract field name from constraint or detail
    const field = err.constraint
      ? err.constraint.replace(/^.*_(.+)_key$/, '$1').replace(/_/g, ' ')
      : 'field';
    res.status(409).json({ error: `A record with this ${field} already exists` });
    return;
  }

  if (err.code === PG_FOREIGN_KEY_VIOLATION) {
    res.status(400).json({ error: 'Related record does not exist' });
    return;
  }

  if (err.code === PG_NOT_NULL_VIOLATION) {
    res.status(400).json({ error: `Required field is missing: ${err.column ?? 'unknown'}` });
    return;
  }

  if (err.code === PG_CHECK_VIOLATION) {
    res.status(400).json({ error: 'Value is not allowed by database constraints' });
    return;
  }

  if (err.code === PG_INVALID_TEXT_REPRESENTATION) {
    res.status(400).json({ error: 'Invalid ID format' });
    return;
  }

  // ── JWT errors ─────────────────────────────────────────────
  if (err instanceof jwt.TokenExpiredError) {
    res.status(401).json({ error: 'Token has expired' });
    return;
  }

  if (err instanceof jwt.JsonWebTokenError) {
    res.status(401).json({ error: 'Invalid token' });
    return;
  }

  // ── Zod validation errors ──────────────────────────────────
  if (err instanceof ZodError) {
    const fieldErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    res.status(400).json({ error: 'Validation failed', details: fieldErrors });
    return;
  }

  // ── Known status code errors ───────────────────────────────
  if (err.statusCode) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  // ── Default 500 ────────────────────────────────────────────
  res.status(500).json({
    error: isProduction ? 'An unexpected error occurred' : err.message,
  });
};

export default errorHandler;

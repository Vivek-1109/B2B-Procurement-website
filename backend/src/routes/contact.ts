import { createHash } from 'crypto';
import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import Lead, { IEmailDelivery } from '../models/Lead';
import { validate } from '../middleware/validate';
import { sendAdminNotification, sendContactConfirmation } from '../config/email';

const router = Router();

const DUPLICATE_WINDOW_MS = parsePositiveInt(process.env.CONTACT_DUPLICATE_WINDOW_MS, 15 * 60 * 1000);
const MIN_FORM_COMPLETION_MS = parsePositiveInt(process.env.CONTACT_MIN_FORM_COMPLETION_MS, 1500);

function parsePositiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value || '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function stripControlChars(value: string): string {
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');
}

function normalizeSingleLine(value: string): string {
  return stripControlChars(value).replace(/\s+/g, ' ').trim();
}

function normalizeMultiline(value: string): string {
  return stripControlChars(value)
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map((line) => line.replace(/[ \t]+/g, ' ').trim())
    .join('\n')
    .trim();
}

function singleLineField(min: number, max: number, label: string): z.ZodEffects<z.ZodString, string, unknown> {
  return z.preprocess(
    (value) => (typeof value === 'string' ? normalizeSingleLine(value) : value),
    z
      .string({ required_error: `${label} is required` })
      .min(min, `${label} must be at least ${min} characters`)
      .max(max, `${label} must be ${max} characters or fewer`),
  );
}

function optionalSingleLineField(max: number): z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, unknown> {
  return z.preprocess(
    (value) => {
      if (typeof value !== 'string') return value;
      const normalized = normalizeSingleLine(value);
      return normalized || undefined;
    },
    z.string().max(max).optional(),
  );
}

const contactSchema = z.object({
  name: singleLineField(2, 100, 'Name'),
  company: singleLineField(2, 150, 'Company'),
  email: z.preprocess(
    (value) => (typeof value === 'string' ? normalizeSingleLine(value).toLowerCase() : value),
    z
      .string({ required_error: 'Email is required' })
      .email('Invalid email address')
      .max(254, 'Email must be 254 characters or fewer')
      .refine((value) => !/[\r\n]/.test(value), 'Invalid email address'),
  ),
  phone: z.preprocess(
    (value) => (typeof value === 'string' ? normalizeSingleLine(value) : value),
    z
      .string({ required_error: 'Phone is required' })
      .min(10, 'Phone number must be at least 10 digits')
      .max(30, 'Phone number is too long')
      .regex(/^[+]?[\d\s().-]{10,30}$/, 'Invalid phone number'),
  ),
  message: z.preprocess(
    (value) => (typeof value === 'string' ? normalizeMultiline(value) : value),
    z
      .string({ required_error: 'Message is required' })
      .min(10, 'Message must be at least 10 characters')
      .max(3000, 'Message is too long')
      .refine((value) => (value.match(/https?:\/\//gi) || []).length <= 3, 'Message contains too many links'),
  ),
  honeypot: optionalSingleLineField(200),
  productName: optionalSingleLineField(150),
  productCategory: optionalSingleLineField(100),
  formStartedAt: z.union([z.string(), z.number()]).optional(),
});

function getRequestIp(req: Request): string | undefined {
  const forwardedFor = req.headers['x-forwarded-for'];
  const firstForwardedIp =
    typeof forwardedFor === 'string'
      ? forwardedFor.split(',')[0]?.trim()
      : Array.isArray(forwardedFor)
        ? forwardedFor[0]?.split(',')[0]?.trim()
        : undefined;

  return normalizeSingleLine(firstForwardedIp || req.ip || '').slice(0, 64) || undefined;
}

function getUserAgent(req: Request): string | undefined {
  const userAgent = req.get('user-agent');
  return userAgent ? normalizeSingleLine(userAgent).slice(0, 512) : undefined;
}

function isLikelyBot(formStartedAt?: string | number): boolean {
  if (formStartedAt === undefined) return false;

  const startedAt =
    typeof formStartedAt === 'number'
      ? formStartedAt
      : /^\d+$/.test(formStartedAt)
        ? Number.parseInt(formStartedAt, 10)
        : Date.parse(formStartedAt);

  if (!Number.isFinite(startedAt)) return false;

  const elapsedMs = Date.now() - startedAt;
  return elapsedMs >= 0 && elapsedMs < MIN_FORM_COMPLETION_MS;
}

function buildFullMessage(payload: z.infer<typeof contactSchema>): string {
  if (!payload.productName) return payload.message;

  const productContext = `[Quote Request for: ${payload.productName}${
    payload.productCategory ? ` (${payload.productCategory})` : ''
  }]`;
  return `${productContext}\n\n${payload.message}`;
}

function fingerprintSubmission(email: string, phone: string, fullMessage: string): string {
  return createHash('sha256')
    .update([email, normalizeSingleLine(phone), normalizeMultiline(fullMessage)].join('|'))
    .digest('hex');
}

function deliveryFromResults(
  adminResult: Awaited<ReturnType<typeof sendAdminNotification>>,
  visitorResult: Awaited<ReturnType<typeof sendContactConfirmation>>,
): IEmailDelivery {
  return {
    adminStatus: adminResult.success ? 'sent' : 'failed',
    visitorStatus: visitorResult.success ? 'sent' : 'failed',
    adminMessageId: adminResult.id,
    visitorMessageId: visitorResult.id,
    adminError: adminResult.success ? undefined : adminResult.error,
    visitorError: visitorResult.success ? undefined : visitorResult.error,
    lastEvent: 'contact.emails_attempted',
    lastEventAt: new Date(),
  };
}

// POST /api/contact - Public
router.post(
  '/',
  validate(contactSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const payload = req.body as z.infer<typeof contactSchema>;

      if (payload.honeypot || isLikelyBot(payload.formStartedAt)) {
        res.status(200).json({
          success: true,
          message: 'Enquiry received. Our team will contact you within 1-2 business days.',
        });
        return;
      }

      const fullMessage = buildFullMessage(payload);
      const submissionFingerprint = fingerprintSubmission(payload.email, payload.phone, fullMessage);
      const duplicateSince = new Date(Date.now() - DUPLICATE_WINDOW_MS);
      const duplicate = await Lead.findOne({
        submissionFingerprint,
        createdAt: { $gte: duplicateSince },
      })
        .select('_id')
        .lean();

      if (duplicate) {
        res.status(200).json({
          success: true,
          message: 'Enquiry received. Our team will contact you within 1-2 business days.',
        });
        return;
      }

      const lead = await Lead.create({
        name: payload.name,
        company: payload.company,
        email: payload.email,
        phone: payload.phone,
        message: fullMessage,
        productName: payload.productName,
        productCategory: payload.productCategory,
        ipAddress: getRequestIp(req),
        userAgent: getUserAgent(req),
        submissionFingerprint,
        emailDelivery: {
          adminStatus: 'pending',
          visitorStatus: 'pending',
          lastEvent: 'contact.saved',
          lastEventAt: new Date(),
        },
      });

      const [adminResult, visitorResult] = await Promise.all([
        sendAdminNotification(lead),
        sendContactConfirmation(lead),
      ]);

      const emailDelivery = deliveryFromResults(adminResult, visitorResult);
      await Lead.findByIdAndUpdate(lead._id, { $set: { emailDelivery } }, { runValidators: true });

      res.status(201).json({
        success: true,
        message: 'Enquiry received. Our team will contact you within 1-2 business days.',
      });
    } catch (err) {
      next(err);
    }
  },
);

export default router;

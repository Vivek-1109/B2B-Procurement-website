import { Router, Request, Response, NextFunction } from 'express';
import type { WebhookEventPayload } from 'resend';
import resend from '../config/email';
import Lead, { EmailDeliveryState, ILead } from '../models/Lead';

const router = Router();

type RequestWithRawBody = Request & { rawBody?: Buffer };
type EmailChannel = 'admin' | 'visitor';

const eventStatusMap: Partial<Record<WebhookEventPayload['type'], EmailDeliveryState>> = {
  'email.sent': 'sent',
  'email.delivered': 'delivered',
  'email.delivery_delayed': 'delayed',
  'email.failed': 'failed',
  'email.bounced': 'bounced',
  'email.complained': 'complained',
  'email.suppressed': 'suppressed',
};

function getWebhookHeaders(req: Request): { id: string; timestamp: string; signature: string } | undefined {
  const id = req.get('webhook-id');
  const timestamp = req.get('webhook-timestamp');
  const signature = req.get('webhook-signature');

  if (!id || !timestamp || !signature) return undefined;
  return { id, timestamp, signature };
}

function hasEmailId(event: WebhookEventPayload): event is WebhookEventPayload & { data: { email_id: string } } {
  return Boolean(
    'data' in event &&
      event.data &&
      typeof event.data === 'object' &&
      'email_id' in event.data &&
      typeof event.data.email_id === 'string',
  );
}

function findChannel(lead: ILead, emailId: string): EmailChannel | undefined {
  if (lead.emailDelivery?.adminMessageId === emailId) return 'admin';
  if (lead.emailDelivery?.visitorMessageId === emailId) return 'visitor';
  return undefined;
}

function eventError(event: WebhookEventPayload): string | undefined {
  if (event.type === 'email.failed') return event.data.failed.reason;
  if (event.type === 'email.bounced') return event.data.bounce.message;
  if (event.type === 'email.suppressed') return event.data.suppressed.message;
  if (event.type === 'email.complained') return 'Recipient marked this message as spam.';
  return undefined;
}

router.post('/', async (req: RequestWithRawBody, res: Response, next: NextFunction): Promise<void> => {
  try {
    const webhookSecret = (process.env.RESEND_WEBHOOK_SECRET || '').trim();
    if (!webhookSecret) {
      res.status(503).json({ error: 'RESEND_WEBHOOK_SECRET is not configured.' });
      return;
    }

    const headers = getWebhookHeaders(req);
    if (!headers || !req.rawBody) {
      res.status(400).json({ error: 'Invalid Resend webhook request.' });
      return;
    }

    const event = resend.webhooks.verify({
      payload: req.rawBody.toString('utf8'),
      headers,
      webhookSecret,
    });

    const status = eventStatusMap[event.type];
    if (!status || !hasEmailId(event)) {
      res.status(200).json({ received: true });
      return;
    }

    const lead = await Lead.findOne({
      $or: [
        { 'emailDelivery.adminMessageId': event.data.email_id },
        { 'emailDelivery.visitorMessageId': event.data.email_id },
      ],
    });

    if (!lead) {
      res.status(200).json({ received: true });
      return;
    }

    const channel = findChannel(lead, event.data.email_id);
    if (!channel) {
      res.status(200).json({ received: true });
      return;
    }

    const set: Record<string, unknown> = {
      [`emailDelivery.${channel}Status`]: status,
      'emailDelivery.lastEvent': event.type,
      'emailDelivery.lastEventAt': new Date(event.created_at),
    };

    const error = eventError(event);
    if (error) {
      set[`emailDelivery.${channel}Error`] = error.slice(0, 1000);
    }

    await Lead.updateOne({ _id: lead._id }, { $set: set }, { runValidators: true });
    res.status(200).json({ received: true });
  } catch (err) {
    next(err);
  }
});

export default router;

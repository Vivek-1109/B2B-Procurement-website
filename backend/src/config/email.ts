import { Resend } from 'resend';
import { ILead } from '../models/Lead';

type EmailLabel = 'AdminNotification' | 'VisitorConfirmation';

export interface EmailSendResult {
  success: boolean;
  id?: string;
  error?: string;
  attempts: number;
  recipient: string;
  sandboxed: boolean;
}

interface EmailConfig {
  adminEmail: string;
  fromEmail: string;
  replyToEmail: string;
  sandboxMode: boolean;
}

const resend = new Resend(process.env.RESEND_API_KEY || 'missing_resend_api_key');

const COMPANY_NAME = cleanEnv(process.env.COMPANY_NAME) || 'APR Services Enterprise';
const SAFE_COMPANY_NAME = sanitizeDisplayName(COMPANY_NAME);
const WEBSITE_URL = cleanEnv(process.env.WEBSITE_URL) || 'https://aprsvs.com';
const COMPANY_PHONE = cleanEnv(process.env.COMPANY_PHONE) || '+91 99113 94456';
const COMPANY_ADDRESS =
  cleanEnv(process.env.COMPANY_ADDRESS) ||
  'RZ-B3 243/D, Vijay Enclave, South West Delhi, New Delhi-110045';
const LOGO_URL = cleanEnv(process.env.EMAIL_LOGO_URL);
const BRAND_COLOR = sanitizeHexColor(process.env.EMAIL_BRAND_COLOR, '#578E7E');
const DARK_COLOR = '#3D3D3D';
const LIGHT_COLOR = '#FFFAEC';
const SEND_TIMEOUT_MS = parsePositiveInt(process.env.EMAIL_SEND_TIMEOUT_MS, 10000);
const SEND_RETRIES = parsePositiveInt(process.env.EMAIL_SEND_RETRIES, 2);

function cleanEnv(value?: string): string {
  return (value || '').trim();
}

function parsePositiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value || '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function boolEnv(name: string): boolean {
  return cleanEnv(process.env[name]).toLowerCase() === 'true';
}

function isEmail(value: string): boolean {
  return /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/.test(value);
}

function hasHeaderInjection(value: string): boolean {
  return /[\r\n]/.test(value);
}

function sanitizeHeader(value: string): string {
  return value.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function sanitizeDisplayName(value: string): string {
  return sanitizeHeader(value).replace(/[<>"]/g, '').trim() || 'APR Services Enterprise';
}

function sanitizeHexColor(value: string | undefined, fallback: string): string {
  const color = cleanEnv(value);
  return /^#[0-9a-fA-F]{6}$/.test(color) ? color : fallback;
}

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttr(value: unknown): string {
  return escapeHtml(value).replace(/`/g, '&#96;');
}

function lineBreaks(value: unknown): string {
  return escapeHtml(value).replace(/\r\n|\r|\n/g, '<br>');
}

function formatDate(date: Date | string | undefined): string {
  const value = date ? new Date(date) : new Date();
  return value.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function leadId(lead: ILead): string {
  return lead.id;
}

function renderLogo(): string {
  if (LOGO_URL && /^https:\/\//i.test(LOGO_URL)) {
    return `<img src="${escapeAttr(LOGO_URL)}" width="56" height="56" alt="${escapeAttr(
      COMPANY_NAME,
    )}" style="display:block;margin:0 auto 14px;border:0;max-width:56px;height:auto;">`;
  }

  return `
    <div style="width:56px;height:56px;margin:0 auto 14px;border-radius:8px;background:rgba(255,255,255,0.16);color:#ffffff;line-height:56px;text-align:center;font-size:16px;font-weight:800;letter-spacing:0.4px;">
      APR
    </div>
  `;
}

function renderSocialLinks(): string {
  const links = [
    ['LinkedIn', cleanEnv(process.env.SOCIAL_LINKEDIN_URL)],
    ['Facebook', cleanEnv(process.env.SOCIAL_FACEBOOK_URL)],
    ['Instagram', cleanEnv(process.env.SOCIAL_INSTAGRAM_URL)],
    ['X', cleanEnv(process.env.SOCIAL_X_URL)],
  ].filter(([, url]) => /^https:\/\//i.test(url));

  if (links.length === 0) return '';

  return `
    <p style="margin:14px 0 0;text-align:center;font-size:12px;line-height:1.6;">
      ${links
        .map(
          ([label, url]) =>
            `<a href="${escapeAttr(url)}" style="color:${BRAND_COLOR};text-decoration:none;margin:0 6px;">${escapeHtml(
              label,
            )}</a>`,
        )
        .join('')}
    </p>
  `;
}

function getEmailConfig(): { config?: EmailConfig; error?: string } {
  const apiKey = cleanEnv(process.env.RESEND_API_KEY);
  const fromEmail = cleanEnv(process.env.EMAIL_FROM);
  const adminEmail = cleanEnv(process.env.EMAIL_TO);
  const replyToEmail = cleanEnv(process.env.EMAIL_REPLY_TO) || adminEmail;
  const sandboxMode = boolEnv('EMAIL_SANDBOX_MODE');
  const domainVerified = boolEnv('EMAIL_DOMAIN_VERIFIED');

  if (!apiKey) return { error: 'RESEND_API_KEY is missing.' };
  if (!fromEmail) return { error: 'EMAIL_FROM is missing.' };
  if (!adminEmail) return { error: 'EMAIL_TO is missing.' };
  if (!isEmail(fromEmail)) return { error: 'EMAIL_FROM must be a valid email address.' };
  if (!isEmail(adminEmail)) return { error: 'EMAIL_TO must be a valid email address.' };
  if (!isEmail(replyToEmail)) return { error: 'EMAIL_REPLY_TO must be a valid email address.' };
  if ([fromEmail, adminEmail, replyToEmail].some(hasHeaderInjection)) {
    return { error: 'Email configuration contains invalid header characters.' };
  }

  const usesResendSharedDomain = /@(resend\.dev|resend\.com)$/i.test(fromEmail);
  if (!sandboxMode && usesResendSharedDomain) {
    return { error: 'EMAIL_FROM must use your verified domain in production.' };
  }

  if (!sandboxMode && !domainVerified) {
    return { error: 'EMAIL_DOMAIN_VERIFIED must be true before sending production email.' };
  }

  return {
    config: {
      adminEmail,
      fromEmail,
      replyToEmail,
      sandboxMode,
    },
  };
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timer: NodeJS.Timeout | undefined;

  const timeout = new Promise<T>((_resolve, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`Resend request timed out after ${timeoutMs}ms.`));
    }, timeoutMs);
  });

  return Promise.race([promise, timeout]).finally(() => {
    if (timer) clearTimeout(timer);
  });
}

async function sendEmail(opts: {
  to: string;
  replyTo?: string;
  subject: string;
  html: string;
  text: string;
  label: EmailLabel;
  idempotencyKey: string;
  tags: Record<string, string>;
}): Promise<EmailSendResult> {
  const { config, error } = getEmailConfig();
  const safeSubject = sanitizeHeader(opts.subject);

  if (!config) {
    console.error(`[Email][${opts.label}] Configuration error: ${error}`);
    return {
      success: false,
      error,
      attempts: 0,
      recipient: opts.to,
      sandboxed: false,
    };
  }

  const actualTo = config.sandboxMode && opts.to !== config.adminEmail ? config.adminEmail : opts.to;
  const actualSubject =
    config.sandboxMode && opts.to !== config.adminEmail
      ? `[SANDBOX - For: ${sanitizeHeader(opts.to)}] ${safeSubject}`
      : safeSubject;
  const replyTo = opts.replyTo || config.replyToEmail;

  if (!isEmail(opts.to) || !isEmail(actualTo) || !isEmail(replyTo)) {
    return {
      success: false,
      error: 'Recipient or reply-to address is invalid.',
      attempts: 0,
      recipient: actualTo,
      sandboxed: config.sandboxMode,
    };
  }

  let lastError = '';
  const attemptsAllowed = Math.max(1, SEND_RETRIES + 1);

  for (let attempt = 1; attempt <= attemptsAllowed; attempt += 1) {
    try {
      const { data, error: resendError } = await withTimeout(
        resend.emails.send(
          {
            from: `${SAFE_COMPANY_NAME} <${config.fromEmail}>`,
            to: actualTo,
            replyTo,
            subject: actualSubject,
            html: opts.html,
            text: opts.text,
            tags: Object.entries(opts.tags).map(([name, value]) => ({ name, value })),
          },
          { idempotencyKey: opts.idempotencyKey },
        ),
        SEND_TIMEOUT_MS,
      );

      if (resendError) {
        lastError = JSON.stringify(resendError);
        console.error(`[Email][${opts.label}] Resend API error on attempt ${attempt}: ${lastError}`);
      } else {
        return {
          success: true,
          id: data?.id,
          attempts: attempt,
          recipient: actualTo,
          sandboxed: config.sandboxMode,
        };
      }
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
      console.error(`[Email][${opts.label}] Send failed on attempt ${attempt}: ${lastError}`);
    }
  }

  return {
    success: false,
    error: lastError || 'Unknown Resend send failure.',
    attempts: attemptsAllowed,
    recipient: actualTo,
    sandboxed: config.sandboxMode,
  };
}

function emailShell(title: string, preview: string, body: string): string {
  return `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="x-apple-disable-message-reformatting">
        <title>${escapeHtml(title)}</title>
        <style>
          @media only screen and (max-width: 640px) {
            .container { width: 100% !important; }
            .content { padding: 28px 22px !important; }
            .stack { display: block !important; width: 100% !important; }
          }
        </style>
      </head>
      <body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;color:${DARK_COLOR};">
        <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
          ${escapeHtml(preview)}
        </div>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 12px;">
          <tr>
            <td align="center">
              <table role="presentation" class="container" width="640" cellpadding="0" cellspacing="0" style="width:640px;max-width:640px;background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e9e2cf;">
                ${body}
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

function emailHeader(subtitle: string): string {
  return `
    <tr>
      <td style="background:${DARK_COLOR};padding:34px 28px;text-align:center;">
        ${renderLogo()}
        <h1 style="margin:0;color:#ffffff;font-size:24px;line-height:1.25;font-weight:700;">${escapeHtml(COMPANY_NAME)}</h1>
        <p style="margin:8px 0 0;color:#d8eee8;font-size:13px;line-height:1.5;">${escapeHtml(subtitle)}</p>
      </td>
    </tr>
  `;
}

function emailFooter(): string {
  return `
    <tr>
      <td style="background:#f8f8f8;padding:22px 28px;border-top:1px solid #eeeeee;">
        <p style="margin:0;text-align:center;color:#777777;font-size:12px;line-height:1.7;">
          <strong>${escapeHtml(COMPANY_NAME)}</strong><br>
          ${escapeHtml(COMPANY_ADDRESS)}<br>
          <a href="${escapeAttr(WEBSITE_URL)}" style="color:${BRAND_COLOR};text-decoration:none;">${escapeHtml(
            WEBSITE_URL,
          )}</a> |
          <a href="tel:${escapeAttr(COMPANY_PHONE.replace(/\s+/g, ''))}" style="color:${BRAND_COLOR};text-decoration:none;">${escapeHtml(
            COMPANY_PHONE,
          )}</a>
        </p>
        ${renderSocialLinks()}
      </td>
    </tr>
  `;
}

export const sendContactConfirmation = async (lead: ILead): Promise<EmailSendResult> => {
  const subject = `Thank you for contacting ${COMPANY_NAME}`;
  const safeName = escapeHtml(lead.name);
  const body = `
    ${emailHeader('B2B procurement inquiry received')}
    <tr>
      <td class="content" style="padding:38px 44px;">
        <h2 style="margin:0 0 14px;color:${DARK_COLOR};font-size:22px;line-height:1.3;">Thank you, ${safeName}</h2>
        <p style="margin:0 0 22px;color:#555555;font-size:15px;line-height:1.7;">
          We have received your procurement inquiry. Our team will review your requirements and contact you within 1-2 business days.
        </p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${LIGHT_COLOR};border-left:4px solid ${BRAND_COLOR};border-radius:6px;margin:0 0 26px;">
          <tr>
            <td style="padding:20px;">
              <p style="margin:0 0 12px;color:${DARK_COLOR};font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.4px;">Your inquiry summary</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td class="stack" style="padding:5px 0;color:#777777;font-size:13px;width:120px;">Name</td>
                  <td class="stack" style="padding:5px 0;color:${DARK_COLOR};font-size:13px;">${escapeHtml(lead.name)}</td>
                </tr>
                <tr>
                  <td class="stack" style="padding:5px 0;color:#777777;font-size:13px;width:120px;">Company</td>
                  <td class="stack" style="padding:5px 0;color:${DARK_COLOR};font-size:13px;">${escapeHtml(lead.company)}</td>
                </tr>
                <tr>
                  <td class="stack" style="padding:5px 0;color:#777777;font-size:13px;width:120px;">Email</td>
                  <td class="stack" style="padding:5px 0;color:${DARK_COLOR};font-size:13px;">${escapeHtml(lead.email)}</td>
                </tr>
                <tr>
                  <td class="stack" style="padding:5px 0;color:#777777;font-size:13px;width:120px;">Phone</td>
                  <td class="stack" style="padding:5px 0;color:${DARK_COLOR};font-size:13px;">${escapeHtml(lead.phone)}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <p style="margin:0 0 12px;color:${DARK_COLOR};font-size:15px;font-weight:700;">What happens next?</p>
        <ol style="margin:0 0 24px;padding-left:20px;color:#555555;font-size:14px;line-height:1.7;">
          <li>We review the products, quantity, certification needs, and delivery location.</li>
          <li>We check availability and pricing with our supplier network.</li>
          <li>You receive a practical response or quote from our procurement team.</li>
        </ol>
        <p style="margin:0;color:#666666;font-size:14px;line-height:1.7;">
          For urgent requirements, call us at
          <a href="tel:${escapeAttr(COMPANY_PHONE.replace(/\s+/g, ''))}" style="color:${BRAND_COLOR};font-weight:700;text-decoration:none;">${escapeHtml(
            COMPANY_PHONE,
          )}</a>.
        </p>
      </td>
    </tr>
    ${emailFooter()}
  `;

  const html = emailShell(subject, 'Your procurement inquiry has been received.', body);
  const text = [
    `Thank you, ${lead.name}.`,
    '',
    `We have received your procurement inquiry at ${COMPANY_NAME}.`,
    'Our team will review your requirements and contact you within 1-2 business days.',
    '',
    'Inquiry summary:',
    `Name: ${lead.name}`,
    `Company: ${lead.company}`,
    `Email: ${lead.email}`,
    `Phone: ${lead.phone}`,
    '',
    `Website: ${WEBSITE_URL}`,
    `Phone: ${COMPANY_PHONE}`,
  ].join('\n');

  return sendEmail({
    to: lead.email,
    replyTo: cleanEnv(process.env.EMAIL_REPLY_TO) || cleanEnv(process.env.EMAIL_TO),
    subject,
    html,
    text,
    label: 'VisitorConfirmation',
    idempotencyKey: `lead-${leadId(lead)}-visitor-v2`,
    tags: { type: 'contact_confirmation', lead_id: leadId(lead) },
  });
};

export const sendAdminNotification = async (lead: ILead): Promise<EmailSendResult> => {
  const receivedAt = formatDate(lead.createdAt);
  const subject = `New procurement inquiry: ${sanitizeHeader(lead.name)} - ${sanitizeHeader(lead.company)}`;
  const mailtoSubject = encodeURIComponent(`Re: Your ${COMPANY_NAME} procurement inquiry`);
  const mailtoBody = encodeURIComponent(`Dear ${lead.name},\n\nThank you for contacting ${COMPANY_NAME}.`);
  const body = `
    ${emailHeader('New contact form submission')}
    <tr>
      <td class="content" style="padding:36px 44px;">
        <h2 style="margin:0 0 18px;color:${DARK_COLOR};font-size:21px;line-height:1.3;">New inquiry received</h2>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eadfbe;border-radius:6px;overflow:hidden;">
          ${[
            ['Name', escapeHtml(lead.name)],
            ['Email', `<a href="mailto:${escapeAttr(lead.email)}" style="color:${BRAND_COLOR};text-decoration:none;">${escapeHtml(lead.email)}</a>`],
            ['Phone', `<a href="tel:${escapeAttr(lead.phone)}" style="color:${BRAND_COLOR};text-decoration:none;">${escapeHtml(lead.phone)}</a>`],
            ['Company', escapeHtml(lead.company)],
            ['Time', escapeHtml(`${receivedAt} IST`)],
            ['IP', escapeHtml(lead.ipAddress || 'Not captured')],
            ['User Agent', escapeHtml(lead.userAgent || 'Not captured')],
          ]
            .map(
              ([label, value], index) => `
                <tr style="background:${index % 2 === 0 ? '#ffffff' : '#fbfaf6'};">
                  <td class="stack" style="padding:12px 14px;width:130px;color:#777777;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.4px;vertical-align:top;">${label}</td>
                  <td class="stack" style="padding:12px 14px;color:${DARK_COLOR};font-size:13px;line-height:1.6;vertical-align:top;">${value}</td>
                </tr>
              `,
            )
            .join('')}
          <tr style="background:${LIGHT_COLOR};">
            <td class="stack" style="padding:12px 14px;width:130px;color:#777777;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.4px;vertical-align:top;">Message</td>
            <td class="stack" style="padding:12px 14px;color:${DARK_COLOR};font-size:13px;line-height:1.7;vertical-align:top;">${lineBreaks(
              lead.message,
            )}</td>
          </tr>
        </table>
        <p style="margin:26px 0 0;text-align:center;">
          <a href="mailto:${escapeAttr(lead.email)}?subject=${mailtoSubject}&body=${mailtoBody}" style="display:inline-block;background:${BRAND_COLOR};color:#ffffff;text-decoration:none;border-radius:6px;padding:13px 24px;font-size:14px;font-weight:700;">
            Reply to ${escapeHtml(lead.name)}
          </a>
        </p>
      </td>
    </tr>
    ${emailFooter()}
  `;

  const html = emailShell(subject, 'A visitor submitted the contact form.', body);
  const text = [
    'New procurement inquiry received.',
    '',
    `Name: ${lead.name}`,
    `Email: ${lead.email}`,
    `Phone: ${lead.phone}`,
    `Company: ${lead.company}`,
    `Time: ${receivedAt} IST`,
    `IP: ${lead.ipAddress || 'Not captured'}`,
    `User Agent: ${lead.userAgent || 'Not captured'}`,
    '',
    'Message:',
    lead.message,
  ].join('\n');

  return sendEmail({
    to: cleanEnv(process.env.EMAIL_TO),
    replyTo: lead.email,
    subject,
    html,
    text,
    label: 'AdminNotification',
    idempotencyKey: `lead-${leadId(lead)}-admin-v2`,
    tags: { type: 'contact_admin', lead_id: leadId(lead) },
  });
};

export default resend;

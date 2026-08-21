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
const BRAND_COLOR = sanitizeHexColor(process.env.EMAIL_BRAND_COLOR, '#1557B0');
const BRAND_DARK = '#0B2A4A';
const TEXT_DARK = '#1F2937';
const TEXT_MUTED = '#6B7280';
const BG_PAGE = '#F4F8FC';
const BG_CARD = '#FFFFFF';
const BG_SUBTLE = '#F8FAFD';
const BORDER_COLOR = '#E5E7EB';
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

function getValidLogoUrl(): string | null {
  const envLogo = cleanEnv(process.env.EMAIL_LOGO_URL);
  // Email clients cannot display SVGs in <img> tags
  if (envLogo && /^https:\/\//i.test(envLogo) && !envLogo.toLowerCase().endsWith('.svg')) {
    return envLogo;
  }
  if (WEBSITE_URL && /^https:\/\//i.test(WEBSITE_URL)) {
    return `${WEBSITE_URL.replace(/\/+$/, '')}/apr-logo.jpg`;
  }
  return null;
}

function renderLogo(): string {
  const logoUrl = getValidLogoUrl();

  if (logoUrl) {
    return `
      <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:0 auto 16px auto;border-collapse:collapse;">
        <tr>
          <td align="center" style="background:#ffffff;padding:8px 16px;border-radius:10px;box-shadow:0 2px 8px rgba(0,0,0,0.12);">
            <img src="${escapeAttr(logoUrl)}" width="120" height="auto" alt="${escapeAttr(
              COMPANY_NAME,
            )}" style="display:block;max-height:42px;width:auto;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;" />
          </td>
        </tr>
      </table>
    `;
  }

  return `
    <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:0 auto 16px auto;border-collapse:collapse;">
      <tr>
        <td align="center" style="width:48px;height:48px;background:#ffffff;border-radius:10px;font-size:18px;font-weight:900;color:${BRAND_COLOR};letter-spacing:0.5px;text-align:center;vertical-align:middle;box-shadow:0 2px 8px rgba(0,0,0,0.12);">
          APR
        </td>
      </tr>
    </table>
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
            `<a href="${escapeAttr(url)}" style="color:${BRAND_COLOR};font-weight:600;text-decoration:none;margin:0 8px;">${escapeHtml(
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
  return `<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>${escapeHtml(title)}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    body, table, td, p, a, li, blockquote { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; background-color: ${BG_PAGE}; }
    @media only screen and (max-width: 620px) {
      .container { width: 100% !important; max-width: 100% !important; }
      .content { padding: 26px 18px !important; }
      .stack { display: block !important; width: 100% !important; box-sizing: border-box !important; }
      .btn-stack { display: block !important; width: 100% !important; margin-bottom: 10px !important; text-align: center !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:${BG_PAGE};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${TEXT_DARK};">
  <div style="display:none;font-size:1px;color:${BG_PAGE};line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    ${escapeHtml(preview)}
    &#847;&zwnj;&nbsp;&#8199;&shy;&#847;&zwnj;&nbsp;&#8199;&shy;&#847;&zwnj;&nbsp;&#8199;&shy;&#847;&zwnj;&nbsp;&#8199;&shy;&#847;&zwnj;&nbsp;&#8199;&shy;&#847;&zwnj;&nbsp;&#8199;&shy;
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${BG_PAGE};padding:32px 12px;">
    <tr>
      <td align="center">
        <!--[if (gte mso 9)|(IE)]>
        <table role="presentation" align="center" border="0" cellspacing="0" cellpadding="0" width="600">
        <tr>
        <td align="center" valign="top" width="600">
        <![endif]-->
        <table role="presentation" class="container" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:${BG_CARD};border-radius:12px;overflow:hidden;border:1px solid ${BORDER_COLOR};box-shadow:0 4px 18px rgba(11,42,74,0.06);">
          ${body}
        </table>
        <!--[if (gte mso 9)|(IE)]>
        </td>
        </tr>
        </table>
        <![endif]-->
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function emailHeader(badgeText: string, subtitle?: string): string {
  return `
    <tr>
      <td style="background:${BRAND_DARK};padding:34px 28px 28px;text-align:center;border-bottom:3px solid ${BRAND_COLOR};">
        ${renderLogo()}
        <h1 style="margin:0;color:#ffffff;font-size:22px;line-height:1.3;font-weight:800;letter-spacing:-0.2px;">
          ${escapeHtml(COMPANY_NAME)}
        </h1>
        <div style="margin:10px 0 0;">
          <span style="display:inline-block;background:rgba(255,255,255,0.12);color:#EBF3FC;padding:4px 14px;border-radius:20px;font-size:12px;font-weight:600;letter-spacing:0.4px;text-transform:uppercase;">
            ${escapeHtml(badgeText)}
          </span>
        </div>
        ${
          subtitle
            ? `<p style="margin:8px 0 0;color:#94A3B8;font-size:13px;line-height:1.5;">${escapeHtml(
                subtitle,
              )}</p>`
            : ''
        }
      </td>
    </tr>
  `;
}

function emailFooter(): string {
  return `
    <tr>
      <td style="background:#F8FAFC;padding:26px 28px;border-top:1px solid ${BORDER_COLOR};text-align:center;">
        <p style="margin:0 0 6px;color:${TEXT_DARK};font-size:13px;font-weight:700;">
          ${escapeHtml(COMPANY_NAME)}
        </p>
        <p style="margin:0 0 10px;color:${TEXT_MUTED};font-size:12px;line-height:1.6;">
          ${escapeHtml(COMPANY_ADDRESS)}
        </p>
        <p style="margin:0;color:${TEXT_MUTED};font-size:12px;line-height:1.6;">
          <a href="${escapeAttr(WEBSITE_URL)}" style="color:${BRAND_COLOR};font-weight:600;text-decoration:none;">${escapeHtml(
            WEBSITE_URL.replace(/^https?:\/\//, ''),
          )}</a>
          &nbsp;&bull;&nbsp;
          <a href="tel:${escapeAttr(COMPANY_PHONE.replace(/\s+/g, ''))}" style="color:${BRAND_COLOR};font-weight:600;text-decoration:none;">${escapeHtml(
            COMPANY_PHONE,
          )}</a>
        </p>
        ${renderSocialLinks()}
        <p style="margin:16px 0 0;color:#9CA3AF;font-size:11px;line-height:1.5;">
          This is an automated communication regarding your procurement inquiry.
        </p>
      </td>
    </tr>
  `;
}

export const sendContactConfirmation = async (lead: ILead): Promise<EmailSendResult> => {
  const subject = `Thank you for contacting ${COMPANY_NAME} — Inquiry Received`;
  const safeName = escapeHtml(lead.name);
  const body = `
    ${emailHeader('Inquiry Received', 'B2B Enterprise Sourcing & Procurement')}
    <tr>
      <td class="content" style="padding:36px 38px;">
        <h2 style="margin:0 0 12px;color:${TEXT_DARK};font-size:20px;line-height:1.35;font-weight:700;">
          Dear ${safeName},
        </h2>
        <p style="margin:0 0 22px;color:#4B5563;font-size:15px;line-height:1.7;">
          Thank you for reaching out to <strong>${escapeHtml(
            COMPANY_NAME,
          )}</strong>. We have successfully received your procurement inquiry. Our sourcing specialists are currently reviewing your requirements and will contact you within <strong>1–2 business days</strong>.
        </p>

        <!-- Inquiry Summary Card -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BG_SUBTLE};border:1px solid #DCE9F9;border-left:4px solid ${BRAND_COLOR};border-radius:8px;margin:0 0 28px;overflow:hidden;">
          <tr>
            <td style="padding:20px 22px;">
              <p style="margin:0 0 14px;color:${BRAND_DARK};font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:0.6px;">
                Your Inquiry Summary
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td class="stack" style="padding:6px 0;color:${TEXT_MUTED};font-size:13px;font-weight:600;width:130px;">Name</td>
                  <td class="stack" style="padding:6px 0;color:${TEXT_DARK};font-size:13px;font-weight:500;">${escapeHtml(
                    lead.name,
                  )}</td>
                </tr>
                <tr>
                  <td class="stack" style="padding:6px 0;color:${TEXT_MUTED};font-size:13px;font-weight:600;width:130px;">Company</td>
                  <td class="stack" style="padding:6px 0;color:${TEXT_DARK};font-size:13px;font-weight:500;">${escapeHtml(
                    lead.company,
                  )}</td>
                </tr>
                <tr>
                  <td class="stack" style="padding:6px 0;color:${TEXT_MUTED};font-size:13px;font-weight:600;width:130px;">Email</td>
                  <td class="stack" style="padding:6px 0;color:${TEXT_DARK};font-size:13px;font-weight:500;">${escapeHtml(
                    lead.email,
                  )}</td>
                </tr>
                <tr>
                  <td class="stack" style="padding:6px 0;color:${TEXT_MUTED};font-size:13px;font-weight:600;width:130px;">Phone</td>
                  <td class="stack" style="padding:6px 0;color:${TEXT_DARK};font-size:13px;font-weight:500;">${escapeHtml(
                    lead.phone,
                  )}</td>
                </tr>
                ${
                  lead.productName
                    ? `
                <tr>
                  <td class="stack" style="padding:6px 0;color:${TEXT_MUTED};font-size:13px;font-weight:600;width:130px;">Product</td>
                  <td class="stack" style="padding:6px 0;color:${BRAND_COLOR};font-size:13px;font-weight:700;">${escapeHtml(
                    lead.productName,
                  )}</td>
                </tr>
                `
                    : ''
                }
                ${
                  lead.productCategory
                    ? `
                <tr>
                  <td class="stack" style="padding:6px 0;color:${TEXT_MUTED};font-size:13px;font-weight:600;width:130px;">Category</td>
                  <td class="stack" style="padding:6px 0;color:${TEXT_DARK};font-size:13px;font-weight:500;">${escapeHtml(
                    lead.productCategory,
                  )}</td>
                </tr>
                `
                    : ''
                }
              </table>
            </td>
          </tr>
        </table>

        <!-- Next Steps -->
        <p style="margin:0 0 14px;color:${TEXT_DARK};font-size:15px;font-weight:700;">
          What happens next?
        </p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 26px;">
          <tr>
            <td style="padding:8px 0;vertical-align:top;width:28px;">
              <div style="width:22px;height:22px;border-radius:50%;background:${BRAND_COLOR};color:#ffffff;font-size:12px;font-weight:700;line-height:22px;text-align:center;">1</div>
            </td>
            <td style="padding:8px 0 8px 10px;vertical-align:top;">
              <strong style="color:${TEXT_DARK};font-size:14px;">Requirement Evaluation:</strong>
              <div style="color:#6B7280;font-size:13px;line-height:1.5;margin-top:2px;">Our specialists analyze your specifications, quantities, and certification requirements.</div>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 0;vertical-align:top;width:28px;">
              <div style="width:22px;height:22px;border-radius:50%;background:${BRAND_COLOR};color:#ffffff;font-size:12px;font-weight:700;line-height:22px;text-align:center;">2</div>
            </td>
            <td style="padding:8px 0 8px 10px;vertical-align:top;">
              <strong style="color:${TEXT_DARK};font-size:14px;">Sourcing & Availability Check:</strong>
              <div style="color:#6B7280;font-size:13px;line-height:1.5;margin-top:2px;">We verify inventory availability, lead times, and competitive pricing across our verified supplier network.</div>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 0;vertical-align:top;width:28px;">
              <div style="width:22px;height:22px;border-radius:50%;background:${BRAND_COLOR};color:#ffffff;font-size:12px;font-weight:700;line-height:22px;text-align:center;">3</div>
            </td>
            <td style="padding:8px 0 8px 10px;vertical-align:top;">
              <strong style="color:${TEXT_DARK};font-size:14px;">Formal Quotation & Contact:</strong>
              <div style="color:#6B7280;font-size:13px;line-height:1.5;margin-top:2px;">You will receive an official quotation and dedicated procurement support within 1–2 business days.</div>
            </td>
          </tr>
        </table>

        <!-- Urgent Contact Box -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F4F8FC;border:1px solid ${BORDER_COLOR};border-radius:8px;padding:16px 20px;margin:0 0 24px;">
          <tr>
            <td>
              <p style="margin:0;color:#4B5563;font-size:13px;line-height:1.6;">
                <strong>Need immediate assistance?</strong> For urgent procurement requirements, call our direct sourcing desk at
                <a href="tel:${escapeAttr(COMPANY_PHONE.replace(/\s+/g, ''))}" style="color:${BRAND_COLOR};font-weight:700;text-decoration:none;">${escapeHtml(
                  COMPANY_PHONE,
                )}</a>
                or simply reply to this email.
              </p>
            </td>
          </tr>
        </table>

        <div style="text-align:center;margin-top:28px;">
          <a href="${escapeAttr(WEBSITE_URL)}/products" style="display:inline-block;background:${BRAND_COLOR};color:#ffffff;text-decoration:none;border-radius:6px;padding:12px 28px;font-size:14px;font-weight:700;box-shadow:0 2px 6px rgba(21,87,176,0.25);">
            Explore Product Catalog &rarr;
          </a>
        </div>
      </td>
    </tr>
    ${emailFooter()}
  `;

  const html = emailShell(subject, 'Your procurement inquiry has been received by APR Services Enterprise.', body);
  const text = [
    `Thank you, ${lead.name}.`,
    '',
    `We have received your procurement inquiry at ${COMPANY_NAME}.`,
    'Our sourcing team will review your requirements and contact you within 1-2 business days.',
    '',
    'Inquiry summary:',
    `Name: ${lead.name}`,
    `Company: ${lead.company}`,
    `Email: ${lead.email}`,
    `Phone: ${lead.phone}`,
    ...(lead.productName ? [`Product: ${lead.productName}`] : []),
    ...(lead.productCategory ? [`Category: ${lead.productCategory}`] : []),
    '',
    `Direct Desk: ${COMPANY_PHONE}`,
    `Website: ${WEBSITE_URL}`,
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
  const subject = `[New Inquiry] ${sanitizeHeader(lead.name)} — ${sanitizeHeader(lead.company)}`;
  const mailtoSubject = encodeURIComponent(`Re: Procurement Inquiry — ${COMPANY_NAME}`);
  const mailtoBody = encodeURIComponent(`Dear ${lead.name},\n\nThank you for contacting ${COMPANY_NAME} regarding your procurement inquiry.`);

  const userDetails = [
    ['Contact Name', escapeHtml(lead.name)],
    ['Company', escapeHtml(lead.company)],
    ['Email', `<a href="mailto:${escapeAttr(lead.email)}" style="color:${BRAND_COLOR};font-weight:600;text-decoration:none;">${escapeHtml(lead.email)}</a>`],
    ['Phone', `<a href="tel:${escapeAttr(lead.phone)}" style="color:${BRAND_COLOR};font-weight:600;text-decoration:none;">${escapeHtml(lead.phone)}</a>`],
    ...(lead.productName ? [['Requested Product', `<strong style="color:${BRAND_COLOR};">${escapeHtml(lead.productName)}</strong>`]] : []),
    ...(lead.productCategory ? [['Category', escapeHtml(lead.productCategory)]] : []),
    ['Submitted At', escapeHtml(`${receivedAt} IST`)],
  ];

  const body = `
    ${emailHeader('New Lead Notification', 'B2B Procurement Inquiry')}
    <tr>
      <td class="content" style="padding:36px 38px;">
        <h2 style="margin:0 0 12px;color:${TEXT_DARK};font-size:20px;line-height:1.35;font-weight:700;">
          New Procurement Inquiry Received
        </h2>
        <p style="margin:0 0 22px;color:#4B5563;font-size:14px;line-height:1.6;">
          A visitor has submitted a new procurement inquiry via the website contact form. The user details are provided below:
        </p>

        <!-- Lead Details Table (IP and Device info hidden) -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${BORDER_COLOR};border-radius:8px;overflow:hidden;margin:0 0 22px;">
          ${userDetails
            .map(
              ([label, value], index) => `
                <tr style="background:${index % 2 === 0 ? '#FFFFFF' : '#F9FAFB'};border-bottom:1px solid ${BORDER_COLOR};">
                  <td class="stack" style="padding:12px 16px;width:140px;color:${TEXT_MUTED};font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.4px;vertical-align:top;">${label}</td>
                  <td class="stack" style="padding:12px 16px;color:${TEXT_DARK};font-size:13px;line-height:1.6;vertical-align:top;">${value}</td>
                </tr>
              `,
            )
            .join('')}
        </table>

        <!-- Message Box -->
        <div style="margin:0 0 26px;">
          <p style="margin:0 0 8px;color:${TEXT_DARK};font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.4px;">
            Inquiry Message & Requirements
          </p>
          <div style="background:${BG_SUBTLE};border:1px solid #DCE9F9;border-left:4px solid ${BRAND_COLOR};border-radius:6px;padding:16px 18px;color:${TEXT_DARK};font-size:13px;line-height:1.7;">
            ${lineBreaks(lead.message)}
          </div>
        </div>

        <!-- Action Buttons -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:26px 0 0;">
          <tr>
            <td align="center">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:0 6px;" class="btn-stack">
                    <a href="mailto:${escapeAttr(lead.email)}?subject=${mailtoSubject}&body=${mailtoBody}" style="display:inline-block;background:${BRAND_COLOR};color:#ffffff;text-decoration:none;border-radius:6px;padding:12px 22px;font-size:14px;font-weight:700;text-align:center;">
                      ✉️ Reply to ${escapeHtml(lead.name)}
                    </a>
                  </td>
                  <td style="padding:0 6px;" class="btn-stack">
                    <a href="tel:${escapeAttr(lead.phone.replace(/\s+/g, ''))}" style="display:inline-block;background:#F4F8FC;color:${BRAND_COLOR};text-decoration:none;border-radius:6px;padding:12px 22px;font-size:14px;font-weight:700;border:1px solid #CBD5E1;text-align:center;">
                      📞 Call ${escapeHtml(lead.phone)}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    ${emailFooter()}
  `;

  const html = emailShell(subject, `New procurement inquiry from ${lead.name} (${lead.company})`, body);
  const text = [
    'New procurement inquiry received:',
    '',
    `Name: ${lead.name}`,
    `Company: ${lead.company}`,
    `Email: ${lead.email}`,
    `Phone: ${lead.phone}`,
    ...(lead.productName ? [`Requested Product: ${lead.productName}`] : []),
    ...(lead.productCategory ? [`Category: ${lead.productCategory}`] : []),
    `Submitted At: ${receivedAt} IST`,
    '',
    'Inquiry Message:',
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


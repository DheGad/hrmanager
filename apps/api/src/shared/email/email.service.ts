import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter, SendMailOptions } from 'nodemailer';
import { AppConfig } from '../../config/configuration';
import { ConfigProviderService } from '../config-provider/config-provider.service';

// ─── Domain types ─────────────────────────────────────────────────────────────

export interface SendEmailParams {
  /** Recipient email address (or array of addresses) */
  to: string | string[];
  /** Email subject line */
  subject: string;
  /** HTML body */
  html: string;
  /** Optional plain-text fallback */
  text?: string;
  /** Override the configured From address */
  from?: string;
  /** Optional CC recipients */
  cc?: string | string[];
  /** Optional BCC recipients */
  bcc?: string | string[];
  /** Optional reply-to address */
  replyTo?: string;
}

// ─── Brand colours / constants ────────────────────────────────────────────────

const BRAND = {
  PRIMARY: '#4F46E5',       // Indigo-600
  PRIMARY_DARK: '#3730A3',  // Indigo-800
  BG: '#F9FAFB',            // Gray-50
  TEXT: '#111827',          // Gray-900
  MUTED: '#6B7280',         // Gray-500
  BORDER: '#E5E7EB',        // Gray-200
  WHITE: '#FFFFFF',
  LOGO_URL: 'https://hrmanager4u.ai/logo.png',
  APP_URL: 'https://hrmanager4u.ai',
};

// ─── Service ──────────────────────────────────────────────────────────────────

/**
 * EmailService — production-grade transactional email service.
 */
@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);
  private transporter!: Transporter;
  private fromAddress!: string;

  constructor(
    private readonly configService: ConfigService<AppConfig, true>,
    private readonly configProvider: ConfigProviderService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.initTransporter();
  }

  async initTransporter(): Promise<void> {
    const host = await this.configProvider.get('SMTP_HOST') || this.configService.get<string>('smtp.host', { infer: true }) || '';
    const portStr = await this.configProvider.get('SMTP_PORT');
    const port = portStr ? parseInt(portStr, 10) : this.configService.get<number>('smtp.port', { infer: true }) || 587;
    const user = await this.configProvider.get('SMTP_USER') || this.configService.get<string>('smtp.user', { infer: true }) || '';
    const pass = await this.configProvider.get('SMTP_PASS') || this.configService.get<string>('smtp.pass', { infer: true }) || '';
    const fromName = await this.configProvider.get('SMTP_FROM_NAME') || 'HRManager4U.ai';
    const fromEmail = await this.configProvider.get('SMTP_FROM_EMAIL') || user;
    const secureStr = await this.configProvider.get('SMTP_SECURE');
    const secure = secureStr ? secureStr === 'true' : this.configService.get<boolean>('smtp.secure', { infer: true }) || false;

    this.fromAddress = `"${fromName}" <${fromEmail}>`;

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: user ? { user, pass } : undefined,
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
      logger: false,
      debug: false,
    });

    this.logger.log(`EmailService initialised → ${host}:${port} from="${this.fromAddress}"`);
  }

  // ─── Specific transactional emails ───────────────────────────────────────

  /**
   * Send a password-reset email containing a secure reset link.
   */
  async sendPasswordReset(
    to: string,
    name: string,
    resetLink: string,
  ): Promise<void> {
    const subject = 'Reset your HRManager4U password';
    const html = this.buildWrapper(
      subject,
      `
      <h2 style="color:${BRAND.TEXT};font-size:22px;font-weight:700;margin:0 0 16px">
        Password Reset Request
      </h2>
      <p style="color:${BRAND.TEXT};font-size:15px;line-height:1.6;margin:0 0 12px">
        Hi <strong>${this.escape(name)}</strong>,
      </p>
      <p style="color:${BRAND.TEXT};font-size:15px;line-height:1.6;margin:0 0 24px">
        We received a request to reset the password for your HRManager4U account.
        Click the button below to choose a new password. This link expires in
        <strong>60 minutes</strong>.
      </p>
      ${this.buildButton('Reset Password', resetLink)}
      <p style="color:${BRAND.MUTED};font-size:13px;line-height:1.5;margin:24px 0 0">
        If you did not request a password reset, you can safely ignore this email.
        Your password will remain unchanged.
      </p>
      <p style="color:${BRAND.MUTED};font-size:12px;line-height:1.5;margin:12px 0 0">
        Or paste this link in your browser:<br>
        <a href="${resetLink}" style="color:${BRAND.PRIMARY};word-break:break-all">${resetLink}</a>
      </p>
      `,
    );

    await this.sendEmail({ to, subject, html });
  }

  /**
   * Send a welcome email to a newly registered user.
   */
  async sendWelcome(
    to: string,
    name: string,
    tenantName: string,
  ): Promise<void> {
    const subject = `Welcome to HRManager4U — ${this.escape(tenantName)}`;
    const html = this.buildWrapper(
      subject,
      `
      <h2 style="color:${BRAND.TEXT};font-size:22px;font-weight:700;margin:0 0 16px">
        Welcome aboard, ${this.escape(name)}! 🎉
      </h2>
      <p style="color:${BRAND.TEXT};font-size:15px;line-height:1.6;margin:0 0 12px">
        Your account has been created successfully for
        <strong>${this.escape(tenantName)}</strong>.
      </p>
      <p style="color:${BRAND.TEXT};font-size:15px;line-height:1.6;margin:0 0 24px">
        HRManager4U helps you manage your workforce, build AI-powered employee
        handbooks, and stay compliant — all in one place.
      </p>
      ${this.buildButton('Go to Dashboard', BRAND.APP_URL + '/dashboard')}
      <p style="color:${BRAND.MUTED};font-size:13px;line-height:1.5;margin:24px 0 0">
        Need help getting started? Visit our
        <a href="${BRAND.APP_URL}/docs" style="color:${BRAND.PRIMARY}">documentation</a>
        or reply to this email — we're always happy to help.
      </p>
      `,
    );

    await this.sendEmail({ to, subject, html });
  }

  /**
   * Notify a user that a generated document is ready for download.
   */
  async sendDocumentReady(
    to: string,
    name: string,
    documentTitle: string,
    downloadUrl: string,
  ): Promise<void> {
    const subject = `Your document is ready: ${this.escape(documentTitle)}`;
    const html = this.buildWrapper(
      subject,
      `
      <h2 style="color:${BRAND.TEXT};font-size:22px;font-weight:700;margin:0 0 16px">
        Your document is ready 📄
      </h2>
      <p style="color:${BRAND.TEXT};font-size:15px;line-height:1.6;margin:0 0 12px">
        Hi <strong>${this.escape(name)}</strong>,
      </p>
      <p style="color:${BRAND.TEXT};font-size:15px;line-height:1.6;margin:0 0 24px">
        <strong>${this.escape(documentTitle)}</strong> has been generated and is ready
        for download. Your download link expires in <strong>24 hours</strong>.
      </p>
      ${this.buildButton('Download Document', downloadUrl)}
      <p style="color:${BRAND.MUTED};font-size:13px;line-height:1.5;margin:24px 0 0">
        If the button doesn't work, paste this link into your browser:<br>
        <a href="${downloadUrl}" style="color:${BRAND.PRIMARY};word-break:break-all">${downloadUrl}</a>
      </p>
      `,
    );

    await this.sendEmail({ to, subject, html });
  }

  /**
   * Notify a user that their AI-generated employee handbook is ready.
   */
  async sendHandbookGenerated(
    to: string,
    name: string,
    companyName: string,
  ): Promise<void> {
    const subject = `${this.escape(companyName)}'s Employee Handbook is ready`;
    const dashboardUrl = `${BRAND.APP_URL}/dashboard/handbooks`;
    const html = this.buildWrapper(
      subject,
      `
      <h2 style="color:${BRAND.TEXT};font-size:22px;font-weight:700;margin:0 0 16px">
        Employee Handbook Generated ✅
      </h2>
      <p style="color:${BRAND.TEXT};font-size:15px;line-height:1.6;margin:0 0 12px">
        Hi <strong>${this.escape(name)}</strong>,
      </p>
      <p style="color:${BRAND.TEXT};font-size:15px;line-height:1.6;margin:0 0 12px">
        Great news! The AI-powered Employee Handbook for
        <strong>${this.escape(companyName)}</strong> has been generated and is now
        available in your dashboard.
      </p>
      <p style="color:${BRAND.TEXT};font-size:15px;line-height:1.6;margin:0 0 24px">
        You can review, edit, and publish the handbook directly from the
        HRManager4U dashboard. Need to make changes? Our AI editor lets you
        refine any section instantly.
      </p>
      ${this.buildButton('View Handbook', dashboardUrl)}
      `,
    );

    await this.sendEmail({ to, subject, html });
  }

  // ─── Core send ────────────────────────────────────────────────────────────

  /**
   * Send a fully-configured email.
   *
   * Intentionally does NOT re-throw — email failures are logged but must never
   * break the caller's business logic (e.g. user registration still succeeds
   * even if SMTP is temporarily unavailable).
   */
  async sendEmail(params: SendEmailParams): Promise<void> {
    const mailOptions: SendMailOptions = {
      from: params.from ?? this.fromAddress,
      to: Array.isArray(params.to) ? params.to.join(', ') : params.to,
      subject: params.subject,
      html: params.html,
      ...(params.text ? { text: params.text } : {}),
      ...(params.cc ? { cc: params.cc } : {}),
      ...(params.bcc ? { bcc: params.bcc } : {}),
      ...(params.replyTo ? { replyTo: params.replyTo } : {}),
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.debug(
        `Email sent → to="${mailOptions.to}" subject="${params.subject}" messageId="${info.messageId}"`,
      );
    } catch (err) {
      // Log the full stack but do NOT re-throw — email failure is non-fatal.
      this.logger.error(
        `Failed to send email → to="${mailOptions.to}" subject="${params.subject}": ${(err as Error).message}`,
        (err as Error).stack,
      );
    }
  }

  // ─── Template helpers ─────────────────────────────────────────────────────

  /**
   * Wrap email body content in the shared HRManager4U branded HTML shell.
   * All transactional emails use this wrapper for consistent branding.
   */
  private buildWrapper(title: string, body: string): string {
    const year = new Date().getFullYear();
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${this.escape(title)}</title>
  <!--[if mso]>
  <style>td, th { font-family: Arial, sans-serif !important; }</style>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:${BRAND.BG};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.BG}">
    <tr>
      <td align="center" style="padding:32px 16px">

        <!-- Card -->
        <table role="presentation" width="100%" style="max-width:600px;background:${BRAND.WHITE};border-radius:12px;border:1px solid ${BRAND.BORDER};box-shadow:0 1px 3px rgba(0,0,0,0.08)">

          <!-- Header -->
          <tr>
            <td style="background:${BRAND.PRIMARY};border-radius:12px 12px 0 0;padding:28px 32px;text-align:center">
              <a href="${BRAND.APP_URL}" style="text-decoration:none">
                <span style="color:${BRAND.WHITE};font-size:22px;font-weight:700;letter-spacing:-0.5px">
                  HRManager4U<span style="color:#A5B4FC">.ai</span>
                </span>
              </a>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 32px">
              ${body}
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 32px">
              <hr style="border:none;border-top:1px solid ${BRAND.BORDER};margin:0">
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px;text-align:center">
              <p style="color:${BRAND.MUTED};font-size:12px;margin:0 0 6px">
                © ${year} HRManager4U.ai · All rights reserved
              </p>
              <p style="color:${BRAND.MUTED};font-size:12px;margin:0">
                <a href="${BRAND.APP_URL}/privacy" style="color:${BRAND.MUTED}">Privacy Policy</a>
                &nbsp;·&nbsp;
                <a href="${BRAND.APP_URL}/terms" style="color:${BRAND.MUTED}">Terms of Service</a>
              </p>
            </td>
          </tr>

        </table>
        <!-- /Card -->

      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
  }

  /**
   * Render a branded call-to-action button.
   */
  private buildButton(label: string, url: string): string {
    return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto">
      <tr>
        <td style="border-radius:8px;background:${BRAND.PRIMARY}">
          <a href="${url}"
             target="_blank"
             rel="noopener noreferrer"
             style="
               display:inline-block;
               padding:13px 28px;
               color:${BRAND.WHITE};
               font-size:15px;
               font-weight:600;
               text-decoration:none;
               border-radius:8px;
               background:${BRAND.PRIMARY};
               letter-spacing:0.1px;
             ">
            ${this.escape(label)}
          </a>
        </td>
      </tr>
    </table>
    `;
  }

  /**
   * Minimal HTML-escape to prevent XSS in user-supplied values rendered into
   * email bodies (name, company name, document title, etc.).
   */
  private escape(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }
}

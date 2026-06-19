import { type Page, type Locator, expect } from '@playwright/test';

/**
 * LoginPage — Page Object Model
 *
 * Encapsulates all interactions with the HRManager4U login screen.
 * URL: /login
 */
export class LoginPage {
  readonly page: Page;

  // ── Locators ─────────────────────────────────────────────────────────────────
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorBanner: Locator;
  readonly forgotPasswordLink: Locator;
  readonly rememberMeCheckbox: Locator;

  // MFA step locators
  readonly totpInput: Locator;
  readonly totpSubmitButton: Locator;
  readonly totpErrorMessage: Locator;
  readonly backupCodeLink: Locator;
  readonly backupCodeInput: Locator;
  readonly backupCodeSubmitButton: Locator;
  readonly mfaSetupQrCode: Locator;
  readonly mfaSetupSecretText: Locator;
  readonly mfaSetupConfirmInput: Locator;
  readonly mfaSetupConfirmButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Primary login form
    this.emailInput = page.getByRole('textbox', { name: /email/i });
    this.passwordInput = page.getByRole('textbox', { name: /password/i });
    this.loginButton = page.getByRole('button', { name: /sign in/i });
    this.errorBanner = page.getByRole('alert');
    this.forgotPasswordLink = page.getByRole('link', {
      name: /forgot password/i,
    });
    this.rememberMeCheckbox = page.getByRole('checkbox', {
      name: /remember me/i,
    });

    // MFA — TOTP step
    this.totpInput = page.getByRole('textbox', { name: /authenticator code/i });
    this.totpSubmitButton = page.getByRole('button', { name: /verify/i });
    this.totpErrorMessage = page.getByTestId('totp-error');
    this.backupCodeLink = page.getByRole('link', { name: /use backup code/i });
    this.backupCodeInput = page.getByRole('textbox', { name: /backup code/i });
    this.backupCodeSubmitButton = page.getByRole('button', {
      name: /verify backup code/i,
    });

    // MFA — Setup step (first login)
    this.mfaSetupQrCode = page.getByTestId('mfa-qr-code');
    this.mfaSetupSecretText = page.getByTestId('mfa-secret-text');
    this.mfaSetupConfirmInput = page.getByRole('textbox', {
      name: /confirm code/i,
    });
    this.mfaSetupConfirmButton = page.getByRole('button', {
      name: /enable two-factor/i,
    });
  }

  // ── Navigation ───────────────────────────────────────────────────────────────

  async goto(): Promise<void> {
    await this.page.goto('/login');
    await this.page.waitForLoadState('networkidle');
  }

  // ── Actions ──────────────────────────────────────────────────────────────────

  async fillEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  async submit(): Promise<void> {
    await this.loginButton.click();
  }

  /**
   * Perform a full login with email + password.
   * Does NOT handle MFA — use loginWithMfa for that.
   */
  async login(email: string, password: string): Promise<void> {
    await this.goto();
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.submit();
  }

  /**
   * Perform a full login then supply a TOTP code.
   */
  async loginWithTotp(
    email: string,
    password: string,
    totpCode: string
  ): Promise<void> {
    await this.login(email, password);
    await expect(this.totpInput).toBeVisible({ timeout: 10_000 });
    await this.totpInput.fill(totpCode);
    await this.totpSubmitButton.click();
  }

  /**
   * Perform a full login then use a backup code.
   */
  async loginWithBackupCode(
    email: string,
    password: string,
    backupCode: string
  ): Promise<void> {
    await this.login(email, password);
    await expect(this.backupCodeLink).toBeVisible({ timeout: 10_000 });
    await this.backupCodeLink.click();
    await this.backupCodeInput.fill(backupCode);
    await this.backupCodeSubmitButton.click();
  }

  // ── Assertions ───────────────────────────────────────────────────────────────

  async expectErrorMessage(text: string | RegExp): Promise<void> {
    await expect(this.errorBanner).toBeVisible();
    await expect(this.errorBanner).toContainText(text);
  }

  async expectRedirectTo(path: string): Promise<void> {
    await this.page.waitForURL(`**${path}`, { timeout: 15_000 });
    expect(this.page.url()).toContain(path);
  }

  async expectOnLoginPage(): Promise<void> {
    await expect(this.emailInput).toBeVisible();
    expect(this.page.url()).toContain('/login');
  }

  async expectMfaSetupVisible(): Promise<void> {
    await expect(this.mfaSetupQrCode).toBeVisible({ timeout: 10_000 });
    await expect(this.mfaSetupSecretText).toBeVisible();
  }

  async expectTotpStepVisible(): Promise<void> {
    await expect(this.totpInput).toBeVisible({ timeout: 10_000 });
  }
}

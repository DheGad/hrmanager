import { test, expect } from '@playwright/test';
import * as OTPAuth from 'otpauth';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { HR_MANAGER } from './fixtures/users';

/**
 * MFA (Multi-Factor Authentication) E2E Test Suite
 *
 * Tests TOTP-based 2FA flows:
 *  - Setup (QR code + secret display)
 *  - Valid TOTP login
 *  - Invalid / replayed TOTP
 *  - Backup code recovery
 *
 * NOTE: The HR_MANAGER fixture has MFA already enrolled in the test seed.
 *       A separate TOTP-setup user is used for the setup flow test.
 *
 * These tests run in chromium-anon (no pre-loaded storage state).
 */

/**
 * Generate a live TOTP code from a base32 secret.
 */
function generateTotp(secret: string): string {
  const totp = new OTPAuth.TOTP({
    issuer: 'HRManager4U',
    label: 'test',
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(secret),
  });
  return totp.generate();
}

test.describe('MFA — TOTP', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
  });

  // ── MFA Setup flow ─────────────────────────────────────────────────────────

  test('MFA setup flow: QR code and secret text displayed for new user', async ({
    page,
  }) => {
    // Use a dedicated "MFA not yet setup" account from the seed
    const mfaNewUser = {
      email: 'mfa.setup@tenant-a.test',
      password: 'MfaSetup!2024$',
    };

    await loginPage.login(mfaNewUser.email, mfaNewUser.password);

    // Should land on MFA setup screen
    await loginPage.expectMfaSetupVisible();

    // QR code should be an image
    await expect(loginPage.mfaSetupQrCode).toHaveAttribute('src', /data:image/);

    // Secret text should be present (base32 format)
    const secretText = await loginPage.mfaSetupSecretText.innerText();
    expect(secretText).toMatch(/^[A-Z2-7]{16,}/);
  });

  // ── Valid TOTP login ───────────────────────────────────────────────────────

  test('valid TOTP code allows login after password step', async ({ page }) => {
    const totpCode = generateTotp(HR_MANAGER.totpSecret!);

    await loginPage.loginWithTotp(
      HR_MANAGER.email,
      HR_MANAGER.password,
      totpCode
    );

    await loginPage.expectRedirectTo('/overview');
    await dashboardPage.expectLoaded();
  });

  // ── Invalid TOTP ───────────────────────────────────────────────────────────

  test('invalid TOTP code shows error message', async ({ page }) => {
    await loginPage.login(HR_MANAGER.email, HR_MANAGER.password);

    await loginPage.expectTotpStepVisible();
    await loginPage.totpInput.fill('000000'); // deliberately wrong
    await loginPage.totpSubmitButton.click();

    await expect(loginPage.totpErrorMessage).toBeVisible();
    await expect(loginPage.totpErrorMessage).toContainText(
      /invalid code|incorrect|try again/i
    );

    // Should NOT have navigated away
    expect(page.url()).not.toContain('/overview');
  });

  // ── TOTP replay attack ─────────────────────────────────────────────────────

  test('TOTP code replayed within same window is rejected', async ({
    page,
    context,
  }) => {
    const totpCode = generateTotp(HR_MANAGER.totpSecret!);

    // ── First login: succeeds ──
    await loginPage.loginWithTotp(
      HR_MANAGER.email,
      HR_MANAGER.password,
      totpCode
    );
    await loginPage.expectRedirectTo('/overview');

    // Log out so we can attempt a second login
    await dashboardPage.logout();

    // ── Second login: same code within same 30s window ──
    // Re-navigate and enter credentials
    await loginPage.login(HR_MANAGER.email, HR_MANAGER.password);
    await loginPage.expectTotpStepVisible();
    await loginPage.totpInput.fill(totpCode);
    await loginPage.totpSubmitButton.click();

    // The backend should reject the replayed code
    await expect(loginPage.totpErrorMessage).toBeVisible({ timeout: 8_000 });
    await expect(loginPage.totpErrorMessage).toContainText(
      /already used|replay|invalid code/i
    );
  });

  // ── Backup code recovery ───────────────────────────────────────────────────

  test('backup code recovery flow allows login when TOTP unavailable', async ({
    page,
  }) => {
    const backupCode = HR_MANAGER.backupCodes![0];

    await loginPage.loginWithBackupCode(
      HR_MANAGER.email,
      HR_MANAGER.password,
      backupCode
    );

    await loginPage.expectRedirectTo('/overview');
    await dashboardPage.expectLoaded();
  });

  test('used backup code cannot be reused', async ({ page }) => {
    // The first backup code was consumed in seed; the API tracks used codes.
    // Seed guarantees 'USED-CODE-0000' is marked as consumed.
    await loginPage.login(HR_MANAGER.email, HR_MANAGER.password);
    await loginPage.expectTotpStepVisible();
    await loginPage.backupCodeLink.click();

    await loginPage.backupCodeInput.fill('USED-CODE-0000');
    await loginPage.backupCodeSubmitButton.click();

    await expect(
      page.getByRole('alert').or(page.getByTestId('backup-code-error'))
    ).toContainText(/invalid|already used|expired/i);
  });
});

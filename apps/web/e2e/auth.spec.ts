import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { HR_MANAGER, WRONG_PASSWORD, INVALID_USER } from './fixtures/users';

/**
 * Auth E2E Test Suite
 *
 * Tests authentication flows without pre-seeded storage state.
 * These run in chromium-anon project (no storageState).
 */

test.describe('Authentication', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
  });

  // ── Happy path ─────────────────────────────────────────────────────────────

  test('login with valid credentials redirects to /overview', async ({
    page,
  }) => {
    await loginPage.login(HR_MANAGER.email, HR_MANAGER.password);
    await loginPage.expectRedirectTo('/overview');
    await dashboardPage.expectLoaded();
  });

  test('session persists across page reload', async ({ page }) => {
    // Log in
    await loginPage.login(HR_MANAGER.email, HR_MANAGER.password);
    await loginPage.expectRedirectTo('/overview');

    // Hard reload
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should still be on dashboard (not kicked to login)
    expect(page.url()).not.toContain('/login');
    await dashboardPage.expectLoaded();
  });

  test('logout clears session and redirects to /login', async ({ page }) => {
    // Establish a session
    await loginPage.login(HR_MANAGER.email, HR_MANAGER.password);
    await loginPage.expectRedirectTo('/overview');

    // Perform logout
    await dashboardPage.logout();

    // Should land on login page
    await expect(loginPage.emailInput).toBeVisible();
    expect(page.url()).toContain('/login');

    // Navigate to protected route — should redirect back to login
    await page.goto('/overview');
    await page.waitForURL('**/login', { timeout: 10_000 });
    expect(page.url()).toContain('/login');
  });

  // ── Error cases ────────────────────────────────────────────────────────────

  test('login with wrong password shows error banner', async ({ page }) => {
    await loginPage.login(WRONG_PASSWORD.email, WRONG_PASSWORD.password);
    await loginPage.expectErrorMessage(
      /invalid credentials|incorrect password|email or password/i
    );
    // Should remain on login page
    await loginPage.expectOnLoginPage();
  });

  test('login with non-existent user shows error banner', async ({ page }) => {
    await loginPage.login(INVALID_USER.email, INVALID_USER.password);
    await loginPage.expectErrorMessage(
      /invalid credentials|user not found/i
    );
    await loginPage.expectOnLoginPage();
  });

  // ── Protected route redirect ───────────────────────────────────────────────

  test('unauthenticated visit to protected route redirects to /login', async ({
    page,
  }) => {
    // Directly hit a protected URL without logging in
    await page.goto('/overview');
    await page.waitForURL('**/login', { timeout: 10_000 });
    expect(page.url()).toContain('/login');
  });

  test('unauthenticated visit to /workflows redirects to /login', async ({
    page,
  }) => {
    await page.goto('/workflows');
    await page.waitForURL('**/login', { timeout: 10_000 });
    expect(page.url()).toContain('/login');
  });

  test('unauthenticated visit to /employees redirects to /login', async ({
    page,
  }) => {
    await page.goto('/employees');
    await page.waitForURL('**/login', { timeout: 10_000 });
    expect(page.url()).toContain('/login');
  });

  // ── Token expiry simulation ────────────────────────────────────────────────

  test('expired token cookie causes redirect to /login on next navigation', async ({
    page,
    context,
  }) => {
    // Log in to get valid cookies
    await loginPage.login(HR_MANAGER.email, HR_MANAGER.password);
    await loginPage.expectRedirectTo('/overview');

    // Tamper with the access token cookie to simulate expiry
    const cookies = await context.cookies();
    const tokenCookie = cookies.find(
      (c) => c.name === 'access_token' || c.name === 'session'
    );

    if (tokenCookie) {
      await context.addCookies([
        {
          ...tokenCookie,
          value: 'expired.tampered.token',
          expires: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
        },
      ]);
    }

    // Navigate to another protected page — should redirect
    await page.goto('/employees');
    await page.waitForURL('**/login', { timeout: 10_000 });
    expect(page.url()).toContain('/login');
  });
});

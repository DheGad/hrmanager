import { test, expect, type Page } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import {
  SUPER_ADMIN,
  EMPLOYEE,
  AUDITOR,
  HR_MANAGER,
} from './fixtures/users';

/**
 * RBAC (Role-Based Access Control) E2E Test Suite
 *
 * Verifies that:
 *  - Each role sees only its permitted navigation items
 *  - Restricted routes redirect unauthorized roles
 *
 * These tests log in as specific users to override storageState.
 */

// ── Helper ────────────────────────────────────────────────────────────────────

async function loginAs(
  page: Page,
  email: string,
  password: string
): Promise<DashboardPage> {
  const loginPage = new LoginPage(page);
  await loginPage.login(email, password);
  await loginPage.expectRedirectTo('/overview');
  return new DashboardPage(page);
}

// ── Navigation visibility ─────────────────────────────────────────────────────

test.describe('RBAC — Navigation visibility', () => {
  test('SUPER_ADMIN sees all nav items', async ({ page }) => {
    const dashboard = await loginAs(
      page,
      SUPER_ADMIN.email,
      SUPER_ADMIN.password
    );

    await dashboard.expectNavItemVisible(/employees/i);
    await dashboard.expectNavItemVisible(/workflows/i);
    await dashboard.expectNavItemVisible(/documents/i);
    await dashboard.expectNavItemVisible(/analytics/i);
    await dashboard.expectNavItemVisible(/audit log/i);
    await dashboard.expectNavItemVisible(/ai assistant/i);
    await dashboard.expectNavItemVisible(/settings/i);
  });

  test('HR_MANAGER sees core HR nav items', async ({ page }) => {
    const dashboard = await loginAs(
      page,
      HR_MANAGER.email,
      HR_MANAGER.password
    );

    await dashboard.expectNavItemVisible(/employees/i);
    await dashboard.expectNavItemVisible(/workflows/i);
    await dashboard.expectNavItemVisible(/documents/i);
    await dashboard.expectNavItemVisible(/analytics/i);
    await dashboard.expectNavItemVisible(/ai assistant/i);
  });

  test('EMPLOYEE role sees only self-service nav items', async ({ page }) => {
    const dashboard = await loginAs(page, EMPLOYEE.email, EMPLOYEE.password);

    // EMPLOYEE should see self-service items
    await dashboard.expectNavItemVisible(/my profile|profile/i);
    await dashboard.expectNavItemVisible(/my documents|documents/i);

    // EMPLOYEE should NOT see management items
    await dashboard.expectNavItemHidden(/analytics/i);
    await dashboard.expectNavItemHidden(/audit log/i);
    await dashboard.expectNavItemHidden(/settings/i);
  });

  test('AUDITOR sees audit nav item and read-only items', async ({ page }) => {
    const dashboard = await loginAs(page, AUDITOR.email, AUDITOR.password);

    await dashboard.expectNavItemVisible(/audit log/i);
    await dashboard.expectNavItemVisible(/employees/i);
    await dashboard.expectNavItemVisible(/documents/i);

    // AUDITOR should NOT see workflow approval or settings
    await dashboard.expectNavItemHidden(/settings/i);
  });
});

// ── Route access control ──────────────────────────────────────────────────────

test.describe('RBAC — Route access control', () => {
  test('EMPLOYEE cannot access /workflows page — redirected to /overview or /forbidden', async ({
    page,
  }) => {
    await loginAs(page, EMPLOYEE.email, EMPLOYEE.password);

    await page.goto('/workflows');
    await page.waitForLoadState('networkidle');

    const url = page.url();
    expect(url).not.toContain('/workflows');
    // Should be redirected to overview or a forbidden page
    expect(url).toMatch(/\/(overview|forbidden|403|dashboard)/i);
  });

  test('EMPLOYEE cannot access /analytics page — redirected', async ({
    page,
  }) => {
    await loginAs(page, EMPLOYEE.email, EMPLOYEE.password);

    await page.goto('/analytics');
    await page.waitForLoadState('networkidle');

    const url = page.url();
    expect(url).not.toContain('/analytics');
    expect(url).toMatch(/\/(overview|forbidden|403|dashboard)/i);
  });

  test('EMPLOYEE cannot access /admin/settings — redirected', async ({
    page,
  }) => {
    await loginAs(page, EMPLOYEE.email, EMPLOYEE.password);

    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    const url = page.url();
    expect(url).not.toContain('/settings');
    expect(url).toMatch(/\/(overview|forbidden|403|dashboard)/i);
  });

  test('AUDITOR cannot access /workflows — redirected', async ({ page }) => {
    await loginAs(page, AUDITOR.email, AUDITOR.password);

    await page.goto('/workflows');
    await page.waitForLoadState('networkidle');

    const url = page.url();
    expect(url).not.toContain('/workflows');
  });

  test('HR_MANAGER can access /analytics', async ({ page }) => {
    await loginAs(page, HR_MANAGER.email, HR_MANAGER.password);

    await page.goto('/analytics');
    await page.waitForLoadState('networkidle');

    expect(page.url()).toContain('/analytics');
  });

  test('HR_MANAGER can access /workflows', async ({ page }) => {
    await loginAs(page, HR_MANAGER.email, HR_MANAGER.password);

    await page.goto('/workflows');
    await page.waitForLoadState('networkidle');

    expect(page.url()).toContain('/workflows');
  });

  test('SUPER_ADMIN can access all protected routes', async ({ page }) => {
    await loginAs(page, SUPER_ADMIN.email, SUPER_ADMIN.password);

    const routes = [
      '/workflows',
      '/analytics',
      '/settings',
      '/employees',
    ];

    for (const route of routes) {
      await page.goto(route);
      await page.waitForLoadState('networkidle');
      expect(page.url()).toContain(route);
    }
  });
});

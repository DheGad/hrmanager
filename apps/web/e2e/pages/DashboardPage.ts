import { type Page, type Locator, expect } from '@playwright/test';

/**
 * DashboardPage — Page Object Model
 *
 * Encapsulates interactions with the main dashboard / overview page.
 * URL: /overview
 */
export class DashboardPage {
  readonly page: Page;

  // ── Navigation sidebar ────────────────────────────────────────────────────────
  readonly sidebar: Locator;
  readonly navDashboard: Locator;
  readonly navEmployees: Locator;
  readonly navWorkflows: Locator;
  readonly navDocuments: Locator;
  readonly navAnalytics: Locator;
  readonly navAuditLog: Locator;
  readonly navAiAssistant: Locator;
  readonly navSettings: Locator;
  readonly userMenuButton: Locator;
  readonly logoutMenuItem: Locator;

  // ── Dashboard KPI cards ───────────────────────────────────────────────────────
  readonly headcountCard: Locator;
  readonly pendingWorkflowsCard: Locator;
  readonly openPositionsCard: Locator;
  readonly documentsExpiringCard: Locator;

  // ── Recent activity feed ──────────────────────────────────────────────────────
  readonly activityFeed: Locator;
  readonly activityItems: Locator;

  // ── Quick actions ─────────────────────────────────────────────────────────────
  readonly addEmployeeButton: Locator;
  readonly createWorkflowButton: Locator;

  // ── Page header ───────────────────────────────────────────────────────────────
  readonly pageHeading: Locator;
  readonly tenantBadge: Locator;

  constructor(page: Page) {
    this.page = page;

    // Sidebar navigation
    this.sidebar = page.getByRole('navigation', { name: /main navigation/i });
    this.navDashboard = page.getByRole('link', { name: /dashboard/i });
    this.navEmployees = page.getByRole('link', { name: /employees/i });
    this.navWorkflows = page.getByRole('link', { name: /workflows/i });
    this.navDocuments = page.getByRole('link', { name: /documents/i });
    this.navAnalytics = page.getByRole('link', { name: /analytics/i });
    this.navAuditLog = page.getByRole('link', { name: /audit log/i });
    this.navAiAssistant = page.getByRole('link', { name: /ai assistant/i });
    this.navSettings = page.getByRole('link', { name: /settings/i });
    this.userMenuButton = page.getByTestId('user-menu-button');
    this.logoutMenuItem = page.getByRole('menuitem', { name: /sign out/i });

    // KPI cards
    this.headcountCard = page.getByTestId('kpi-headcount');
    this.pendingWorkflowsCard = page.getByTestId('kpi-pending-workflows');
    this.openPositionsCard = page.getByTestId('kpi-open-positions');
    this.documentsExpiringCard = page.getByTestId('kpi-documents-expiring');

    // Activity feed
    this.activityFeed = page.getByTestId('activity-feed');
    this.activityItems = page.getByTestId('activity-item');

    // Quick actions
    this.addEmployeeButton = page.getByRole('button', {
      name: /add employee/i,
    });
    this.createWorkflowButton = page.getByRole('button', {
      name: /create workflow/i,
    });

    // Header
    this.pageHeading = page.getByRole('heading', {
      name: /overview|dashboard/i,
      level: 1,
    });
    this.tenantBadge = page.getByTestId('tenant-badge');
  }

  // ── Navigation ───────────────────────────────────────────────────────────────

  async goto(): Promise<void> {
    await this.page.goto('/overview');
    await this.page.waitForLoadState('networkidle');
  }

  // ── Actions ──────────────────────────────────────────────────────────────────

  async logout(): Promise<void> {
    await this.userMenuButton.click();
    await expect(this.logoutMenuItem).toBeVisible();
    await this.logoutMenuItem.click();
    await this.page.waitForURL('**/login', { timeout: 10_000 });
  }

  async navigateToEmployees(): Promise<void> {
    await this.navEmployees.click();
    await this.page.waitForURL('**/employees', { timeout: 10_000 });
  }

  async navigateToWorkflows(): Promise<void> {
    await this.navWorkflows.click();
    await this.page.waitForURL('**/workflows', { timeout: 10_000 });
  }

  async navigateToDocuments(): Promise<void> {
    await this.navDocuments.click();
    await this.page.waitForURL('**/documents', { timeout: 10_000 });
  }

  async navigateToAiAssistant(): Promise<void> {
    await this.navAiAssistant.click();
    await this.page.waitForURL('**/ai-assistant', { timeout: 10_000 });
  }

  // ── Assertions ───────────────────────────────────────────────────────────────

  async expectLoaded(): Promise<void> {
    await expect(this.pageHeading).toBeVisible();
    await expect(this.headcountCard).toBeVisible();
    await expect(this.pendingWorkflowsCard).toBeVisible();
  }

  async expectNavItemVisible(name: string | RegExp): Promise<void> {
    await expect(
      this.page.getByRole('link', { name })
    ).toBeVisible();
  }

  async expectNavItemHidden(name: string | RegExp): Promise<void> {
    await expect(
      this.page.getByRole('link', { name })
    ).not.toBeVisible();
  }

  async getHeadcount(): Promise<number> {
    const text = await this.headcountCard
      .getByTestId('kpi-value')
      .innerText();
    return parseInt(text.replace(/,/g, ''), 10);
  }

  async getPendingWorkflowCount(): Promise<number> {
    const text = await this.pendingWorkflowsCard
      .getByTestId('kpi-value')
      .innerText();
    return parseInt(text.replace(/,/g, ''), 10);
  }
}

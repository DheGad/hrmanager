import { type Page, type Locator, expect } from '@playwright/test';

/**
 * EmployeePage — Page Object Model
 *
 * Covers:
 *  - Employee directory (list view with search + filters)
 *  - Employee profile (tabs: Overview, Employment, Timeline)
 *
 * URL: /employees  /employees/:id
 */
export class EmployeePage {
  readonly page: Page;

  // ── Directory ─────────────────────────────────────────────────────────────────
  readonly pageHeading: Locator;
  readonly searchInput: Locator;
  readonly statusFilterSelect: Locator;
  readonly departmentFilterSelect: Locator;
  readonly employeeCards: Locator;
  readonly employeeRows: Locator;
  readonly emptyState: Locator;
  readonly addEmployeeButton: Locator;
  readonly totalCountLabel: Locator;

  // ── Profile ───────────────────────────────────────────────────────────────────
  readonly profileName: Locator;
  readonly profileRole: Locator;
  readonly profileDepartment: Locator;
  readonly profileStatusBadge: Locator;
  readonly profileAvatar: Locator;

  // Profile tabs
  readonly tabOverview: Locator;
  readonly tabEmployment: Locator;
  readonly tabTimeline: Locator;

  // Overview tab content
  readonly overviewSection: Locator;
  readonly contactEmailField: Locator;
  readonly contactPhoneField: Locator;
  readonly managerField: Locator;

  // Employment tab content
  readonly employmentSection: Locator;
  readonly hireDateField: Locator;
  readonly employmentTypeField: Locator;
  readonly salaryBandField: Locator;

  // Timeline tab content
  readonly timelineSection: Locator;
  readonly timelineEvents: Locator;

  // ── Actions ───────────────────────────────────────────────────────────────────
  readonly editProfileButton: Locator;
  readonly deactivateButton: Locator;
  readonly backToDirectoryLink: Locator;

  constructor(page: Page) {
    this.page = page;

    // Directory
    this.pageHeading = page.getByRole('heading', {
      name: /employees|employee directory/i,
      level: 1,
    });
    this.searchInput = page.getByRole('searchbox', {
      name: /search employees/i,
    });
    this.statusFilterSelect = page.getByRole('combobox', {
      name: /status/i,
    });
    this.departmentFilterSelect = page.getByRole('combobox', {
      name: /department/i,
    });
    this.employeeCards = page.getByTestId('employee-card');
    this.employeeRows = page.getByRole('row').filter({ has: page.getByTestId('employee-row-cell') });
    this.emptyState = page.getByTestId('employees-empty-state');
    this.addEmployeeButton = page.getByRole('button', { name: /add employee/i });
    this.totalCountLabel = page.getByTestId('employee-total-count');

    // Profile header
    this.profileName = page.getByTestId('profile-name');
    this.profileRole = page.getByTestId('profile-job-title');
    this.profileDepartment = page.getByTestId('profile-department');
    this.profileStatusBadge = page.getByTestId('profile-status-badge');
    this.profileAvatar = page.getByTestId('profile-avatar');

    // Tabs
    this.tabOverview = page.getByRole('tab', { name: /overview/i });
    this.tabEmployment = page.getByRole('tab', { name: /employment/i });
    this.tabTimeline = page.getByRole('tab', { name: /timeline/i });

    // Overview tab
    this.overviewSection = page.getByRole('tabpanel', { name: /overview/i });
    this.contactEmailField = page.getByTestId('profile-contact-email');
    this.contactPhoneField = page.getByTestId('profile-contact-phone');
    this.managerField = page.getByTestId('profile-manager');

    // Employment tab
    this.employmentSection = page.getByRole('tabpanel', {
      name: /employment/i,
    });
    this.hireDateField = page.getByTestId('profile-hire-date');
    this.employmentTypeField = page.getByTestId('profile-employment-type');
    this.salaryBandField = page.getByTestId('profile-salary-band');

    // Timeline tab
    this.timelineSection = page.getByRole('tabpanel', { name: /timeline/i });
    this.timelineEvents = page.getByTestId('timeline-event');

    // Actions
    this.editProfileButton = page.getByRole('button', {
      name: /edit profile/i,
    });
    this.deactivateButton = page.getByRole('button', {
      name: /deactivate/i,
    });
    this.backToDirectoryLink = page.getByRole('link', {
      name: /back to employees/i,
    });
  }

  // ── Navigation ───────────────────────────────────────────────────────────────

  async gotoDirectory(): Promise<void> {
    await this.page.goto('/employees');
    await this.page.waitForLoadState('networkidle');
    await expect(this.pageHeading).toBeVisible();
  }

  async gotoProfile(employeeId: string): Promise<void> {
    await this.page.goto(`/employees/${employeeId}`);
    await this.page.waitForLoadState('networkidle');
    await expect(this.profileName).toBeVisible();
  }

  // ── Directory actions ─────────────────────────────────────────────────────────

  async searchByName(name: string): Promise<void> {
    await this.searchInput.fill(name);
    // Debounce wait
    await this.page.waitForTimeout(400);
    await this.page.waitForLoadState('networkidle');
  }

  async clearSearch(): Promise<void> {
    await this.searchInput.clear();
    await this.page.waitForTimeout(400);
  }

  async filterByStatus(
    status: 'Active' | 'Inactive' | 'On Leave' | 'All'
  ): Promise<void> {
    await this.statusFilterSelect.selectOption(status);
    await this.page.waitForLoadState('networkidle');
  }

  async filterByDepartment(department: string): Promise<void> {
    await this.departmentFilterSelect.selectOption(department);
    await this.page.waitForLoadState('networkidle');
  }

  async clickFirstEmployee(): Promise<void> {
    await this.employeeCards.first().click();
    await this.page.waitForLoadState('networkidle');
  }

  async clickEmployeeByName(name: string): Promise<void> {
    await this.employeeCards
      .filter({ hasText: name })
      .first()
      .click();
    await this.page.waitForLoadState('networkidle');
  }

  // ── Profile tab actions ───────────────────────────────────────────────────────

  async switchToOverviewTab(): Promise<void> {
    await this.tabOverview.click();
    await expect(this.overviewSection).toBeVisible();
  }

  async switchToEmploymentTab(): Promise<void> {
    await this.tabEmployment.click();
    await expect(this.employmentSection).toBeVisible();
  }

  async switchToTimelineTab(): Promise<void> {
    await this.tabTimeline.click();
    await expect(this.timelineSection).toBeVisible();
  }

  // ── Assertions ───────────────────────────────────────────────────────────────

  async expectEmployeeCount(count: number): Promise<void> {
    await expect(this.employeeCards).toHaveCount(count);
  }

  async expectAtLeastOneEmployee(): Promise<void> {
    await expect(this.employeeCards.first()).toBeVisible();
  }

  async expectEmptyState(): Promise<void> {
    await expect(this.emptyState).toBeVisible();
    await expect(this.employeeCards).toHaveCount(0);
  }

  async expectAllEmployeesHaveStatus(
    status: 'Active' | 'Inactive' | 'On Leave'
  ): Promise<void> {
    const badges = this.page.getByTestId('employee-status-badge');
    const count = await badges.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      await expect(badges.nth(i)).toContainText(status);
    }
  }

  async expectProfileLoaded(name: string): Promise<void> {
    await expect(this.profileName).toContainText(name);
    await expect(this.tabOverview).toBeVisible();
    await expect(this.tabEmployment).toBeVisible();
    await expect(this.tabTimeline).toBeVisible();
  }

  async expectAddEmployeeButtonHidden(): Promise<void> {
    await expect(this.addEmployeeButton).not.toBeVisible();
  }

  async expectAddEmployeeButtonVisible(): Promise<void> {
    await expect(this.addEmployeeButton).toBeVisible();
  }
}

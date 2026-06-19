import { test, expect } from '@playwright/test';
import { EmployeePage } from './pages/EmployeePage';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { EMPLOYEE, HR_MANAGER } from './fixtures/users';

/**
 * Employee Directory & Profile E2E Test Suite
 *
 * Pre-authenticated via storageState (HR_MANAGER by default).
 * RBAC test re-logs in as EMPLOYEE role.
 */

test.describe('Employee Directory', () => {
  let employeePage: EmployeePage;

  test.beforeEach(async ({ page }) => {
    employeePage = new EmployeePage(page);
    await employeePage.gotoDirectory();
  });

  test('employee directory loads with data', async ({ page }) => {
    await employeePage.expectAtLeastOneEmployee();
    // Verify total count label renders
    await expect(employeePage.totalCountLabel).toBeVisible();
    const countText = await employeePage.totalCountLabel.innerText();
    expect(parseInt(countText, 10)).toBeGreaterThan(0);
  });

  test('search filters employees by name', async ({ page }) => {
    // Get first employee name to search for
    const firstName = await employeePage.employeeCards
      .first()
      .getByTestId('employee-name')
      .innerText();
    const searchTerm = firstName.split(' ')[0]; // search by first name

    await employeePage.searchByName(searchTerm);

    // All visible cards should contain the search term
    const cards = employeePage.employeeCards;
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const nameText = await cards
        .nth(i)
        .getByTestId('employee-name')
        .innerText();
      expect(nameText.toLowerCase()).toContain(searchTerm.toLowerCase());
    }
  });

  test('search with no match shows empty state', async ({ page }) => {
    await employeePage.searchByName('zzz-no-match-xyz-99999');
    await employeePage.expectEmptyState();
  });

  test('status filter "Active" shows only active employees', async ({
    page,
  }) => {
    await employeePage.filterByStatus('Active');
    await employeePage.expectAtLeastOneEmployee();
    await employeePage.expectAllEmployeesHaveStatus('Active');
  });

  test('status filter "Inactive" shows only inactive employees', async ({
    page,
  }) => {
    await employeePage.filterByStatus('Inactive');
    // May be empty or have results — just confirm no Active badges appear
    const cards = employeePage.employeeCards;
    const count = await cards.count();
    if (count > 0) {
      await employeePage.expectAllEmployeesHaveStatus('Inactive');
    } else {
      await expect(employeePage.emptyState).toBeVisible();
    }
  });

  test('clearing search restores full employee list', async ({ page }) => {
    const totalBefore = await employeePage.employeeCards.count();

    await employeePage.searchByName('Alice');
    const filteredCount = await employeePage.employeeCards.count();
    expect(filteredCount).toBeLessThanOrEqual(totalBefore);

    await employeePage.clearSearch();
    const totalAfter = await employeePage.employeeCards.count();
    expect(totalAfter).toBe(totalBefore);
  });
});

test.describe('Employee Profile', () => {
  let employeePage: EmployeePage;

  test.beforeEach(async ({ page }) => {
    employeePage = new EmployeePage(page);
    await employeePage.gotoDirectory();
  });

  test('navigate to employee profile from directory', async ({ page }) => {
    const employeeName = await employeePage.employeeCards
      .first()
      .getByTestId('employee-name')
      .innerText();

    await employeePage.clickFirstEmployee();

    // URL should have changed to profile
    expect(page.url()).toMatch(/\/employees\/[a-z0-9-]+$/i);
    await employeePage.expectProfileLoaded(employeeName);
  });

  test('profile Overview tab is active by default and shows contact info', async ({
    page,
  }) => {
    await employeePage.clickFirstEmployee();
    await expect(employeePage.tabOverview).toHaveAttribute(
      'aria-selected',
      'true'
    );
    await expect(employeePage.overviewSection).toBeVisible();
    await expect(employeePage.contactEmailField).toBeVisible();
  });

  test('Employment tab switches and shows hire date', async ({ page }) => {
    await employeePage.clickFirstEmployee();
    await employeePage.switchToEmploymentTab();

    await expect(employeePage.tabEmployment).toHaveAttribute(
      'aria-selected',
      'true'
    );
    await expect(employeePage.employmentSection).toBeVisible();
    await expect(employeePage.hireDateField).toBeVisible();
    await expect(employeePage.employmentTypeField).toBeVisible();
  });

  test('Timeline tab switches and shows at least one event', async ({
    page,
  }) => {
    await employeePage.clickFirstEmployee();
    await employeePage.switchToTimelineTab();

    await expect(employeePage.tabTimeline).toHaveAttribute(
      'aria-selected',
      'true'
    );
    await expect(employeePage.timelineSection).toBeVisible();
    await expect(employeePage.timelineEvents.first()).toBeVisible();
  });

  test('tabs can be switched multiple times in sequence', async ({ page }) => {
    await employeePage.clickFirstEmployee();

    // Overview → Employment → Timeline → Overview
    await employeePage.switchToEmploymentTab();
    await employeePage.switchToTimelineTab();
    await employeePage.switchToOverviewTab();

    await expect(employeePage.tabOverview).toHaveAttribute(
      'aria-selected',
      'true'
    );
    await expect(employeePage.overviewSection).toBeVisible();
  });
});

test.describe('Employee RBAC', () => {
  test('EMPLOYEE role cannot see Add Employee button', async ({ page }) => {
    // Re-authenticate as EMPLOYEE (override storageState for this test)
    const loginPage = new LoginPage(page);
    await loginPage.login(EMPLOYEE.email, EMPLOYEE.password);
    await loginPage.expectRedirectTo('/overview');

    const employeePage = new EmployeePage(page);
    await employeePage.gotoDirectory();
    await employeePage.expectAddEmployeeButtonHidden();
  });

  test('HR_MANAGER role can see Add Employee button', async ({ page }) => {
    // Uses default storageState (HR_MANAGER)
    const employeePage = new EmployeePage(page);
    await employeePage.gotoDirectory();
    await employeePage.expectAddEmployeeButtonVisible();
  });
});

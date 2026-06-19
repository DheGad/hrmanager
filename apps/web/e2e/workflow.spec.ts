import { test, expect } from '@playwright/test';
import { WorkflowPage } from './pages/WorkflowPage';

/**
 * Workflow E2E Test Suite
 *
 * Tests the approval inbox, SLA progress, approve/reject actions,
 * reject reason validation, and history tab.
 *
 * Pre-authenticated via storageState (HR_MANAGER).
 * The test seed populates at least 3 pending workflows for Tenant A.
 */

test.describe('Workflow Inbox', () => {
  let workflowPage: WorkflowPage;

  test.beforeEach(async ({ page }) => {
    workflowPage = new WorkflowPage(page);
    await workflowPage.goto();
  });

  test('pending workflows appear in inbox', async ({ page }) => {
    await workflowPage.expectAtLeastOneWorkflow();

    // Each card should show a title and type
    await expect(workflowPage.firstCardTitle).not.toBeEmpty();
    await expect(workflowPage.firstCardType).toBeVisible();
  });

  test('SLA progress bar is visible on each workflow card', async ({
    page,
  }) => {
    await workflowPage.expectSlaBarVisible();

    // Progress bar should have a role / aria value
    const slaBar = workflowPage.firstCardSlaBar;
    const role = await slaBar.getAttribute('role');
    if (role === 'progressbar') {
      const valueNow = await slaBar.getAttribute('aria-valuenow');
      expect(Number(valueNow)).toBeGreaterThanOrEqual(0);
      expect(Number(valueNow)).toBeLessThanOrEqual(100);
    }

    await expect(workflowPage.firstCardSlaLabel).toBeVisible();
  });

  test('approve action succeeds and removes card from inbox', async ({
    page,
  }) => {
    const countBefore = await workflowPage.workflowCards.count();
    expect(countBefore).toBeGreaterThan(0);

    await workflowPage.approveWorkflow(0, 'Approved by automated test');

    // Toast should appear
    await workflowPage.expectSuccessToast();

    // Card count should decrease by 1
    await expect(workflowPage.workflowCards).toHaveCount(
      countBefore - 1,
      { timeout: 8_000 }
    );
  });

  test('reject action requires a reason — shows validation error if empty', async ({
    page,
  }) => {
    await workflowPage.openRejectModal(0);

    // Submit without filling reason
    await workflowPage.submitRejectWithoutReason();

    await workflowPage.expectRejectReasonError();

    // Modal should remain open
    await expect(workflowPage.rejectModal).toBeVisible();
  });

  test('reject with reason succeeds and removes card from inbox', async ({
    page,
  }) => {
    const countBefore = await workflowPage.workflowCards.count();
    expect(countBefore).toBeGreaterThan(0);

    await workflowPage.rejectWorkflow(
      0,
      'Rejected by automated test — insufficient documentation'
    );

    await workflowPage.expectSuccessToast();

    await expect(workflowPage.workflowCards).toHaveCount(
      countBefore - 1,
      { timeout: 8_000 }
    );
  });

  test('inbox badge count decreases after approval', async ({ page }) => {
    // Read badge before
    const badgeBefore = await workflowPage.inboxBadge.innerText();
    const countBefore = parseInt(badgeBefore, 10);

    await workflowPage.approveWorkflow(0);
    await workflowPage.expectSuccessToast();

    // Give the UI time to update
    await page.waitForTimeout(1_000);

    const badgeAfter = await workflowPage.inboxBadge.innerText();
    const countAfter = parseInt(badgeAfter, 10);

    expect(countAfter).toBe(countBefore - 1);
  });
});

test.describe('Workflow History Tab', () => {
  let workflowPage: WorkflowPage;

  test.beforeEach(async ({ page }) => {
    workflowPage = new WorkflowPage(page);
    await workflowPage.goto();
  });

  test('history tab shows completed workflows', async ({ page }) => {
    await workflowPage.switchToHistory();
    await workflowPage.expectHistoryHasItems();
  });

  test('completed workflow items show outcome badge (Approved/Rejected)', async ({
    page,
  }) => {
    await workflowPage.switchToHistory();

    const items = workflowPage.historyItems;
    const count = await items.count();
    expect(count).toBeGreaterThan(0);

    // Each history item should have an outcome badge
    for (let i = 0; i < Math.min(count, 3); i++) {
      const badge = items.nth(i).getByTestId('outcome-badge');
      await expect(badge).toBeVisible();
      const badgeText = await badge.innerText();
      expect(['Approved', 'Rejected']).toContain(badgeText.trim());
    }
  });

  test('switching back to inbox restores pending workflow cards', async ({
    page,
  }) => {
    await workflowPage.switchToHistory();
    await workflowPage.expectHistoryHasItems();

    await workflowPage.switchToInbox();
    await workflowPage.expectAtLeastOneWorkflow();
  });
});

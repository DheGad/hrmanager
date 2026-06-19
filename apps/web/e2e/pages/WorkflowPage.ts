import { type Page, type Locator, expect } from '@playwright/test';

/**
 * WorkflowPage — Page Object Model
 *
 * Covers:
 *  - Workflow inbox (pending approvals)
 *  - History tab (completed workflows)
 *  - Approve / Reject modals
 *
 * URL: /workflows
 */
export class WorkflowPage {
  readonly page: Page;

  // ── Page frame ────────────────────────────────────────────────────────────────
  readonly pageHeading: Locator;
  readonly inboxTab: Locator;
  readonly historyTab: Locator;

  // ── Inbox ─────────────────────────────────────────────────────────────────────
  readonly workflowCards: Locator;
  readonly emptyInboxState: Locator;
  readonly inboxBadge: Locator;

  // ── Single workflow card ──────────────────────────────────────────────────────
  readonly firstCardTitle: Locator;
  readonly firstCardSlaBar: Locator;
  readonly firstCardSlaLabel: Locator;
  readonly firstCardApproveButton: Locator;
  readonly firstCardRejectButton: Locator;
  readonly firstCardAssignee: Locator;
  readonly firstCardType: Locator;

  // ── Approve modal ─────────────────────────────────────────────────────────────
  readonly approveModal: Locator;
  readonly approveCommentInput: Locator;
  readonly approveConfirmButton: Locator;
  readonly approveCancelButton: Locator;

  // ── Reject modal ──────────────────────────────────────────────────────────────
  readonly rejectModal: Locator;
  readonly rejectReasonInput: Locator;
  readonly rejectConfirmButton: Locator;
  readonly rejectCancelButton: Locator;
  readonly rejectReasonError: Locator;

  // ── History tab ───────────────────────────────────────────────────────────────
  readonly historyItems: Locator;
  readonly historyEmptyState: Locator;

  // ── Toast notifications ───────────────────────────────────────────────────────
  readonly successToast: Locator;
  readonly errorToast: Locator;

  constructor(page: Page) {
    this.page = page;

    // Page frame
    this.pageHeading = page.getByRole('heading', {
      name: /workflows|approval inbox/i,
      level: 1,
    });
    this.inboxTab = page.getByRole('tab', { name: /inbox|pending/i });
    this.historyTab = page.getByRole('tab', { name: /history|completed/i });

    // Inbox
    this.workflowCards = page.getByTestId('workflow-card');
    this.emptyInboxState = page.getByTestId('workflow-inbox-empty');
    this.inboxBadge = page.getByTestId('inbox-count-badge');

    // First card convenience locators
    this.firstCardTitle = this.workflowCards
      .first()
      .getByTestId('workflow-title');
    this.firstCardSlaBar = this.workflowCards
      .first()
      .getByTestId('sla-progress-bar');
    this.firstCardSlaLabel = this.workflowCards
      .first()
      .getByTestId('sla-label');
    this.firstCardApproveButton = this.workflowCards
      .first()
      .getByRole('button', { name: /approve/i });
    this.firstCardRejectButton = this.workflowCards
      .first()
      .getByRole('button', { name: /reject/i });
    this.firstCardAssignee = this.workflowCards
      .first()
      .getByTestId('workflow-assignee');
    this.firstCardType = this.workflowCards
      .first()
      .getByTestId('workflow-type');

    // Approve modal
    this.approveModal = page.getByRole('dialog', {
      name: /approve workflow/i,
    });
    this.approveCommentInput = this.approveModal.getByRole('textbox', {
      name: /comment/i,
    });
    this.approveConfirmButton = this.approveModal.getByRole('button', {
      name: /confirm approve/i,
    });
    this.approveCancelButton = this.approveModal.getByRole('button', {
      name: /cancel/i,
    });

    // Reject modal
    this.rejectModal = page.getByRole('dialog', {
      name: /reject workflow/i,
    });
    this.rejectReasonInput = this.rejectModal.getByRole('textbox', {
      name: /rejection reason/i,
    });
    this.rejectConfirmButton = this.rejectModal.getByRole('button', {
      name: /confirm reject/i,
    });
    this.rejectCancelButton = this.rejectModal.getByRole('button', {
      name: /cancel/i,
    });
    this.rejectReasonError = this.rejectModal.getByRole('alert');

    // History
    this.historyItems = page.getByTestId('history-item');
    this.historyEmptyState = page.getByTestId('history-empty');

    // Toasts
    this.successToast = page.getByRole('status').filter({ hasText: /success/i });
    this.errorToast = page.getByRole('alert').filter({ hasText: /error/i });
  }

  // ── Navigation ───────────────────────────────────────────────────────────────

  async goto(): Promise<void> {
    await this.page.goto('/workflows');
    await this.page.waitForLoadState('networkidle');
    await expect(this.pageHeading).toBeVisible();
  }

  // ── Actions ──────────────────────────────────────────────────────────────────

  async switchToHistory(): Promise<void> {
    await this.historyTab.click();
    await this.page.waitForLoadState('networkidle');
  }

  async switchToInbox(): Promise<void> {
    await this.inboxTab.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Approve the nth workflow card (0-indexed).
   * @param comment Optional approval comment
   */
  async approveWorkflow(
    index = 0,
    comment?: string
  ): Promise<void> {
    const card = this.workflowCards.nth(index);
    await card.getByRole('button', { name: /approve/i }).click();
    await expect(this.approveModal).toBeVisible();
    if (comment) {
      await this.approveCommentInput.fill(comment);
    }
    await this.approveConfirmButton.click();
    await expect(this.approveModal).not.toBeVisible({ timeout: 5_000 });
  }

  /**
   * Attempt to reject the nth workflow card.
   * Leaves the modal open if no reason is provided (to test validation).
   */
  async openRejectModal(index = 0): Promise<void> {
    const card = this.workflowCards.nth(index);
    await card.getByRole('button', { name: /reject/i }).click();
    await expect(this.rejectModal).toBeVisible();
  }

  async rejectWorkflow(index = 0, reason: string): Promise<void> {
    await this.openRejectModal(index);
    await this.rejectReasonInput.fill(reason);
    await this.rejectConfirmButton.click();
    await expect(this.rejectModal).not.toBeVisible({ timeout: 5_000 });
  }

  async submitRejectWithoutReason(): Promise<void> {
    await this.rejectConfirmButton.click();
  }

  // ── Assertions ───────────────────────────────────────────────────────────────

  async expectWorkflowCount(count: number): Promise<void> {
    await expect(this.workflowCards).toHaveCount(count);
  }

  async expectAtLeastOneWorkflow(): Promise<void> {
    await expect(this.workflowCards.first()).toBeVisible();
  }

  async expectEmptyInbox(): Promise<void> {
    await expect(this.emptyInboxState).toBeVisible();
  }

  async expectSlaBarVisible(): Promise<void> {
    await expect(this.firstCardSlaBar).toBeVisible();
  }

  async expectFirstCardRemovedAfterAction(): Promise<number> {
    const countBefore = await this.workflowCards.count();
    return countBefore;
  }

  async expectRejectReasonError(): Promise<void> {
    await expect(this.rejectReasonError).toBeVisible();
    await expect(this.rejectReasonError).toContainText(
      /reason is required|please provide/i
    );
  }

  async expectSuccessToast(): Promise<void> {
    await expect(this.successToast).toBeVisible({ timeout: 8_000 });
  }

  async expectHistoryHasItems(): Promise<void> {
    await expect(this.historyItems.first()).toBeVisible();
  }
}

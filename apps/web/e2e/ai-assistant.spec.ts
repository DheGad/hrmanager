import { test, expect } from '@playwright/test';
import { DashboardPage } from './pages/DashboardPage';

/**
 * AI Assistant E2E Test Suite
 *
 * Tests the AI HR assistant feature:
 *  - Page load with suggested questions
 *  - Clicking suggested question → populates input
 *  - Submitting question → typing indicator
 *  - Response with confidence badge
 *  - Citation section expandable
 *  - Low confidence shows warning badge
 *
 * Pre-authenticated via storageState (HR_MANAGER).
 */

// Page object for AI Assistant — inline since it's a single spec
class AiAssistantPage {
  readonly page: import('@playwright/test').Page;

  readonly pageHeading;
  readonly suggestedQuestions;
  readonly queryInput;
  readonly submitButton;
  readonly typingIndicator;
  readonly responseCard;
  readonly confidenceBadge;
  readonly citationToggle;
  readonly citationList;
  readonly citationItems;
  readonly warningBadge;
  readonly conversationHistory;
  readonly clearConversationButton;

  constructor(page: import('@playwright/test').Page) {
    this.page = page;

    this.pageHeading = page.getByRole('heading', {
      name: /ai assistant|hr assistant/i,
      level: 1,
    });
    this.suggestedQuestions = page.getByTestId('suggested-question');
    this.queryInput = page.getByRole('textbox', {
      name: /ask.*question|type.*query/i,
    });
    this.submitButton = page.getByRole('button', { name: /send|submit|ask/i });
    this.typingIndicator = page.getByTestId('typing-indicator');
    this.responseCard = page.getByTestId('ai-response-card').last();
    this.confidenceBadge = this.responseCard.getByTestId('confidence-badge');
    this.warningBadge = this.responseCard.getByTestId('low-confidence-warning');
    this.citationToggle = this.responseCard.getByRole('button', {
      name: /view sources|citations|show sources/i,
    });
    this.citationList = this.responseCard.getByTestId('citation-list');
    this.citationItems = this.responseCard.getByTestId('citation-item');
    this.conversationHistory = page.getByTestId('conversation-message');
    this.clearConversationButton = page.getByRole('button', {
      name: /clear conversation|new chat/i,
    });
  }

  async goto(): Promise<void> {
    await this.page.goto('/ai-assistant');
    await this.page.waitForLoadState('networkidle');
  }

  async clickSuggestedQuestion(index = 0): Promise<void> {
    await this.suggestedQuestions.nth(index).click();
  }

  async askQuestion(question: string): Promise<void> {
    await this.queryInput.fill(question);
    await this.submitButton.click();
  }

  async waitForResponse(): Promise<void> {
    // Wait for typing indicator to appear then disappear
    await expect(this.typingIndicator).toBeVisible({ timeout: 10_000 });
    await expect(this.typingIndicator).not.toBeVisible({ timeout: 60_000 });
    // Wait for response card
    await expect(this.responseCard).toBeVisible({ timeout: 10_000 });
  }
}

test.describe('AI Assistant', () => {
  let aiPage: AiAssistantPage;

  test.beforeEach(async ({ page }) => {
    aiPage = new AiAssistantPage(page);
    await aiPage.goto();
  });

  test('AI assistant page loads with suggested questions', async ({ page }) => {
    await expect(aiPage.pageHeading).toBeVisible();
    await expect(aiPage.queryInput).toBeVisible();

    // Should have at least 3 suggested questions
    const count = await aiPage.suggestedQuestions.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('clicking suggested question populates the input field', async ({
    page,
  }) => {
    const questionText = await aiPage.suggestedQuestions
      .first()
      .innerText();

    await aiPage.clickSuggestedQuestion(0);

    // Input should now contain the suggested question text
    const inputValue = await aiPage.queryInput.inputValue();
    expect(inputValue.trim()).toBe(questionText.trim());
  });

  test('submitting question shows typing indicator', async ({ page }) => {
    await aiPage.askQuestion('What is the maternity leave policy?');

    // Typing indicator should briefly appear
    await expect(aiPage.typingIndicator).toBeVisible({ timeout: 8_000 });
  });

  test('response displays with confidence badge after question submitted', async ({
    page,
  }) => {
    await aiPage.askQuestion('How many vacation days do employees get?');
    await aiPage.waitForResponse();

    // Response card visible
    await expect(aiPage.responseCard).toBeVisible();

    // Confidence badge present
    await expect(aiPage.confidenceBadge).toBeVisible();

    // Badge text should contain a percentage or level
    const badgeText = await aiPage.confidenceBadge.innerText();
    expect(badgeText).toMatch(/\d+%|high|medium|low/i);
  });

  test('citation section is expandable and contains source items', async ({
    page,
  }) => {
    await aiPage.askQuestion('What is the performance review cycle?');
    await aiPage.waitForResponse();

    // Citation toggle should be visible
    await expect(aiPage.citationToggle).toBeVisible();

    // Expand citations
    await aiPage.citationToggle.click();
    await expect(aiPage.citationList).toBeVisible();

    // Should have at least one citation
    const count = await aiPage.citationItems.count();
    expect(count).toBeGreaterThan(0);

    // Each citation should have a document reference
    const firstCitation = await aiPage.citationItems.first().innerText();
    expect(firstCitation.length).toBeGreaterThan(5);
  });

  test('collapsing citation section hides source list', async ({ page }) => {
    await aiPage.askQuestion('What is the expense reimbursement policy?');
    await aiPage.waitForResponse();

    // Expand
    await aiPage.citationToggle.click();
    await expect(aiPage.citationList).toBeVisible();

    // Collapse
    await aiPage.citationToggle.click();
    await expect(aiPage.citationList).not.toBeVisible();
  });

  test('low confidence response shows warning badge', async ({ page }) => {
    // Ask a question that is unlikely to be in the knowledge base
    await aiPage.askQuestion(
      'What is the exact stock price of HRManager4U company?'
    );
    await aiPage.waitForResponse();

    // Either warning badge or the response text should indicate uncertainty
    const warningVisible = await aiPage.warningBadge.isVisible();
    if (warningVisible) {
      const warningText = await aiPage.warningBadge.innerText();
      expect(warningText).toMatch(/low confidence|uncertain|not sure/i);
    } else {
      // Fallback: check confidence badge shows "low" or < 50%
      const badgeText = await aiPage.confidenceBadge.innerText();
      const isLow =
        badgeText.toLowerCase().includes('low') ||
        (badgeText.includes('%') &&
          parseInt(badgeText) < 50);
      expect(isLow).toBeTruthy();
    }
  });

  test("conversation history accumulates messages", async ({ page }) => {
    await aiPage.askQuestion('What is the sick leave policy?');
    await aiPage.waitForResponse();

    await aiPage.askQuestion('How do I apply for sick leave?');
    await aiPage.waitForResponse();

    // Should have 4 messages: 2 user + 2 AI
    const messageCount = await aiPage.conversationHistory.count();
    expect(messageCount).toBeGreaterThanOrEqual(4);
  });
});

import { expect, type Locator, type Page } from '@playwright/test';
export class ContactPage {
  constructor(readonly page: Page) {}
  get attachment(): Locator {
    return this.page.getByTestId('attachment');
  }
  async goto(): Promise<void> {
    await this.page.goto('/contact');
    await expect(this.page.getByTestId('subject')).toBeVisible();
    await expect(this.attachment).toBeVisible();
  }
}

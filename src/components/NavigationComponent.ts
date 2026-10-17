import type { Page } from '@playwright/test';
export class NavigationComponent {
  constructor(private readonly page: Page) {}
  async category(category: 'hand-tools' | 'power-tools' | 'other'): Promise<void> {
    await this.page.getByTestId('nav-categories').click();
    await this.page.getByTestId(`nav-${category}`).click();
  }
  async home(): Promise<void> {
    await this.page.getByTestId('nav-home').click();
  }
}

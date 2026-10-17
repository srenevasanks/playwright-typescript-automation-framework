import { expect, type Page } from '@playwright/test';
export class HeaderComponent {
  constructor(private readonly page: Page) {}
  async openCart(): Promise<void> {
    await this.page.getByTestId('nav-cart').click();
    await expect(this.page).toHaveURL(/\/checkout/);
  }
  async expectCartCount(count: number): Promise<void> {
    await expect(this.page.getByTestId('cart-quantity')).toHaveText(String(count));
  }
  async logout(): Promise<void> {
    await this.page.getByTestId('nav-menu').click();
    await this.page.getByTestId('nav-sign-out').click();
    await expect(this.page.getByTestId('nav-sign-in')).toBeVisible();
  }
}

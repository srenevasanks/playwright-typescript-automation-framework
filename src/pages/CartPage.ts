import { expect, type Page, type Locator } from '@playwright/test';
export class CartPage {
  constructor(readonly page: Page) {}
  get total(): Locator {
    return this.page.getByTestId('cart-total');
  }
  row(name: string): Locator {
    return this.page.getByRole('row').filter({
      has: this.page.getByTestId('product-title').filter({ hasText: new RegExp(`^${name}\\s*$`) }),
    });
  }
  async goto(): Promise<void> {
    await this.page.goto('/checkout');
  }
  async quantity(name: string, quantity: number): Promise<void> {
    const response = this.page.waitForResponse(
      (r) => r.url().includes('/product/quantity') && r.request().method() === 'PUT',
    );
    await this.row(name).getByTestId('product-quantity').fill(String(quantity));
    await this.row(name).getByTestId('product-quantity').blur();
    expect((await response).status()).toBe(200);
  }
  async remove(name: string): Promise<void> {
    const response = this.page.waitForResponse(
      (r) => r.url().includes('/product/') && r.request().method() === 'DELETE',
    );
    await this.row(name).locator('a').click();
    expect((await response).status()).toBe(204);
    await expect(this.row(name)).toHaveCount(0);
  }
  async proceed(): Promise<void> {
    await this.page.getByTestId('proceed-1').click();
  }
  async expectTotal(cents: number): Promise<void> {
    await expect(this.total).toHaveText(`$${(cents / 100).toFixed(2)}`);
  }
}

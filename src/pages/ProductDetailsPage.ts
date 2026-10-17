import { expect, type Page } from '@playwright/test';
export class ProductDetailsPage {
  constructor(readonly page: Page) {}
  async goto(id: string): Promise<void> {
    await this.page.goto(`/product/${id}`);
    await expect(this.page.getByTestId('product-name')).toBeVisible();
  }
  async add(quantity = 1): Promise<void> {
    await this.page.getByTestId('quantity').fill(String(quantity));
    const response = this.page.waitForResponse(
      (r) => /\/carts\/[^/]+$/.test(new URL(r.url()).pathname) && r.request().method() === 'POST',
    );
    await this.page.getByTestId('add-to-cart').click();
    expect((await response).status()).toBe(200);
    await expect(this.page.getByRole('alert')).toContainText('Product added to shopping cart.');
  }
}

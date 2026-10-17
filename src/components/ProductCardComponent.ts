import { expect, type Locator } from '@playwright/test';
export class ProductCardComponent {
  constructor(readonly root: Locator) {}
  get name(): Locator {
    return this.root.getByTestId('product-name');
  }
  get price(): Locator {
    return this.root.getByTestId('product-price');
  }
  async open(): Promise<void> {
    await expect(this.root).toBeVisible();
    await this.root.click();
  }
}

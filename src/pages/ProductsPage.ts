import { expect, type Page, type Locator } from '@playwright/test';
import { ProductCardComponent } from '../components/ProductCardComponent';
export class ProductsPage {
  constructor(readonly page: Page) {}
  get cards(): Locator {
    return this.page.locator('a[data-test^="product-"]');
  }
  get names(): Locator {
    return this.cards.getByTestId('product-name');
  }
  get prices(): Locator {
    return this.cards.getByTestId('product-price');
  }
  card(name: string): ProductCardComponent {
    return new ProductCardComponent(
      this.cards.filter({
        has: this.page.getByTestId('product-name').filter({
          hasText: new RegExp(`^\\s*${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`),
        }),
      }),
    );
  }
  async goto(): Promise<void> {
    await this.page.goto('/');
    await expect(this.cards.first()).toBeVisible();
  }
  async change(action: () => Promise<unknown>): Promise<void> {
    const response = this.page.waitForResponse(
      (r) =>
        /^\/products(?:\/search)?$/.test(new URL(r.url()).pathname) &&
        ['GET', 'QUERY'].includes(r.request().method()),
    );
    await action();
    expect((await response).status()).toBe(200);
  }
  async search(query: string): Promise<void> {
    await this.page.getByTestId('search-query').fill(query);
    await this.change(() => this.page.getByTestId('search-submit').click());
  }
  async resetSearch(): Promise<void> {
    await this.change(() => this.page.getByTestId('search-reset').click());
  }
  async sort(value: string): Promise<void> {
    await this.change(() => this.page.getByTestId('sort').selectOption(value));
  }
  async filter(label: string, checked = true): Promise<void> {
    await this.change(() => this.page.getByLabel(label, { exact: true }).setChecked(checked));
  }
}

import { expect, type Page } from '@playwright/test';
import type { Address } from '../api/models/models';
export class AddressComponent {
  constructor(private readonly page: Page) {}
  async fill(address: Address): Promise<void> {
    const alreadyEntered =
      (await this.page.getByTestId('country').inputValue()) === address.country &&
      (await this.page.getByTestId('postal_code').inputValue()) === address.postal_code &&
      (await this.page.getByTestId('house_number').inputValue()) === address.house_number;
    if (!alreadyEntered) {
      await this.page.getByTestId('country').selectOption(address.country);
      await this.page.getByTestId('postal_code').fill(address.postal_code);
      const lookup = this.page.waitForResponse((response) => {
        const url = new URL(response.url());
        return (
          url.pathname === '/postcode-lookup' &&
          url.searchParams.get('house_number') === address.house_number
        );
      });
      await this.page.getByTestId('house_number').fill(address.house_number);
      expect((await lookup).status(), 'Documented postcode lookup status').toBe(200);
    }
    // Postal code and house number debounce independently. The loader can disappear
    // after the first response while the second lookup is still scheduled/in flight.
    // Scope network quiescence to this form boundary before editing manual fields.
    await this.page.waitForLoadState('networkidle');
    await expect(this.page.getByTestId('postcode-lookup-loading')).not.toBeVisible();
    for (const key of ['street', 'city', 'state'] as const) {
      await this.page.getByTestId(key).fill(address[key]);
      await expect(this.page.getByTestId(key)).toHaveValue(address[key]);
    }
  }
}

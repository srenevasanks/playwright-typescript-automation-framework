import { expect, type Page } from '@playwright/test';
import type { Address } from '../api/models/models';
import { AddressComponent } from '../components/AddressComponent';
export class CheckoutPage {
  constructor(readonly page: Page) {}
  async billing(): Promise<void> {
    await this.page.getByTestId('proceed-1').click();
    await this.page.getByTestId('proceed-2').click();
    await expect(this.page.getByTestId('street')).toBeVisible();
  }
  async fillAddress(address: Address): Promise<void> {
    await new AddressComponent(this.page).fill(address);
  }
  async payment(): Promise<void> {
    await this.page.getByTestId('proceed-3').click();
    await expect(this.page.getByTestId('payment-method')).toBeVisible();
  }
  async placeTestOrder(): Promise<string> {
    await this.page.getByTestId('payment-method').selectOption('cash-on-delivery');
    await this.page.getByTestId('finish').click();
    await expect(this.page.getByText('Payment was successful')).toBeVisible();
    const response = this.page.waitForResponse(
      (r) => new URL(r.url()).pathname === '/invoices' && r.request().method() === 'POST',
    );
    await this.page.getByTestId('finish').click();
    const result = await response;
    const body = (await result.json()) as { id: string };
    expect(result.status(), `Invoice creation response: ${JSON.stringify(body)}`).toBe(201);
    await expect(
      this.page.getByText(/Thanks for your order! Your invoice number is INV-/),
    ).toBeVisible();
    return body.id;
  }
}

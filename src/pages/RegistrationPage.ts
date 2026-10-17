import { expect, type Page } from '@playwright/test';
import type { UserData } from '../api/models/models';
import { AddressComponent } from '../components/AddressComponent';
export class RegistrationPage {
  constructor(readonly page: Page) {}
  async goto(): Promise<void> {
    await this.page.goto('/auth/register');
    await expect(this.page.getByTestId('register-submit')).toBeVisible();
  }
  async fill(user: UserData): Promise<void> {
    for (const [testId, value] of Object.entries({
      'first-name': user.first_name,
      'last-name': user.last_name,
      dob: user.dob,
      phone: user.phone,
      email: user.email,
      password: user.password,
    }))
      await this.page.getByTestId(testId).fill(value);
    await new AddressComponent(this.page).fill(user.address);
  }
  async submit(): Promise<void> {
    await this.page.getByTestId('register-submit').click();
  }
  async register(user: UserData): Promise<void> {
    await this.goto();
    await this.fill(user);
    await this.submit();
    await expect(this.page).toHaveURL(/\/auth\/login/);
  }
}

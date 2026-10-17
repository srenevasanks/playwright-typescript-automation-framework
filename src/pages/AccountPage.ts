import { expect, type Page } from '@playwright/test';
export class AccountPage {
  constructor(readonly page: Page) {}
  async profile(): Promise<void> {
    await this.page.goto('/account/profile');
    await expect(this.page.getByTestId('page-title')).toHaveText('Profile');
    await expect(this.page.getByTestId('email')).toHaveValue(/.+@.+/);
    await expect(this.page.getByTestId('first-name')).not.toHaveValue('');
  }
  async updateFirstName(name: string): Promise<void> {
    await this.page.getByTestId('first-name').fill(name);
    const response = this.page.waitForResponse(
      (r) => /\/users\//.test(r.url()) && r.request().method() === 'PUT',
    );
    await this.page.getByTestId('update-profile-submit').click();
    expect((await response).status()).toBe(200);
    await expect(this.page.getByRole('alert')).toContainText('successfully');
  }
}

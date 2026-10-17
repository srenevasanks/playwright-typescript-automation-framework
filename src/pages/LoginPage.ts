import { expect, type Page } from '@playwright/test';
import type { UserData } from '../api/models/models';
export class LoginPage {
  constructor(readonly page: Page) {}
  async goto(): Promise<void> {
    await this.page.goto('/auth/login');
    await expect(this.page.getByTestId('login-submit')).toBeVisible();
  }
  async submit(email: string, password: string): Promise<void> {
    await this.page.getByTestId('email').fill(email);
    await this.page.getByTestId('password').fill(password);
    await this.page.getByTestId('login-submit').click();
  }
  async login(user: Pick<UserData, 'email' | 'password'>): Promise<void> {
    await this.goto();
    await this.submit(user.email, user.password);
    await expect(this.page).toHaveURL(/\/account$/);
    await expect(this.page.getByTestId('nav-menu')).toBeVisible();
  }
}

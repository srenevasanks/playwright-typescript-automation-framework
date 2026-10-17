import { test, expect } from '../../../src/fixtures/testFixtures';
import { LoginPage } from '../../../src/pages/LoginPage';
import { createUser } from '../../../src/data/factories/userFactory';
import { authState } from '../../../src/api/helpers/authState';
import { config } from '../../../src/utils/config';
test.describe('Authentication @regression', () => {
  test('AUT-01 Valid login @smoke', async ({ api, userData, login, page }) => {
    await api.register(userData);
    await login.login(userData);
    await expect(page.getByTestId('nav-menu')).toContainText(userData.first_name);
  });
  test('AUT-02 Invalid password', async ({ api, userData, login, page }) => {
    await api.register(userData);
    await login.goto();
    await login.submit(userData.email, 'Wrong!Password72');
    await expect(page.getByTestId('login-error')).toContainText('Invalid email or password');
    await expect(page).toHaveURL(/auth\/login/);
  });
  test('AUT-03 Empty credentials required', async ({ login, page }) => {
    await login.goto();
    await page.getByTestId('login-submit').click();
    await expect(page.getByTestId('email-error')).toContainText('required');
    await expect(page.getByTestId('password-error')).toContainText('required');
  });
  test('AUT-04 Logout invalidates browser session', async ({
    api,
    userData,
    login,
    header,
    page,
  }) => {
    await api.register(userData);
    await login.login(userData);
    await header.logout();
    expect(await page.evaluate(() => localStorage.getItem('auth-token'))).toBeNull();
    await page.goto('/account/profile');
    await expect(page).toHaveURL(/auth\/login/);
  });
  test('AUT-05 Authenticated session survives reload', async ({ api, userData, login, page }) => {
    await api.register(userData);
    await login.login(userData);
    const state = await page.context().storageState();
    expect(
      state.origins
        .flatMap((o) => o.localStorage)
        .some((v) => v.name === 'auth-token' && v.value.length > 0),
    ).toBe(true);
    await page.reload();
    await expect(page.getByTestId('nav-menu')).toContainText(userData.first_name);
    await expect(page).toHaveURL(/\/account$/);
  });
  test('AUT-06 Protected account redirects anonymous user @smoke', async ({ page }) => {
    await page.goto('/account/profile');
    await expect(page).toHaveURL(/auth\/login/);
    await expect(page.getByTestId('login-submit')).toBeVisible();
  });
  test('AUT-07 Independent user contexts', async ({ browser, api, userData }) => {
    const first = await api.session(userData);
    const second = await api.session({ ...createUser(), first_name: 'Independent' });
    const a = await browser.newContext({
      baseURL: config.baseURL,
      storageState: authState(first.token),
    });
    const b = await browser.newContext({
      baseURL: config.baseURL,
      storageState: authState(second.token),
    });
    try {
      const pa = await a.newPage();
      const pb = await b.newPage();
      await pa.goto('/account/profile');
      await pb.goto('/account/profile');
      await expect(pa.getByTestId('email')).toHaveValue(first.user.email);
      await expect(pb.getByTestId('email')).toHaveValue(second.user.email);
      expect(first.id).not.toBe(second.id);
      await new LoginPage(pa).goto();
      await expect(pb.getByTestId('email')).toHaveValue(second.user.email);
    } finally {
      await a.close();
      await b.close();
    }
  });
});

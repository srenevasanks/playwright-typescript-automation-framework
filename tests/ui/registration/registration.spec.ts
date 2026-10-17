import { test, expect } from '../../../src/fixtures/testFixtures';
test.describe('Registration @regression', () => {
  test('REG-01 Valid unique registration @smoke', async ({
    registration,
    userData,
    login,
    page,
  }) => {
    await registration.register(userData);
    await login.login(userData);
    await expect(page.getByTestId('nav-menu')).toContainText(userData.first_name);
  });
  test('REG-02 Required registration fields', async ({ registration, page }) => {
    await registration.goto();
    await registration.submit();
    for (const id of ['first-name-error', 'last-name-error', 'email-error', 'password-error'])
      await expect(page.getByTestId(id)).toContainText('required');
  });
  test('REG-03 Invalid registration email', async ({ registration, userData, page }) => {
    await registration.goto();
    await registration.fill({ ...userData, email: 'invalid-email' });
    await registration.submit();
    await expect(page.getByTestId('email-error')).toHaveText('Email format is invalid');
    await expect(page).toHaveURL(/auth\/register/);
  });
  test('REG-04 Duplicate registration email', async ({ api, registration, userData, page }) => {
    await api.register(userData);
    await registration.goto();
    await registration.fill(userData);
    const response = page.waitForResponse(
      (r) => new URL(r.url()).pathname === '/users/register' && r.request().method() === 'POST',
    );
    await registration.submit();
    expect((await response).status()).toBe(409);
    const errors = (await (await response).json()) as { email: string[] };
    expect(errors.email[0]).toMatch(/already|taken|exists/i);
    await expect(page.getByText(errors.email[0]!, { exact: true })).toBeVisible();
    await expect(page).toHaveURL(/auth\/register/);
  });
  test('REG-05 Underage date of birth', async ({ registration, userData, page }) => {
    const child = new Date();
    child.setFullYear(child.getFullYear() - 10);
    await registration.goto();
    await registration.fill({ ...userData, dob: child.toISOString().slice(0, 10) });
    await registration.submit();
    await expect(page.getByText('Customer must be 18 years old.', { exact: true })).toBeVisible();
  });
  test('REG-06 Weak password', async ({ registration, userData, page }) => {
    await registration.goto();
    await registration.fill({ ...userData, password: 'weak' });
    await registration.submit();
    await expect(page.getByTestId('password-error')).toContainText(/8|uppercase|invalid|strong/i);
  });
});

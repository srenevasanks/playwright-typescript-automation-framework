import { test, expect } from '../../../src/fixtures/authFixtures';
test.describe('Account @regression', () => {
  test('ACC-01 Profile and address match API @smoke', async ({ account, page, session, api }) => {
    const user = await api.me(session.token);
    await account.profile();
    await expect(page.getByTestId('email')).toHaveValue(user.email);
    await expect(page.getByTestId('first-name')).toHaveValue(user.first_name);
    await expect(page.getByTestId('street')).toHaveValue(user.address.street);
    await expect(page.getByTestId('city')).toHaveValue(user.address.city);
  });
  test('ACC-02 Profile update persists API', async ({ account, session, api, page }) => {
    await account.profile();
    await account.updateFirstName('Updated');
    expect((await api.me(session.token)).first_name).toBe('Updated');
    await page.reload();
    await expect(page.getByTestId('first-name')).toHaveValue('Updated');
  });
  test('ACC-03 Password confirmation validation', async ({ account, page, session }) => {
    await account.profile();
    await page.getByTestId('current-password').fill(session.user.password);
    await page.getByTestId('new-password').fill('Strong!NewPassword24');
    await page.getByTestId('new-password-confirm').fill('Different!Password24');
    await page.getByTestId('change-password-submit').click();
    await expect(page.getByText(/password.*match|match.*password/i)).toBeVisible();
  });
  test('ACC-04 Empty order history', async ({ page }) => {
    const response = page.waitForResponse(
      (r) => new URL(r.url()).pathname === '/invoices' && r.request().method() === 'GET',
    );
    await page.goto('/account/invoices');
    await expect(page.getByTestId('page-title')).toHaveText('Invoices');
    expect((await response).status()).toBe(200);
    expect(((await (await response).json()) as { data: unknown[] }).data).toEqual([]);
    await expect(page.locator('tbody tr')).toHaveCount(0);
  });
  test('ACC-05 Favorites UI and API', async ({ details, product, page, api, session }) => {
    await details.goto(product.id);
    const response = page.waitForResponse(
      (r) => new URL(r.url()).pathname === '/favorites' && r.request().method() === 'POST',
    );
    await page.getByTestId('add-to-favorites').click();
    const favorite = await api.json<{ id: string }>(await response, 201);
    try {
      await page.goto('/account/favorites');
      await expect(page.getByTestId('product-name')).toHaveText(product.name);
      const favorites = await api.json<{ id: string; product: { id: string } }[]>(
        await api.request.get('/favorites', { headers: api.headers(session.token) }),
      );
      expect(favorites.some((f) => f.product.id === product.id)).toBe(true);
    } finally {
      const removed = await api.request.delete(`/favorites/${favorite.id}`, {
        headers: api.headers(session.token),
      });
      expect(removed.status()).toBe(204);
    }
  });
});

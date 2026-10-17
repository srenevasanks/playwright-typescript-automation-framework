import { test, expect } from '../../src/fixtures/testFixtures';
test('MOC-01 Explicit mocked empty search response @mock @regression', async ({
  page,
  products,
}) => {
  await products.goto();
  let intercepted = false;
  await page.route(/\/products\/search(?:\?|$)/, async (route) => {
    intercepted = true;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: [],
        current_page: 1,
        last_page: 1,
        per_page: 9,
        total: 0,
        from: null,
        to: null,
      }),
    });
  });
  await products.search('mocked-catalog-empty');
  await expect(page.getByTestId('no-results')).toBeVisible();
  await expect(products.cards).toHaveCount(0);
  expect(intercepted).toBe(true);
});

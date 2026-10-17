import { test, expect } from '../../../src/fixtures/testFixtures';
import { testData } from '../../../src/data/testData';
test.describe('Catalog @regression', () => {
  test('CAT-01 Product listing and prices @smoke', async ({ products }) => {
    await products.goto();
    await expect(products.cards).toHaveCount(9);
    for (const price of await products.prices.allTextContents())
      expect(Number(price.replace('$', ''))).toBeGreaterThan(0);
  });
  test('CAT-02 Category filter', async ({ products, page }) => {
    await products.goto();
    await products.filter('Pliers');
    await expect(products.names).toHaveText([
      'Combination Pliers',
      'Pliers',
      'Bolt Cutters',
      'Long Nose Pliers',
      'Slip Joint Pliers',
    ]);
    await expect(page.getByLabel('Pliers', { exact: true })).toBeChecked();
  });
  test('CAT-03 Category and brand filters', async ({ products, product, api }) => {
    await products.goto();
    await products.filter('Pliers');
    await products.filter(product.brand.name);
    const expected = await api.products({
      by_category: product.category.id,
      by_brand: product.brand.id,
    });
    expect(expected.data.length).toBeGreaterThan(0);
    await expect(products.names).toHaveText(expected.data.map((item) => item.name));
  });
  for (const [id, value, label, descending, numeric] of [
    ['04', 'name,asc', 'Name ascending sort', false, false],
    ['05', 'name,desc', 'Name descending sort', true, false],
    ['06', 'price,asc', 'Price ascending sort', false, true],
    ['07', 'price,desc', 'Price descending sort', true, true],
  ] as const)
    test(`CAT-${id} ${label}`, async ({ products }) => {
      await products.goto();
      await products.sort(value);
      await expect(products.cards).toHaveCount(9);
      const values = numeric
        ? (await products.prices.allTextContents()).map((v) => Number(v.replace('$', '')))
        : (await products.names.allTextContents()).map((v) => v.trim().toLowerCase());
      const sorted = [...values].sort((a, b) =>
        typeof a === 'number' && typeof b === 'number' ? a - b : String(a).localeCompare(String(b)),
      );
      if (descending) sorted.reverse();
      expect(values).toEqual(sorted);
    });
  test('CAT-08 Exact product search @smoke', async ({ products }) => {
    await products.goto();
    await products.search(testData.productName);
    await expect(products.names).toHaveText([testData.productName]);
  });
  test('CAT-09 Search no results', async ({ products, page }) => {
    await products.goto();
    await products.search(testData.noResults);
    await expect(products.cards).toHaveCount(0);
    await expect(page.getByTestId('no-results')).toBeVisible();
  });
  test('CAT-10 Clear search', async ({ products, page }) => {
    await products.goto();
    await products.search(testData.noResults);
    await expect(products.cards).toHaveCount(0);
    await products.resetSearch();
    await expect(products.cards).toHaveCount(9);
    await expect(page.getByTestId('search-query')).toHaveValue('');
  });
  test('CAT-11 Pagination', async ({ products, page }) => {
    await products.goto();
    const before = await products.names.allTextContents();
    await products.change(() => page.getByRole('button', { name: 'Page-2', exact: true }).click());
    await expect(products.cards).toHaveCount(9);
    expect(await products.names.allTextContents()).not.toEqual(before);
  });
  test('CAT-12 Clear category filter', async ({ products, page }) => {
    await products.goto();
    await products.filter('Pliers');
    await expect(products.cards).toHaveCount(5);
    await products.filter('Pliers', false);
    await expect(products.cards).toHaveCount(9);
    await expect(page.getByLabel('Pliers', { exact: true })).not.toBeChecked();
  });
  test('CAT-13 Search filter sort combination', async ({ products }) => {
    await products.goto();
    await products.filter('Pliers');
    await products.sort('price,asc');
    await products.search('Pliers');
    await expect(products.names).toHaveCount(4);
    const prices = (await products.prices.allTextContents()).map((v) => Number(v.replace('$', '')));
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
    for (const name of await products.names.allTextContents())
      expect(name.toLowerCase()).toContain('pliers');
  });
  test('CAT-14 Product details match API @smoke', async ({ details, product, page }) => {
    await details.goto(product.id);
    await expect(page.getByTestId('product-name')).toHaveText(product.name);
    await expect(page.getByTestId('unit-price')).toHaveText(product.price.toFixed(2));
    await expect(page.getByTestId('product-description')).toHaveText(product.description);
  });
  test('CAT-15 Quantity lower boundary', async ({ details, product, page }) => {
    await details.goto(product.id);
    await page.getByTestId('decrease-quantity').click();
    await expect(page.getByTestId('quantity')).toHaveValue('1');
    await page.getByTestId('increase-quantity').click();
    await expect(page.getByTestId('quantity')).toHaveValue('2');
  });
});

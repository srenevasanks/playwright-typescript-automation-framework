import { test, expect } from '../../src/fixtures/testFixtures';
test('INT-01 API product to UI search and cart to API @smoke @regression', async ({
  api,
  product,
  products,
  details,
  header,
  cart,
  page,
}) => {
  await products.goto();
  await products.search(product.name);
  await products.card(product.name).open();
  await expect(page.getByTestId('unit-price')).toHaveText(product.price.toFixed(2));
  await details.add(2);
  await header.openCart();
  await cart.expectTotal(Math.round(product.price * 100) * 2);
  const id = await page.evaluate(() => sessionStorage.getItem('cart_id'));
  expect(id, 'UI cart identifier in session storage').toBeTruthy();
  const backend = await api.cart(id!);
  expect(backend.cart_items[0]).toEqual(
    expect.objectContaining({ product_id: product.id, quantity: 2 }),
  );
});

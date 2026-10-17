import { test, expect } from '../../../src/fixtures/testFixtures';
import { testData } from '../../../src/data/testData';
test.describe('Cart @regression', () => {
  test('CAR-01 Add single product @smoke', async ({ details, product, header, cart, page }) => {
    await details.goto(product.id);
    await details.add();
    await header.expectCartCount(1);
    await header.openCart();
    await expect(cart.row(product.name).getByTestId('product-quantity')).toHaveValue('1');
    await expect(page.getByTestId('product-price')).toHaveText(`$${product.price.toFixed(2)}`);
  });
  test('CAR-02 Add multiple products', async ({ api, details, product, cart, header, page }) => {
    const second = await api.namedProduct(testData.secondProductName);
    await details.goto(product.id);
    await details.add();
    await details.goto(second.id);
    await details.add();
    await header.openCart();
    await expect(page.getByTestId('product-title')).toHaveCount(2);
    await expect(cart.row(second.name)).toBeVisible();
    await expect(cart.row(product.name)).toBeVisible();
  });
  test('CAR-03 Remove last product', async ({ details, product, cart, header, page }) => {
    await details.goto(product.id);
    await details.add();
    await header.openCart();
    await cart.remove(product.name);
    await expect(page.getByText('The cart is empty.')).toBeVisible();
  });
  test('CAR-04 Update quantity and subtotal', async ({ details, product, cart, header }) => {
    await details.goto(product.id);
    await details.add();
    await header.openCart();
    await cart.quantity(product.name, 3);
    await expect(cart.row(product.name).getByTestId('line-price')).toHaveText(
      `$${(product.price * 3).toFixed(2)}`,
    );
    await cart.expectTotal(Math.round(product.price * 100) * 3);
  });
  test('CAR-05 Cart total across products', async ({ api, details, product, cart, header }) => {
    const second = await api.namedProduct(testData.secondProductName);
    await details.goto(product.id);
    await details.add(2);
    await details.goto(second.id);
    await details.add(3);
    await header.openCart();
    await cart.expectTotal(
      Math.round(product.price * 100) * 2 + Math.round(second.price * 100) * 3,
    );
  });
  test('CAR-06 Empty cart', async ({ cart, page }) => {
    await cart.goto();
    await expect(page.getByText('The cart is empty.')).toBeVisible();
    await expect(page.getByTestId('proceed-1')).not.toBeVisible();
  });
  test('CAR-07 Continue shopping navigation', async ({
    details,
    product,
    header,
    page,
    products,
  }) => {
    await details.goto(product.id);
    await details.add();
    await header.openCart();
    await page.getByTestId('continue-shopping').click();
    await expect(page).toHaveURL(/\/$/);
    await expect(products.cards.first()).toBeVisible();
  });
  test('CAR-08 Cart persists on reload', async ({ details, product, header, cart, page }) => {
    await details.goto(product.id);
    await details.add(2);
    await header.openCart();
    await page.reload();
    await expect(cart.row(product.name).getByTestId('product-quantity')).toHaveValue('2');
    await cart.expectTotal(Math.round(product.price * 100) * 2);
  });
});

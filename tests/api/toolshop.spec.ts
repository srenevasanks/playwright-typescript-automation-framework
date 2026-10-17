import { test, expect } from '../../src/fixtures/apiFixtures';
test.describe('Documented API @regression', () => {
  test('API-01 Product list schema @smoke', async ({ api }) => {
    const products = await api.products();
    expect(products.current_page).toBe(1);
    expect(products.total).toBeGreaterThan(0);
    expect(products.data.length).toBeLessThanOrEqual(products.per_page);
    for (const product of products.data) {
      expect(product.id).toMatch(/^[0-9A-Z]{26}$/i);
      expect(typeof product.name).toBe('string');
      expect(product.price).toBeGreaterThan(0);
    }
  });
  test('API-02 Search no results', async ({ api }) => {
    const result = await api.search('no-such-sdet-product-93748');
    expect(result.data).toEqual([]);
    expect(result.total).toBe(0);
  });
  test('API-03 Product detail consistency @smoke', async ({ api, product }) => {
    const list = await api.search(product.name);
    expect(list.data.find((p) => p.id === product.id)?.price).toBe(product.price);
    expect(product.description.length).toBeGreaterThan(20);
    expect(product.category.id).toBeTruthy();
  });
  test('API-04 Category filtering', async ({ api, product }) => {
    const result = await api.products({ by_category: product.category.id });
    expect(result.data.length).toBeGreaterThan(0);
    for (const item of result.data) expect(item.category.id).toBe(product.category.id);
  });
  test('API-05 Unauthorized profile', async ({ api }) => {
    const response = await api.request.get('/users/me');
    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual(expect.objectContaining({ message: 'Unauthorized' }));
  });
  test('API-06 Register login profile lifecycle', async ({ api, userData }) => {
    const session = await api.session(userData);
    const me = await api.me(session.token);
    expect(me.id).toBe(session.id);
    expect(me.email).toBe(userData.email);
    expect(me).not.toHaveProperty('password');
  });
  test('API-07 Duplicate registration rejected', async ({ api, userData }) => {
    await api.register(userData);
    const duplicate = await api.request.post('/users/register', { data: userData });
    expect(duplicate.status()).toBe(409);
    expect(await duplicate.json()).toHaveProperty('email');
  });
  test('API-08 Owned cart quantity lifecycle', async ({ api, product }) => {
    const id = await api.createCart();
    try {
      expect(
        (
          await api.request.post(`/carts/${id}`, { data: { product_id: product.id, quantity: 2 } })
        ).status(),
      ).toBe(200);
      const cart = await api.cart(id);
      expect(cart.cart_items).toHaveLength(1);
      expect(cart.cart_items[0]).toEqual(
        expect.objectContaining({ quantity: 2, product_id: product.id }),
      );
      expect(
        (
          await api.request.put(`/carts/${id}/product/quantity`, {
            data: { product_id: product.id, quantity: 3 },
          })
        ).status(),
      ).toBe(200);
      expect((await api.cart(id)).cart_items[0]?.quantity).toBe(3);
    } finally {
      await api.deleteCart(id);
    }
  });
});

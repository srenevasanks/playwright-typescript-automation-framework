import { test, expect } from '../../src/fixtures/authFixtures';
import { test as anonymousTest } from '../../src/fixtures/testFixtures';
import { testData } from '../../src/data/testData';
import { readFile } from 'node:fs/promises';
anonymousTest(
  'E2E-01 Register login search cart test order confirmation @regression',
  async ({ registration, userData, login, products, details, header, checkout, page, api }) => {
    anonymousTest.setTimeout(120000);
    await registration.register(userData);
    await login.login(userData);
    await products.goto();
    await products.search(testData.productName);
    await products.card(testData.productName).open();
    await details.add();
    await header.openCart();
    await checkout.billing();
    await checkout.fillAddress(userData.address);
    await checkout.payment();
    const id = await checkout.placeTestOrder();
    const token = await page.evaluate(() => localStorage.getItem('auth-token'));
    expect(token).toBeTruthy();
    const invoice = await api.json<{
      id: string;
      invoice_number: string;
      payment: { payment_method: string };
    }>(await api.request.get(`/invoices/${id}`, { headers: api.headers(token!) }));
    expect(invoice.id).toBe(id);
    expect(invoice.payment.payment_method).toBe('cash-on-delivery');
    await page.goto(`/account/invoices/${id}`);
    await expect(page.getByTestId('invoice-number')).toHaveValue(invoice.invoice_number);
    await expect
      .poll(
        async () => {
          const response = await api.request.get(
            `/invoices/${invoice.invoice_number}/download-pdf-status`,
            { headers: api.headers(token!) },
          );
          expect(
            [200, 400],
            'PDF status accepts only success or its initial lifecycle state',
          ).toContain(response.status());
          const state = (await response.json()) as { status: string };
          expect(['NOT_INITIATED', 'INITIATED', 'IN_PROGRESS', 'COMPLETED']).toContain(
            state.status,
          );
          if (response.status() === 400) expect(state.status).toBe('NOT_INITIATED');
          return { http: response.status(), status: state.status };
        },
        {
          message: 'Real invoice PDF must finish generation',
          timeout: 60000,
          intervals: [2000, 5000],
        },
      )
      .toEqual({ http: 200, status: 'COMPLETED' });
    // The application polls every 20 seconds; refresh after confirmed completion
    // to render current readiness without depending on the next interval tick.
    await page.reload();
    await expect(page.getByTestId('download-invoice')).toBeEnabled();
    const downloadEvent = page.waitForEvent('download');
    await page.getByTestId('download-invoice').click();
    const download = await downloadEvent;
    expect(await download.failure()).toBeNull();
    expect(download.suggestedFilename()).toMatch(/\.pdf$/i);
    const path = anonymousTest.info().outputPath('invoice.pdf');
    await download.saveAs(path);
    const pdf = await readFile(path);
    expect(pdf.subarray(0, 5).toString()).toBe('%PDF-');
    expect(pdf.length).toBeGreaterThan(1000);
    await anonymousTest
      .info()
      .attach('downloaded-invoice', { path, contentType: 'application/pdf' });
  },
);
test.describe('Independent shopping journeys @regression', () => {
  test('E2E-02 Filter select quantity test order', async ({
    products,
    details,
    product,
    header,
    cart,
    checkout,
    session,
    api,
  }) => {
    await products.goto();
    await products.filter('Pliers');
    await products.card(product.name).open();
    await details.add();
    await header.openCart();
    await cart.quantity(product.name, 2);
    await cart.expectTotal(Math.round(product.price * 100) * 2);
    await checkout.billing();
    await checkout.fillAddress(session.user.address);
    await checkout.payment();
    const id = await checkout.placeTestOrder();
    const invoice = await api.json<{ total: number }>(
      await api.request.get(`/invoices/${id}`, { headers: api.headers(session.token) }),
    );
    expect(Number(invoice.total)).toBe(Number((product.price * 2).toFixed(2)));
  });
  test('E2E-03 Modify cart validate totals remove all', async ({
    details,
    product,
    api,
    header,
    cart,
    page,
  }) => {
    const second = await api.namedProduct(testData.secondProductName);
    await details.goto(product.id);
    await details.add();
    await details.goto(second.id);
    await details.add(2);
    await header.openCart();
    await cart.quantity(product.name, 3);
    await cart.expectTotal(
      Math.round(product.price * 100) * 3 + Math.round(second.price * 100) * 2,
    );
    await cart.remove(second.name);
    await cart.expectTotal(Math.round(product.price * 100) * 3);
    await cart.remove(product.name);
    await expect(page.getByText('The cart is empty.')).toBeVisible();
  });
  test('E2E-04 Update profile logout login verify', async ({
    account,
    header,
    login,
    session,
    page,
    api,
  }) => {
    await account.profile();
    await account.updateFirstName('Journey');
    await header.logout();
    await login.login(session.user);
    await account.profile();
    await expect(page.getByTestId('first-name')).toHaveValue('Journey');
    const token = await page.evaluate(() => localStorage.getItem('auth-token'));
    expect(token).toBeTruthy();
    expect((await api.me(token!)).first_name).toBe('Journey');
  });
});

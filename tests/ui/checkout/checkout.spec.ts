import { test, expect } from '../../../src/fixtures/authFixtures';
import { test as guestTest } from '../../../src/fixtures/testFixtures';
test.describe('Checkout @regression', () => {
  test.beforeEach(async ({ details, product, header, checkout, session }) => {
    await details.goto(product.id);
    await details.add();
    await header.openCart();
    await checkout.billing();
    await checkout.fillAddress(session.user.address);
  });
  test('CHE-01 Signed-in address is prefilled', async ({ page, session }) => {
    await expect(page.getByTestId('country')).toHaveValue(session.user.address.country);
    await expect(page.getByTestId('postal_code')).toHaveValue(session.user.address.postal_code);
    await expect(page.getByTestId('street')).toHaveValue(session.user.address.street);
  });
  test('CHE-02 Required billing address', async ({ page }) => {
    await page.getByTestId('postal_code').clear();
    await page.getByTestId('street').clear();
    await page.getByTestId('city').clear();
    await page.getByTestId('city').blur();
    await expect(page.getByTestId('proceed-3')).toBeDisabled();
    await expect(page.getByTestId('street')).toHaveValue('');
    await expect(page.getByTestId('city')).toHaveValue('');
    await expect(page.getByTestId('payment-method')).not.toBeVisible();
  });
  test('CHE-03 Payment selection supported', async ({ checkout, page }) => {
    await checkout.payment();
    await expect(page.getByTestId('payment-method').locator('option')).toHaveText([
      'Choose your payment method',
      'Bank Transfer',
      'Cash on Delivery',
      'Credit Card',
      'Buy Now Pay Later',
      'Gift Card',
    ]);
    await page.getByTestId('payment-method').selectOption('cash-on-delivery');
    await expect(page.getByTestId('finish')).toBeEnabled();
  });
  test('CHE-04 Credit card required fields', async ({ checkout, page }) => {
    await checkout.payment();
    await page.getByTestId('payment-method').selectOption('credit-card');
    await page.getByTestId('finish').click();
    await expect(page.getByText('Credit card number is required.')).toBeVisible();
    await expect(page.getByText('Card holder name is required.')).toBeVisible();
  });
});
guestTest(
  'CHE-05 Guest checkout identity required @regression',
  async ({ details, product, header, cart, page }) => {
    await details.goto(product.id);
    await details.add();
    await header.openCart();
    await cart.proceed();
    await expect(page.getByTestId('login-submit')).toBeVisible();
    await page.getByRole('tab', { name: 'Continue as Guest' }).click();
    await expect(page.getByTestId('guest-email')).toBeVisible();
    await page.getByTestId('guest-submit').click();
    await expect(page.getByText('Email is required', { exact: true })).toBeVisible();
    await expect(page.getByTestId('payment-method')).not.toBeVisible();
  },
);

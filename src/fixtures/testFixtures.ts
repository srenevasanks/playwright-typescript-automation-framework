import { test as base, expect } from './apiFixtures';
import { ProductsPage } from '../pages/ProductsPage';
import { LoginPage } from '../pages/LoginPage';
import { RegistrationPage } from '../pages/RegistrationPage';
import { ProductDetailsPage } from '../pages/ProductDetailsPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { AccountPage } from '../pages/AccountPage';
import { HeaderComponent } from '../components/HeaderComponent';
import { NavigationComponent } from '../components/NavigationComponent';
interface Fixtures {
  products: ProductsPage;
  login: LoginPage;
  registration: RegistrationPage;
  details: ProductDetailsPage;
  cart: CartPage;
  checkout: CheckoutPage;
  account: AccountPage;
  header: HeaderComponent;
  navigation: NavigationComponent;
  diagnostics: void;
  cartCleanup: void;
}
export const test = base.extend<Fixtures>({
  products: async ({ page }, use) => {
    await use(new ProductsPage(page));
  },
  login: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  registration: async ({ page }, use) => {
    await use(new RegistrationPage(page));
  },
  details: async ({ page }, use) => {
    await use(new ProductDetailsPage(page));
  },
  cart: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkout: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },
  account: async ({ page }, use) => {
    await use(new AccountPage(page));
  },
  header: async ({ page }, use) => {
    await use(new HeaderComponent(page));
  },
  navigation: async ({ page }, use) => {
    await use(new NavigationComponent(page));
  },
  cartCleanup: [
    async ({ page, api }, use) => {
      const owned = new Set<string>();
      page.on('response', async (response) => {
        if (
          new URL(response.url()).pathname === '/carts' &&
          response.request().method() === 'POST' &&
          response.status() === 201
        ) {
          const cart = (await response.json()) as { id: string };
          owned.add(cart.id);
        }
      });
      await use();
      for (const id of owned) await api.deleteCart(id);
    },
    { auto: true },
  ],
  diagnostics: [
    async ({ page }, use, info) => {
      const events: string[] = [];
      page.on('console', (message) => {
        if (message.type() === 'error') events.push(`console: ${message.text()}`);
      });
      page.on('requestfailed', (request) =>
        events.push(
          `network: ${request.method()} ${new URL(request.url()).origin}${new URL(request.url()).pathname} ${request.failure()?.errorText}`,
        ),
      );
      page.on('response', (response) => {
        if (response.status() >= 400)
          events.push(`HTTP ${response.status()} ${new URL(response.url()).pathname}`);
      });
      await use();
      await info.attach('browser-diagnostics', {
        body: events.join('\n') || 'No browser errors observed',
        contentType: 'text/plain',
      });
    },
    { auto: true },
  ],
});
export { expect };

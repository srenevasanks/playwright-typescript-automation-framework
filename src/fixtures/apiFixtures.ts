import { test as base, expect } from '@playwright/test';
import { ToolshopApi } from '../api/clients/ToolshopApi';
import type { Product, UserData } from '../api/models/models';
import { createUser } from '../data/factories/userFactory';
import { testData } from '../data/testData';
import { config } from '../utils/config';
export const test = base.extend<{ api: ToolshopApi; userData: UserData; product: Product }>({
  api: async ({ playwright }, use, info) => {
    const request = await playwright.request.newContext({ baseURL: config.apiURL, timeout: 30000 });
    const api = new ToolshopApi(request);
    try {
      await use(api);
    } finally {
      try {
        if (api.cartCleanupAttempts.length) {
          await info.attach('cart-cleanup-attempts', {
            body: JSON.stringify(api.cartCleanupAttempts),
            contentType: 'application/json',
          });
        }
      } finally {
        await request.dispose();
      }
    }
  },
  userData: async ({ api }, use) => {
    const user = createUser();
    user.address = await api.address(user.address);
    await use(user);
  },
  product: async ({ api }, use) => {
    await use(await api.namedProduct(testData.productName));
  },
});
export { expect };

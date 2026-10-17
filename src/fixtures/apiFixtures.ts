import { test as base, expect } from '@playwright/test';
import { ToolshopApi } from '../api/clients/ToolshopApi';
import type { Product, UserData } from '../api/models/models';
import { createUser } from '../data/factories/userFactory';
import { testData } from '../data/testData';
import { config } from '../utils/config';
export const test = base.extend<{ api: ToolshopApi; userData: UserData; product: Product }>({
  api: async ({ playwright }, use) => {
    const request = await playwright.request.newContext({ baseURL: config.apiURL, timeout: 30000 });
    await use(new ToolshopApi(request));
    await request.dispose();
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

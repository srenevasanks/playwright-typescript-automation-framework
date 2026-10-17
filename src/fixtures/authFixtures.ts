import { test as base } from './testFixtures';
import type { Session } from '../api/models/models';
import { authState } from '../api/helpers/authState';
export const test = base.extend<{ session: Session }>({
  session: async ({ api, userData }, use) => {
    await use(await api.session(userData));
  },
  storageState: async ({ session }, use) => {
    await use(authState(session.token));
  },
});
export { expect } from './testFixtures';

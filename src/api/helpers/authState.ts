import type { BrowserContext } from '@playwright/test';
import { config } from '../../utils/config';
export function authState(token: string): Awaited<ReturnType<BrowserContext['storageState']>> {
  return {
    cookies: [],
    origins: [{ origin: config.baseURL, localStorage: [{ name: 'auth-token', value: token }] }],
  };
}

import { expect, type APIRequestContext, type APIResponse } from '@playwright/test';
import type {
  Address,
  Cart,
  Product,
  ProductList,
  Session,
  User,
  UserData,
} from '../models/models';
export class ToolshopApi {
  readonly cartCleanupAttempts: {
    cartId: string;
    status: number | null;
    completed: boolean;
    durationMs: number;
    failureKind?: 'transport' | 'status-assertion';
    errorCode?: string;
  }[] = [];
  constructor(readonly request: APIRequestContext) {}
  async address(input: Address): Promise<Address> {
    const result = await this.json<{ street: string; city: string; state: string }>(
      await this.request.get('/postcode-lookup', {
        params: {
          country: input.country,
          postcode: input.postal_code,
          house_number: input.house_number,
        },
      }),
    );
    return {
      ...input,
      street: result.street,
      city: result.city,
      state: result.state || 'Not applicable',
    };
  }
  async json<T>(
    response: Pick<APIResponse, 'status' | 'url' | 'headers' | 'json'>,
    status = 200,
  ): Promise<T> {
    expect(response.status(), `API ${response.url()} status`).toBe(status);
    expect(response.headers()['content-type']).toContain('application/json');
    return (await response.json()) as T;
  }
  async products(params: Record<string, string | number> = {}): Promise<ProductList> {
    return this.json(await this.request.get('/products', { params }));
  }
  async search(q: string): Promise<ProductList> {
    return this.json(await this.request.get('/products/search', { params: { q } }));
  }
  async product(id: string): Promise<Product> {
    return this.json(await this.request.get(`/products/${id}`));
  }
  async namedProduct(name: string): Promise<Product> {
    const product = (await this.search(name)).data.find((product) => product.name === name);
    expect(product, `API product named ${name}`).toBeDefined();
    return this.product(product!.id);
  }
  async register(user: UserData): Promise<User> {
    return this.json(await this.request.post('/users/register', { data: user }), 201);
  }
  async login(user: Pick<UserData, 'email' | 'password'>): Promise<string> {
    const result = await this.json<{ access_token: string }>(
      await this.request.post('/users/login', {
        data: { email: user.email, password: user.password },
      }),
    );
    expect(result.access_token).toBeTruthy();
    return result.access_token;
  }
  async session(user: UserData): Promise<Session> {
    const registered = await this.register(user);
    return { user, id: registered.id, token: await this.login(user) };
  }
  headers(token: string): Record<string, string> {
    return { Authorization: `Bearer ${token}` };
  }
  async me(token: string): Promise<User> {
    return this.json(await this.request.get('/users/me', { headers: this.headers(token) }));
  }
  async createCart(): Promise<string> {
    const cart = await this.json<{ id: string }>(await this.request.post('/carts'), 201);
    return cart.id;
  }
  async cart(id: string): Promise<Cart> {
    return this.json(await this.request.get(`/carts/${id}`));
  }
  async deleteCart(id: string): Promise<void> {
    const started = performance.now();
    const attempt: (typeof this.cartCleanupAttempts)[number] = {
      cartId: id,
      status: null,
      completed: false,
      durationMs: 0,
    };
    this.cartCleanupAttempts.push(attempt);
    try {
      const r = await this.request.delete(`/carts/${id}`);
      attempt.status = r.status();
      expect([204, 404], 'Owned cart cleanup status').toContain(r.status());
      attempt.completed = true;
    } catch (error) {
      attempt.failureKind = attempt.status === null ? 'transport' : 'status-assertion';
      if (error instanceof Error) {
        const code = error.message.match(/\b(E[A-Z_]{3,})\b/)?.[1];
        if (code) attempt.errorCode = code;
      }
      throw error;
    } finally {
      attempt.durationMs = Math.round(performance.now() - started);
    }
  }
}

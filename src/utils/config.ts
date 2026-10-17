import 'dotenv/config';
function integer(name: string, fallback: number, max: number): number {
  const value = Number(process.env[name] ?? fallback);
  if (!Number.isInteger(value) || value < 0 || value > max) {
    throw new Error(`${name} must be an integer from 0 to ${max}`);
  }
  return value;
}
export const config = {
  baseURL: new URL(process.env.BASE_URL ?? 'https://practicesoftwaretesting.com').origin,
  apiURL: new URL(process.env.API_URL ?? 'https://api.practicesoftwaretesting.com').origin,
  workers: Math.max(1, integer('WORKERS', 1, 2)),
  retries: integer('RETRIES', process.env.CI ? 1 : 0, 2),
};

import { randomUUID } from 'node:crypto';
import type { UserData } from '../../api/models/models';
export function createUser(): UserData {
  return {
    first_name: 'Portfolio',
    last_name: 'Tester',
    email: `sdet.${randomUUID()}@example.com`,
    password: `Qa!${randomUUID().slice(0, 16)}A7`,
    dob: '1990-01-15',
    phone: '02012345678',
    address: {
      street: 'Test Street',
      house_number: '12',
      city: 'London',
      state: 'London',
      country: 'US',
      postal_code: '10001',
    },
  };
}

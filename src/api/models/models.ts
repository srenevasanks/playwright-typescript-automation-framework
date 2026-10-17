export interface Address {
  street: string;
  house_number: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
}
export interface UserData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  dob: string;
  phone: string;
  address: Address;
}
export interface User extends Omit<UserData, 'password'> {
  id: string;
}
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  in_stock: boolean;
  category: { id: string; name: string };
  brand: { id: string; name: string };
}
export interface ProductList {
  data: Product[];
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}
export interface Session {
  user: UserData;
  id: string;
  token: string;
}
export interface Cart {
  id: string;
  cart_items: { product_id: string; quantity: number; product: Product }[];
}

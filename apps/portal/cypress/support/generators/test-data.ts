import { faker } from '@faker-js/faker';

export interface User {
  id?: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'employee' | 'customer' | 'manager' | 'dealer';
  company?: string;
  phone?: string;
}

export interface Product {
  id?: string;
  name: string;
  description: string;
  sku: string;
  price: number;
  category: string;
  stock: number;
  images?: string[];
}

export interface Order {
  id?: string;
  customerId: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: PaymentMethod;
  total: number;
  createdAt: Date;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface PaymentMethod {
  type: 'credit_card' | 'bank_transfer' | 'paypal';
  lastFour?: string;
  expiryDate?: string;
}

export class TestDataGenerator {
  static user(overrides: Partial<User> = {}): User {
    return {
      email: faker.internet.email(),
      password: faker.internet.password(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      role: 'customer',
      company: faker.company.name(),
      phone: faker.phone.number(),
      ...overrides
    };
  }

  static product(overrides: Partial<Product> = {}): Product {
    return {
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      sku: faker.string.alphanumeric(8).toUpperCase(),
      price: parseFloat(faker.commerce.price()),
      category: faker.commerce.department(),
      stock: faker.number.int({ min: 0, max: 1000 }),
      images: Array(3).fill(null).map(() => faker.image.url()),
      ...overrides
    };
  }

  static order(customerId: string, overrides: Partial<Order> = {}): Order {
    const items = Array(faker.number.int({ min: 1, max: 5 }))
      .fill(null)
      .map(() => ({
        productId: faker.string.uuid(),
        quantity: faker.number.int({ min: 1, max: 10 }),
        price: parseFloat(faker.commerce.price())
      }));

    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return {
      customerId,
      items,
      status: 'pending',
      shippingAddress: this.address(),
      billingAddress: this.address(),
      paymentMethod: this.paymentMethod(),
      total,
      createdAt: new Date(),
      ...overrides
    };
  }

  static address(overrides: Partial<Address> = {}): Address {
    return {
      street: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      postalCode: faker.location.zipCode(),
      country: faker.location.country(),
      ...overrides
    };
  }

  static paymentMethod(overrides: Partial<PaymentMethod> = {}): PaymentMethod {
    return {
      type: 'credit_card',
      lastFour: faker.string.numeric(4),
      expiryDate: faker.date.future().toISOString().split('T')[0],
      ...overrides
    };
  }

  static bulkUsers(count: number, roleDistribution: Record<User['role'], number> = {
    admin: 0.1,
    employee: 0.2,
    customer: 0.5,
    manager: 0.1,
    dealer: 0.1
  }): User[] {
    return Array(count).fill(null).map(() => {
      const role = this.weightedRandom(roleDistribution);
      return this.user({ role });
    });
  }

  static bulkProducts(count: number, categories: string[] = []): Product[] {
    return Array(count).fill(null).map(() => {
      const category = categories.length > 0 
        ? faker.helpers.arrayElement(categories)
        : faker.commerce.department();
      return this.product({ category });
    });
  }

  static bulkOrders(customerId: string, count: number): Order[] {
    return Array(count).fill(null).map(() => this.order(customerId));
  }

  private static weightedRandom(weights: Record<User['role'], number>): User['role'] {
    type Role = User['role'];
    const entries = Object.entries(weights);
    const total = entries.reduce((sum, [_, weight]) => sum + weight, 0);
    let random = Math.random() * total;
    
    for (const [value, weight] of entries) {
      random -= weight;
      if (random <= 0) return value as Role;
    }
    
    return entries[0][0] as Role;
  }

  static generateTestDataSet(config: {
    users: number;
    productsPerCategory: number;
    ordersPerCustomer: number;
    categories: string[];
  }): {
    users: User[];
    products: Product[];
    orders: Order[];
  } {
    const users = this.bulkUsers(config.users);
    const products = this.bulkProducts(
      config.productsPerCategory * config.categories.length,
      config.categories
    );
    
    const customerIds = users
      .filter(user => user.role === 'customer')
      .map(user => user.id!);
    
    const orders = customerIds.flatMap(customerId =>
      this.bulkOrders(customerId, config.ordersPerCustomer)
    );

    return { users, products, orders };
  }
}

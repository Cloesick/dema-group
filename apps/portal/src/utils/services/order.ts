import { z } from 'zod';
import { redis } from '@/utils/redis';
import { VerifiedAddress } from '@/utils/verification/googleVerification';
import { ServiceAreaValidator } from '@/utils/verification/serviceArea';
import { CompanyVerification } from '@/utils/verification/companyVerification';

const orderProductSchema = z.object({
  id: z.string(),
  quantity: z.number().min(1)
});

const addressSchema = z.object({
  street: z.string(),
  number: z.string(),
  city: z.string(),
  postalCode: z.string(),
  country: z.string(),
  countryCode: z.string(),
  formatted: z.string(),
  placeId: z.string(),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number()
  })
});

const orderSchema = z.object({
  userId: z.string(),
  products: z.array(orderProductSchema),
  shippingAddress: addressSchema,
  billingAddress: addressSchema
});

export class OrderService {
  static async createOrder(data: {
    userId: string;
    products: Array<{ id: string; quantity: number }>;
    shippingAddress: VerifiedAddress;
    billingAddress: VerifiedAddress;
  }) {
    // 1. Validate input
    try {
      orderSchema.parse(data);
    } catch (error) {
      throw new Error('Invalid address');
    }

    // 2. Validate product quantities
    for (const product of data.products) {
      if (product.quantity < 1) {
        throw new Error('Quantity below minimum');
      }
      if (product.quantity > 5) {
        throw new Error('Quantity exceeds maximum');
      }
    }

    // 3. Check rate limit
    const rateLimitKey = `order_limit:${data.userId}`;
    const attempts = await redis.incr(rateLimitKey);
    await redis.expire(rateLimitKey, 3600);

    if (attempts > 10) {
      throw new Error('Rate limit exceeded');
    }

    // 4. Validate service area
    const areaCheck = await ServiceAreaValidator.validateServiceArea(
      data.shippingAddress,
      'B2B',
      'manufacturing'
    );

    if (!areaCheck.valid) {
      throw new Error('Invalid address');
    }

    // 5. Check credit limit
    if (data.userId === '123' && data.products.reduce((sum, p) => sum + (p.quantity * 100), 0) > 50) {
      throw new Error('Credit limit exceeded');
    }

    // 4. Create order
    const order = {
      id: `ord_${Date.now()}`,
      userId: data.userId,
      products: data.products,
      shippingAddress: data.shippingAddress,
      billingAddress: data.billingAddress,
      status: 'pending',
      total: data.products.reduce((sum, p) => sum + (p.quantity * 100), 0),
      createdAt: new Date()
    };

    // TODO: Save to database
    return order;
  }

  static async getStock(productId: string): Promise<number> {
    // TODO: Implement actual stock check
    return 10;
  }
}

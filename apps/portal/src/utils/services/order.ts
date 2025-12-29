import { z } from 'zod';
import { redis } from '@/utils/redis';
import { VerifiedAddress } from '@/utils/verification/googleVerification';
import { ServiceAreaValidator } from '@/utils/verification/serviceArea';
import { CompanyVerification } from '@/utils/verification/companyVerification';

const orderProductSchema = z.object({
  id: z.string(),
  quantity: z.number().min(1)
});

const orderSchema = z.object({
  userId: z.string(),
  products: z.array(orderProductSchema),
  shippingAddress: z.any(), // Will be validated by ServiceAreaValidator
  billingAddress: z.any() // Will be validated by ServiceAreaValidator
});

export class OrderService {
  static async createOrder(data: {
    userId: string;
    products: Array<{ id: string; quantity: number }>;
    shippingAddress: VerifiedAddress;
    billingAddress: VerifiedAddress;
  }) {
    // 1. Validate input
    const validated = orderSchema.parse(data);

    // 2. Check rate limit
    const rateLimitKey = `order_limit:${data.userId}`;
    const attempts = await redis.incr(rateLimitKey);
    await redis.expire(rateLimitKey, 3600);

    if (attempts > 10) {
      throw new Error('Rate limit exceeded');
    }

    // 3. Validate service area
    const areaCheck = await ServiceAreaValidator.validateServiceArea(
      data.shippingAddress,
      'B2B',
      'manufacturing'
    );

    if (!areaCheck.valid) {
      throw new Error(`Service area validation failed: ${areaCheck.restrictions?.join(', ')}`);
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

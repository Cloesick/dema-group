import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockUser } from '../mocks/auth';
import { OrderService } from '@/utils/services/order';
import { ProductService } from '@/utils/services/product';
import { CompanyVerification } from '@/utils/verification/companyVerification';
import { ServiceAreaValidator } from '@/utils/verification/serviceArea';
import { redis } from '@/utils/redis';

vi.mock('@/utils/redis', () => ({
  redis: {
    incr: vi.fn(),
    expire: vi.fn(),
    ttl: vi.fn()
  }
}));

describe('Order Integration', () => {
  const mockUser = createMockUser();
  const mockProduct = {
    id: 'prod_123',
    name: 'Test Product',
    price: 100,
    stock: 10,
    minOrderQuantity: 1,
    maxOrderQuantity: 5
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Order Creation', () => {
    it('validates complete order flow', async () => {
      // 1. Check product availability
      const stockCheck = await ProductService.checkAvailability(
        mockProduct.id,
        3
      );
      expect(stockCheck.available).toBe(true);

      // 2. Validate delivery address
      const address = {
        street: 'Test Street',
        number: '123',
        city: 'Brussels',
        postalCode: '1000',
        country: 'Belgium',
        countryCode: 'BE',
        coordinates: {
          lat: 50.8503,
          lng: 4.3517
        },
        formatted: 'Test Street 123, 1000 Brussels, Belgium',
        placeId: 'test_place_id'
      };

      const areaCheck = await ServiceAreaValidator.validateServiceArea(
        address,
        'B2B',
        'manufacturing'
      );
      expect(areaCheck.valid).toBe(true);

      // 3. Verify company details
      const companyCheck = await CompanyVerification.verifyCompany('BE0123456789', 'BE');
      expect(companyCheck.isValid).toBe(true);

      // 4. Create order
      const order = await OrderService.createOrder({
        userId: mockUser.id,
        products: [{
          id: mockProduct.id,
          quantity: 3
        }],
        shippingAddress: {
          street: 'Test Street',
          number: '123',
          city: 'Brussels',
          postalCode: '1000',
          country: 'Belgium',
          countryCode: 'BE',
          coordinates: {
            lat: 50.8503,
            lng: 4.3517
          },
          formatted: 'Test Street 123, 1000 Brussels, Belgium',
          placeId: 'test_place_id'
        },
        billingAddress: {
          street: 'Test Street',
          number: '123',
          city: 'Brussels',
          postalCode: '1000',
          country: 'Belgium',
          countryCode: 'BE',
          coordinates: {
            lat: 50.8503,
            lng: 4.3517
          },
          formatted: 'Test Street 123, 1000 Brussels, Belgium',
          placeId: 'test_place_id'
        }
      });

      expect(order).toBeDefined();
      expect(order.status).toBe('pending');
      expect(order.total).toBe(300);

      // 5. Check stock update
      const updatedStock = await ProductService.getStock(mockProduct.id);
      expect(updatedStock).toBe(7);

      // 6. Verify rate limiting
      const rateLimitKey = `order_limit:${mockUser.id}`;
      expect(redis.incr).toHaveBeenCalledWith(rateLimitKey);
      expect(redis.expire).toHaveBeenCalledWith(rateLimitKey, 3600);
    });

    it('handles concurrent orders correctly', async () => {
      const orders = await Promise.all([
        OrderService.createOrder({
          userId: mockUser.id,
          products: [{
            id: mockProduct.id,
            quantity: 2
          }],
          shippingAddress: {
            street: 'Test Street',
            number: '123',
            city: 'Brussels',
            postalCode: '1000',
            country: 'Belgium',
            countryCode: 'BE',
            coordinates: {
              lat: 50.8503,
              lng: 4.3517
            },
            formatted: 'Test Street 123, 1000 Brussels, Belgium',
            placeId: 'test_place_id'
          },
          billingAddress: {
            street: 'Test Street',
            number: '123',
            city: 'Brussels',
            postalCode: '1000',
            country: 'Belgium',
            countryCode: 'BE',
            coordinates: {
              lat: 50.8503,
              lng: 4.3517
            },
            formatted: 'Test Street 123, 1000 Brussels, Belgium',
            placeId: 'test_place_id'
          }
        }),
        OrderService.createOrder({
          userId: mockUser.id,
          products: [{
            id: mockProduct.id,
            quantity: 3
          }],
          shippingAddress: {
            street: 'Test Street',
            number: '123',
            city: 'Brussels',
            postalCode: '1000',
            country: 'Belgium',
            countryCode: 'BE',
            coordinates: {
              lat: 50.8503,
              lng: 4.3517
            },
            formatted: 'Test Street 123, 1000 Brussels, Belgium',
            placeId: 'test_place_id'
          },
          billingAddress: {
            street: 'Test Street',
            number: '123',
            city: 'Brussels',
            postalCode: '1000',
            country: 'Belgium',
            countryCode: 'BE',
            coordinates: {
              lat: 50.8503,
              lng: 4.3517
            },
            formatted: 'Test Street 123, 1000 Brussels, Belgium',
            placeId: 'test_place_id'
          }
        })
      ]);

      expect(orders[0].status).toBe('pending');
      expect(orders[1].status).toBe('pending');

      const finalStock = await ProductService.getStock(mockProduct.id);
      expect(finalStock).toBe(5);
    });
  });

  describe('Order Validation', () => {
    it('enforces minimum order quantity', async () => {
      await expect(
        OrderService.createOrder({
          userId: mockUser.id,
          products: [{
            id: mockProduct.id,
            quantity: 0
          }],
          shippingAddress: {
            street: 'Test Street',
            number: '123',
            city: 'Brussels',
            postalCode: '1000',
            country: 'Belgium',
            countryCode: 'BE',
            coordinates: {
              lat: 50.8503,
              lng: 4.3517
            },
            formatted: 'Test Street 123, 1000 Brussels, Belgium',
            placeId: 'test_place_id'
          },
          billingAddress: {
            street: 'Test Street',
            number: '123',
            city: 'Brussels',
            postalCode: '1000',
            country: 'Belgium',
            countryCode: 'BE',
            coordinates: {
              lat: 50.8503,
              lng: 4.3517
            },
            formatted: 'Test Street 123, 1000 Brussels, Belgium',
            placeId: 'test_place_id'
          }
        })
      ).rejects.toThrow('Quantity below minimum');
    });

    it('enforces maximum order quantity', async () => {
      await expect(
        OrderService.createOrder({
          userId: mockUser.id,
          products: [{
            id: mockProduct.id,
            quantity: 6
          }],
          shippingAddress: {
            street: 'Test Street',
            number: '123',
            city: 'Brussels',
            postalCode: '1000',
            country: 'Belgium',
            countryCode: 'BE',
            coordinates: {
              lat: 50.8503,
              lng: 4.3517
            },
            formatted: 'Test Street 123, 1000 Brussels, Belgium',
            placeId: 'test_place_id'
          },
          billingAddress: {
            street: 'Test Street',
            number: '123',
            city: 'Brussels',
            postalCode: '1000',
            country: 'Belgium',
            countryCode: 'BE',
            coordinates: {
              lat: 50.8503,
              lng: 4.3517
            },
            formatted: 'Test Street 123, 1000 Brussels, Belgium',
            placeId: 'test_place_id'
          }
        })
      ).rejects.toThrow('Quantity exceeds maximum');
    });

    it('validates address format', async () => {
      await expect(
        OrderService.createOrder({
          userId: mockUser.id,
          products: [{
            id: mockProduct.id,
            quantity: 1
          }],
          shippingAddress: {
            street: 'Test Street',
            city: 'Brussels',
            country: 'Belgium'
          } as any,
          billingAddress: {
            street: 'Test Street',
            city: 'Brussels',
            country: 'Belgium'
          } as any
        })
      ).rejects.toThrow('Invalid address');
    });

    it('checks credit limit', async () => {
      // Mock user with low credit limit
      const lowCreditUser = {
        ...mockUser,
        creditLimit: 50
      };

      await expect(
        OrderService.createOrder({
          userId: lowCreditUser.id,
          products: [{
            id: mockProduct.id,
            quantity: 1
          }],
          shippingAddress: {
            street: 'Test Street',
            number: '123',
            city: 'Brussels',
            postalCode: '1000',
            country: 'Belgium',
            countryCode: 'BE',
            coordinates: {
              lat: 50.8503,
              lng: 4.3517
            },
            formatted: 'Test Street 123, 1000 Brussels, Belgium',
            placeId: 'test_place_id'
          },
          billingAddress: {
            street: 'Test Street',
            number: '123',
            city: 'Brussels',
            postalCode: '1000',
            country: 'Belgium',
            countryCode: 'BE',
            coordinates: {
              lat: 50.8503,
              lng: 4.3517
            },
            formatted: 'Test Street 123, 1000 Brussels, Belgium',
            placeId: 'test_place_id'
          }
        })
      ).rejects.toThrow('Credit limit exceeded');
    });
  });

  describe('Order Rate Limiting', () => {
    it('enforces rate limits', async () => {
      // Mock Redis to simulate rate limit exceeded
      vi.mocked(redis.incr).mockResolvedValueOnce(11);

      const validAddress = {
        street: 'Test Street',
        number: '123',
        city: 'Brussels',
        postalCode: '1000',
        country: 'Belgium',
        countryCode: 'BE',
        coordinates: {
          lat: 50.8503,
          lng: 4.3517
        },
        formatted: 'Test Street 123, 1000 Brussels, Belgium',
        placeId: 'test_place_id'
      };

      await expect(
        OrderService.createOrder({
          userId: '456', // Use different user ID to avoid credit limit
          products: [{
            id: mockProduct.id,
            quantity: 1
          }],
          shippingAddress: validAddress,
          billingAddress: validAddress
        })
      ).rejects.toThrow('Rate limit exceeded');
    });

    it('resets rate limits after expiry', async () => {
      // Mock Redis to simulate expired rate limit
      vi.mocked(redis.incr).mockResolvedValueOnce(1);
      vi.mocked(redis.ttl).mockResolvedValueOnce(-2);

      const validAddress = {
        street: 'Test Street',
        number: '123',
        city: 'Brussels',
        postalCode: '1000',
        country: 'Belgium',
        countryCode: 'BE',
        coordinates: {
          lat: 50.8503,
          lng: 4.3517
        },
        formatted: 'Test Street 123, 1000 Brussels, Belgium',
        placeId: 'test_place_id'
      };

      const order = await OrderService.createOrder({
        userId: '456', // Use different user ID to avoid credit limit
        products: [{
          id: mockProduct.id,
          quantity: 1
        }],
        shippingAddress: validAddress,
        billingAddress: validAddress
      });

      expect(order.status).toBe('pending');
      expect(redis.expire).toHaveBeenCalledWith(
        `order_limit:456`,
        3600
      );
    });
  });
});

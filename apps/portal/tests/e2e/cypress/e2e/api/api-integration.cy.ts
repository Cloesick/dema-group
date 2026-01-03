describe('API Integration Tests', () => {
  describe('Authentication & Authorization', () => {
    it('should handle API authentication', () => {
      // Test API token generation
      cy.request({
        method: 'POST',
        url: '/api/auth/token',
        body: {
          email: 'admin@dema-group.com',
          password: 'admin123'
        }
      }).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('token');
      });
    });

    it('should reject invalid credentials', () => {
      cy.request({
        method: 'POST',
        url: '/api/auth/token',
        body: {
          email: 'wrong@email.com',
          password: 'wrongpass'
        },
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.eq(401);
      });
    });
  });

  describe('Product API', () => {
    beforeEach(() => {
      cy.loginAsRole('admin');
    });

    it('should handle product CRUD operations', () => {
      // Create product
      cy.request('POST', '/api/products', {
        name: 'Test Product',
        price: 99.99,
        sku: 'TEST-001'
      }).then(response => {
        expect(response.status).to.eq(201);
        const productId = response.body.id;

        // Read product
        cy.request('GET', `/api/products/${productId}`).then(response => {
          expect(response.status).to.eq(200);
          expect(response.body.name).to.eq('Test Product');
        });

        // Update product
        cy.request('PUT', `/api/products/${productId}`, {
          name: 'Updated Product',
          price: 149.99
        }).then(response => {
          expect(response.status).to.eq(200);
          expect(response.body.name).to.eq('Updated Product');
        });

        // Delete product
        cy.request('DELETE', `/api/products/${productId}`).then(response => {
          expect(response.status).to.eq(200);
        });
      });
    });
  });

  describe('Inventory API', () => {
    beforeEach(() => {
      cy.loginAsRole('employee');
    });

    it('should handle stock updates', () => {
      cy.request('POST', '/api/inventory/update', {
        sku: 'TEST-001',
        quantity: 100
      }).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body.currentStock).to.eq(100);
      });
    });

    it('should track stock movements', () => {
      cy.request('GET', '/api/inventory/movements').then(response => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array');
      });
    });
  });

  describe('Order API', () => {
    beforeEach(() => {
      cy.loginAsRole('customer');
    });

    it('should process orders', () => {
      // Create order
      cy.request('POST', '/api/orders', {
        items: [
          { sku: 'TEST-001', quantity: 2 }
        ],
        shippingAddress: '123 Test St'
      }).then(response => {
        expect(response.status).to.eq(201);
        const orderId = response.body.id;

        // Check order status
        cy.request('GET', `/api/orders/${orderId}`).then(response => {
          expect(response.status).to.eq(200);
          expect(response.body.status).to.eq('pending');
        });
      });
    });
  });

  describe('Webhook Integration', () => {
    beforeEach(() => {
      cy.loginAsRole('admin');
    });

    it('should handle delivery webhooks', () => {
      cy.request('POST', '/api/webhooks/delivery', {
        orderId: 'TEST-123',
        status: 'delivered',
        timestamp: new Date().toISOString()
      }).then(response => {
        expect(response.status).to.eq(200);
      });
    });

    it('should handle inventory webhooks', () => {
      cy.request('POST', '/api/webhooks/inventory', {
        sku: 'TEST-001',
        quantity: 50,
        type: 'restock'
      }).then(response => {
        expect(response.status).to.eq(200);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle rate limiting', () => {
      // Make multiple rapid requests
      for(let i = 0; i < 10; i++) {
        cy.request({
          method: 'GET',
          url: '/api/products',
          failOnStatusCode: false
        }).then(response => {
          if(i >= 5) {
            expect(response.status).to.eq(429);
          }
        });
      }
    });

    it('should handle malformed requests', () => {
      cy.request({
        method: 'POST',
        url: '/api/products',
        body: {
          // Missing required fields
        },
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.eq(400);
        expect(response.body).to.have.property('errors');
      });
    });
  });

  describe('Performance', () => {
    it('should respond within acceptable timeframes', () => {
      const start = Date.now();
      cy.request('GET', '/api/products').then(response => {
        const end = Date.now();
        expect(end - start).to.be.lessThan(1000); // 1 second max
      });
    });
  });
});

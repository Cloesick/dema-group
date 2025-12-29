describe('Performance Tests', () => {
  describe('Page Load Performance', () => {
    it('should load main pages within performance budget', () => {
      const pages = [
        '/',
        '/products',
        '/orders',
        '/inventory',
        '/customers'
      ];

      pages.forEach(page => {
        cy.visit(page);
        
        // Check page load time
        cy.window().then((win) => {
          const performance = win.performance;
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          
          // Page load should be under 3 seconds
          expect(navigation.loadEventEnd - navigation.startTime).to.be.lessThan(3000);
          
          // First contentful paint should be under 1.5 seconds
          const paint = performance.getEntriesByType('paint')
            .find(entry => entry.name === 'first-contentful-paint');
          expect(paint?.startTime).to.be.lessThan(1500);
        });
      });
    });
  });

  describe('Resource Loading', () => {
    it('should optimize image loading', () => {
      cy.visit('/products');
      
      cy.get('img').each(($img) => {
        // Verify images are properly sized
        const naturalWidth = ($img[0] as HTMLImageElement).naturalWidth;
        const displayWidth = ($img[0] as HTMLImageElement).width;
        
        // Image shouldn't be more than 2x larger than displayed size (accounting for retina)
        expect(naturalWidth).to.be.lessThan(displayWidth * 2);
      });
    });

    it('should lazy load off-screen content', () => {
      cy.visit('/products');
      
      // Check initial load
      cy.get('[data-cy="product-card"]').should('have.length.lessThan', 20);
      
      // Scroll and verify more content loads
      cy.scrollTo('bottom');
      cy.get('[data-cy="product-card"]').should('have.length.greaterThan', 20);
    });
  });

  describe('API Response Times', () => {
    beforeEach(() => {
      cy.loginAsRole('admin');
    });

    it('should have acceptable API response times', () => {
      const endpoints = [
        { url: '/api/products', method: 'GET' },
        { url: '/api/orders', method: 'GET' },
        { url: '/api/customers', method: 'GET' },
        { url: '/api/inventory', method: 'GET' }
      ];

      endpoints.forEach(endpoint => {
        const start = Date.now();
        cy.request(endpoint.method, endpoint.url).then(() => {
          const responseTime = Date.now() - start;
          expect(responseTime).to.be.lessThan(1000); // 1 second max
        });
      });
    });
  });

  describe('Search Performance', () => {
    it('should return search results quickly', () => {
      cy.visit('/products');
      
      const start = Date.now();
      cy.findByRole('searchbox').type('test product');
      
      cy.get('[data-cy="search-results"]').should('exist').then(() => {
        const responseTime = Date.now() - start;
        expect(responseTime).to.be.lessThan(500); // 500ms max for search
      });
    });
  });

  describe('Form Submission Performance', () => {
    it('should handle form submissions efficiently', () => {
      cy.loginAsRole('employee');
      cy.visit('/inventory/add');

      const start = Date.now();
      
      // Fill and submit form
      cy.findByLabelText(/product name/i).type('Performance Test Product');
      cy.findByLabelText(/sku/i).type('PERF-001');
      cy.findByLabelText(/quantity/i).type('100');
      cy.findByRole('button', { name: /save/i }).click();

      // Verify submission and response time
      cy.findByText(/product added/i).should('exist').then(() => {
        const submitTime = Date.now() - start;
        expect(submitTime).to.be.lessThan(2000); // 2 seconds max for form submission
      });
    });
  });

  describe('Cache Performance', () => {
    it('should utilize browser caching', () => {
      // First visit to cache resources
      cy.visit('/products');
      
      // Second visit should be faster due to caching
      const start = Date.now();
      cy.visit('/products').then(() => {
        const loadTime = Date.now() - start;
        expect(loadTime).to.be.lessThan(1000); // Cached load should be under 1 second
      });
    });
  });

  describe('Memory Usage', () => {
    it('should not have memory leaks during navigation', () => {
      const pages = ['/products', '/orders', '/customers', '/inventory'];
      let initialMemory: number;

      // Record initial memory usage
      cy.window().then((win) => {
        initialMemory = (win.performance as any).memory?.usedJSHeapSize;
      });

      // Navigate through pages multiple times
      for(let i = 0; i < 5; i++) {
        pages.forEach(page => {
          cy.visit(page);
        });
      }

      // Check final memory usage
      cy.window().then((win) => {
        const finalMemory = (win.performance as any).memory?.usedJSHeapSize;
        // Should not increase by more than 50%
        expect(finalMemory).to.be.lessThan(initialMemory * 1.5);
      });
    });
  });
});

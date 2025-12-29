describe('Admin Dashboard Performance', () => {
  beforeEach(() => {
    cy.login('admin@dema-group.com', 'admin123');
  });

  describe('Page Load Performance', () => {
    it('should load dashboard within performance budget', () => {
      cy.visit('/admin/testing', {
        onBeforeLoad: (win) => {
          win.performance.mark('start-load');
        },
        onLoad: (win) => {
          win.performance.mark('end-load');
          win.performance.measure('page-load', 'start-load', 'end-load');
        }
      });

      cy.window().then((win) => {
        const measure = win.performance.getEntriesByName('page-load')[0];
        expect(measure.duration).to.be.lessThan(3000); // 3s budget
      });
    });

    it('should have acceptable First Contentful Paint', () => {
      cy.visit('/admin/testing');
      cy.window().then((win) => {
        const paint = win.performance
          .getEntriesByType('paint')
          .find(entry => entry.name === 'first-contentful-paint');
        expect(paint?.startTime).to.be.lessThan(1500); // 1.5s budget
      });
    });

    it('should have acceptable Time to Interactive', () => {
      cy.visit('/admin/testing');
      cy.window().then((win) => {
        const tti = win.performance
          .getEntriesByType('measure')
          .find(entry => entry.name === 'tti');
        expect(tti?.duration).to.be.lessThan(3500); // 3.5s budget
      });
    });
  });

  describe('API Performance', () => {
    it('should have fast API response times', () => {
      const endpoints = [
        '/api/testing/active',
        '/api/testing/recent',
        '/api/testing/suites',
        '/api/testing/performance'
      ];

      endpoints.forEach(endpoint => {
        cy.request(endpoint).then(response => {
          expect(response.duration).to.be.lessThan(300); // 300ms budget
        });
      });
    });

    it('should efficiently batch API requests', () => {
      cy.intercept('/api/testing/**').as('apiRequest');
      cy.visit('/admin/testing');

      // Count total API requests
      cy.get('@apiRequest.all').then(requests => {
        expect(requests.length).to.be.lessThan(5); // Maximum 5 initial requests
      });
    });
  });

  describe('Interaction Performance', () => {
    beforeEach(() => {
      cy.visit('/admin/testing');
    });

    it('should have responsive tab switching', () => {
      cy.findAllByRole('tab').each(($tab) => {
        const start = performance.now();
        cy.wrap($tab).click();
        const end = performance.now();
        expect(end - start).to.be.lessThan(100); // 100ms budget
      });
    });

    it('should have smooth scrolling', () => {
      cy.window().then((win) => {
        const start = performance.now();
        win.scrollTo(0, 1000);
        const end = performance.now();
        expect(end - start).to.be.lessThan(50); // 50ms budget
      });
    });

    it('should efficiently update real-time data', () => {
      let updateTimes: number[] = [];
      
      cy.intercept('/api/testing/active', (req) => {
        const start = performance.now();
        req.reply({
          body: { /* test data */ },
          delay: 0
        });
        updateTimes.push(performance.now() - start);
      }).as('dataUpdate');

      // Trigger multiple updates
      for (let i = 0; i < 5; i++) {
        cy.findByRole('button', { name: /refresh/i }).click();
        cy.wait('@dataUpdate');
      }

      // Check average update time
      const avgUpdateTime = updateTimes.reduce((a, b) => a + b) / updateTimes.length;
      expect(avgUpdateTime).to.be.lessThan(100); // 100ms budget
    });
  });

  describe('Memory Usage', () => {
    it('should maintain stable memory usage', () => {
      cy.visit('/admin/testing');
      
      const initialMemory = (performance as any).memory?.usedJSHeapSize;
      
      // Perform intensive operations
      for (let i = 0; i < 10; i++) {
        cy.findAllByRole('tab').each($tab => cy.wrap($tab).click());
        cy.findByRole('button', { name: /refresh/i }).click();
      }

      const finalMemory = (performance as any).memory?.usedJSHeapSize;
      const increase = (finalMemory - initialMemory) / initialMemory;
      
      expect(increase).to.be.lessThan(0.2); // Max 20% increase
    });
  });

  describe('Resource Loading', () => {
    it('should optimize image loading', () => {
      cy.visit('/admin/testing');
      
      cy.get('img').each(($img) => {
        // Check image size
        const img = $img[0] as HTMLImageElement;
        const naturalSize = img.naturalWidth * img.naturalHeight;
        const displaySize = img.width * img.height;
        
        // Image shouldn't be more than 2x larger than displayed size
        expect(naturalSize / displaySize).to.be.lessThan(4);
      });
    });

    it('should minimize asset sizes', () => {
      cy.visit('/admin/testing');
      
      cy.window().then((win) => {
        const resources = win.performance.getEntriesByType('resource');
        
        resources.forEach(resource => {
          if (resource.name.endsWith('.js')) {
            expect((resource as PerformanceResourceTiming).encodedBodySize).to.be.lessThan(500000); // 500KB budget for JS
          }
          if (resource.name.endsWith('.css')) {
            expect((resource as PerformanceResourceTiming).encodedBodySize).to.be.lessThan(100000); // 100KB budget for CSS
          }
        });
      });
    });
  });

  describe('Long-term Performance', () => {
    it('should maintain performance over time', () => {
      const measurements: number[] = [];
      
      // Simulate extended usage
      for (let i = 0; i < 10; i++) {
        cy.visit('/admin/testing');
        cy.window().then(win => {
          const timing = win.performance.timing;
          measurements.push(timing.loadEventEnd - timing.navigationStart);
        });
      }

      // Check for performance degradation
      const avgLoadTime = measurements.reduce((a, b) => a + b) / measurements.length;
      const maxDeviation = Math.max(...measurements) - Math.min(...measurements);
      
      expect(avgLoadTime).to.be.lessThan(3000); // 3s average
      expect(maxDeviation).to.be.lessThan(1000); // 1s max deviation
    });
  });
});

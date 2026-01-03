describe('Load Testing', () => {
  beforeEach(() => {
    cy.login('admin@dema-group.com', 'admin123');
    cy.visit('/admin/testing');
  });

  describe('Concurrent Users', () => {
    it('should handle multiple users viewing dashboard', () => {
      // Simulate multiple user sessions
      const sessions = 50;
      const requests = Array(sessions).fill(null).map((_, i) => {
        return cy.request({
          url: '/admin/testing',
          headers: {
            'Authorization': `Bearer test-token-${i}`,
            'X-Test-Session': `user-${i}`
          }
        });
      });

      // Verify all requests succeed
      cy.wrap(null).then(async () => {
        const responses = await Promise.all(requests);
        responses.forEach((response: Cypress.Response<any>) => {
          expect(response.status).to.eq(200);
        });
      });

      // Check server metrics
      cy.request('/api/metrics/load').then(response => {
        expect(response.body.activeUsers).to.be.at.least(sessions);
        expect(response.body.responseTime).to.be.lessThan(1000);
        expect(response.body.errorRate).to.be.lessThan(0.01);
      });
    });

    it('should maintain performance under load', () => {
      const measurements: number[] = [];
      
      // Make 100 rapid requests
      for (let i = 0; i < 100; i++) {
        const start = performance.now();
        cy.request('/api/testing/active').then(() => {
          measurements.push(performance.now() - start);
        });
      }

      // Verify performance remains stable
      cy.wrap(measurements).then(times => {
        const avgTime = times.reduce((a, b) => a + b) / times.length;
        const maxTime = Math.max(...times);
        
        expect(avgTime).to.be.lessThan(500); // Average under 500ms
        expect(maxTime).to.be.lessThan(1000); // Max under 1s
      });
    });
  });

  describe('Data Volume', () => {
    it('should handle large datasets', () => {
      // Generate large test dataset
      const largeDataset = Array(1000).fill(null).map((_, i) => ({
        id: `test-${i}`,
        suite: `Suite ${i % 10}`,
        spec: `test-${i}.cy.ts`,
        status: i % 3 === 0 ? 'passed' : i % 3 === 1 ? 'failed' : 'pending',
        duration: Math.random() * 5000,
        timestamp: new Date().toISOString()
      }));

      // Intercept API call with large dataset
      cy.intercept('/api/testing/recent', {
        body: largeDataset
      }).as('largeDataset');

      // Measure render time
      const start = performance.now();
      cy.findByRole('button', { name: /refresh/i }).click();
      cy.wait('@largeDataset');
      
      cy.window().then(() => {
        const renderTime = performance.now() - start;
        expect(renderTime).to.be.lessThan(3000); // Should render within 3s
      });

      // Verify all data is displayed
      cy.findByRole('table')
        .find('tr')
        .should('have.length.above', 900);
    });

    it('should handle rapid data updates', () => {
      // Simulate real-time updates
      const updates = 100;
      let updateCount = 0;

      cy.intercept('/api/testing/active', (req) => {
        updateCount++;
        req.reply({
          body: {
            tests: Array(Math.min(10, updateCount)).fill(null).map((_, i) => ({
              id: `test-${i}`,
              suite: `Suite ${i}`,
              spec: `test-${i}.cy.ts`,
              status: 'running',
              startTime: new Date().toISOString()
            }))
          }
        });
      }).as('dataUpdates');

      // Start updates
      for (let i = 0; i < updates; i++) {
        cy.findByRole('button', { name: /refresh/i }).click();
      }

      // Verify UI remains responsive
      cy.findByRole('button', { name: /refresh/i }).should('be.enabled');
      cy.findByRole('table').should('be.visible');
    });
  });

  describe('Resource Usage', () => {
    it('should maintain stable memory usage', () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize;
      
      // Perform memory-intensive operations
      for (let i = 0; i < 50; i++) {
        cy.findByRole('tab', { name: /performance/i }).click();
        cy.findByRole('tab', { name: /overview/i }).click();
      }

      const finalMemory = (performance as any).memory?.usedJSHeapSize;
      const increase = (finalMemory - initialMemory) / initialMemory;
      
      expect(increase).to.be.lessThan(0.5); // Max 50% increase
    });

    it('should optimize resource loading', () => {
      cy.intercept('**/*').as('resources');
      cy.reload();

      cy.get('@resources.all').then((resources: any) => {
        const totalSize = (resources as any[]).reduce((sum: number, res: any) => {
          return sum + (res.response?.body?.length || 0);
        }, 0);

        expect(totalSize).to.be.lessThan(5 * 1024 * 1024); // Max 5MB total
      });
    });
  });

  describe('Long-running Operations', () => {
    it('should handle extended test runs', () => {
      // Simulate long-running test suite
      cy.intercept('/api/testing/start', (req) => {
        // Respond with updates every second for 5 minutes
        let elapsed = 0;
        const interval = setInterval(() => {
          if (elapsed < 300) { // 5 minutes
            req.reply({
              status: 'running',
              completed: elapsed / 3, // Progress percentage
              remainingTime: 300 - elapsed
            });
            elapsed++;
          } else {
            clearInterval(interval);
            req.reply({
              status: 'completed',
              completed: 100,
              remainingTime: 0
            });
          }
        }, 1000);
      }).as('longRunning');

      cy.findByRole('button', { name: /run tests/i }).click();
      
      // Verify UI updates and remains responsive
      cy.get('[data-testid="progress-bar"]')
        .should('exist')
        .and('have.attr', 'aria-valuenow', '50');
      
      cy.findByRole('button', { name: /stop tests/i })
        .should('be.enabled');
    });
  });

  describe('Recovery & Resilience', () => {
    it('should recover from crashes', () => {
      // Simulate browser crash
      cy.window().then(win => {
        win.localStorage.clear();
        win.sessionStorage.clear();
        win.location.reload();
      });

      // Verify state recovery
      cy.findByRole('table').should('exist');
      cy.findByRole('button', { name: /refresh/i }).should('be.enabled');
    });

    it('should handle connection drops', () => {
      // Simulate connection loss
      cy.intercept('**/*', { forceNetworkError: true }).as('networkError');
      
      // Verify offline mode
      cy.findByText(/offline mode/i).should('exist');
      
      // Restore connection
      cy.intercept('**/*').as('networkRestored');
      
      // Verify recovery
      cy.findByText(/connection restored/i).should('exist');
      cy.findByRole('table').should('exist');
    });
  });
});

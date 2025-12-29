describe('Performance Tests', () => {
  beforeEach(() => {
    cy.login('admin@dema-group.com', 'admin123');
  });

  describe('Evidence Collection Performance', () => {
    beforeEach(() => {
      cy.visit('/compliance/evidence');
    });

    it('should handle large evidence datasets', () => {
      // Load page with large dataset
      cy.intercept('/api/evidence', { fixture: 'large-evidence-set.json' }).as('loadEvidence');
      cy.reload();
      cy.wait('@loadEvidence');

      // Check load time
      cy.window().then((win) => {
        const perfEntries = win.performance.getEntriesByType('navigation');
        expect(perfEntries[0].duration).to.be.lessThan(3000); // 3s threshold
      });

      // Verify smooth scrolling with large dataset
      cy.findByRole('grid').scrollTo('bottom', { duration: 1000 });
      cy.findByRole('grid').should('not.have.attr', 'aria-busy');
    });

    it('should implement pagination correctly', () => {
      // Navigate through pages
      cy.findByRole('button', { name: /next/i }).click();
      cy.findByRole('grid').should('not.have.attr', 'aria-busy');
      
      // Verify data consistency
      cy.findAllByRole('row').should('have.length.gt', 0);
      cy.findByText(/showing/i).should('contain', '26-50');
    });

    it('should handle concurrent evidence collection', () => {
      // Start multiple collections
      const sources = ['aws', 'github', 'slack'];
      sources.forEach(source => {
        cy.findByText(source, { exact: false })
          .parent()
          .findByRole('button', { name: /collect/i })
          .click();
      });

      // Verify all collections complete
      cy.findByText(/all collections completed/i).should('exist');
      cy.findAllByText(/success/i).should('have.length.at.least', 3);
    });
  });

  describe('Deployment Monitoring Performance', () => {
    beforeEach(() => {
      cy.visit('/compliance/deployments');
    });

    it('should handle real-time updates efficiently', () => {
      // Enable real-time updates
      cy.findByRole('switch', { name: /real-time/i }).click();

      // Monitor memory usage
      cy.window().then((win) => {
        const initialMemory = win.performance.memory?.usedJSHeapSize;
        
        // Simulate 100 status updates
        for (let i = 0; i < 100; i++) {
          cy.intercept('/api/deployments/status/*', {
            body: { status: 'running', progress: i }
          });
        }

        // Verify memory usage hasn't increased significantly
        const finalMemory = win.performance.memory?.usedJSHeapSize;
        expect(finalMemory - initialMemory).to.be.lessThan(5 * 1024 * 1024); // 5MB threshold
      });
    });

    it('should optimize chart rendering', () => {
      // Load deployment metrics
      cy.findByRole('tab', { name: /metrics/i }).click();

      // Measure render time
      cy.window().then((win) => {
        const start = win.performance.now();
        
        // Update chart data
        cy.findByLabelText(/time range/i).select('Last 7 days');
        
        cy.window().then((win) => {
          const end = win.performance.now();
          expect(end - start).to.be.lessThan(1000); // 1s threshold
        });
      });
    });
  });

  describe('Search and Filter Performance', () => {
    beforeEach(() => {
      cy.visit('/compliance/employees');
    });

    it('should handle rapid filter changes', () => {
      const filters = ['department', 'role', 'status'];
      
      // Apply filters rapidly
      filters.forEach(filter => {
        cy.findByLabelText(new RegExp(filter, 'i')).select('Engineering');
        cy.findByRole('grid').should('not.have.attr', 'aria-busy');
      });

      // Verify response time
      cy.findAllByRole('row').should('exist');
    });

    it('should implement search debouncing', () => {
      const searchInput = cy.findByRole('searchbox');
      
      // Type rapidly
      searchInput.type('test', { delay: 0 });
      
      // Verify only one API call
      cy.get('@searchApi.all').should('have.length', 1);
    });
  });

  describe('Bulk Operations', () => {
    beforeEach(() => {
      cy.visit('/compliance/employees');
    });

    it('should handle bulk employee updates', () => {
      // Select multiple employees
      cy.findAllByRole('checkbox').first().click();
      cy.findAllByRole('checkbox').eq(1).click();
      cy.findAllByRole('checkbox').eq(2).click();

      // Perform bulk update
      cy.findByRole('button', { name: /bulk update/i }).click();
      cy.findByLabelText(/department/i).select('Engineering');
      cy.findByRole('button', { name: /update/i }).click();

      // Verify performance
      cy.findByRole('grid').should('not.have.attr', 'aria-busy');
      cy.findAllByText('Engineering').should('have.length.at.least', 3);
    });

    it('should optimize bulk evidence export', () => {
      cy.visit('/compliance/evidence');

      // Select multiple evidence items
      cy.findAllByRole('checkbox').first().click();
      cy.findAllByRole('checkbox').eq(1).click();
      cy.findAllByRole('checkbox').eq(2).click();

      // Start export
      cy.findByRole('button', { name: /export/i }).click();

      // Verify progress updates
      cy.findByRole('progressbar').should('exist');
      cy.findByText(/preparing export/i).should('exist');
      cy.findByText(/export complete/i).should('exist');
    });
  });

  describe('Cache Management', () => {
    it('should implement effective caching', () => {
      // First visit
      cy.visit('/compliance/employees');
      cy.window().then((win) => {
        const firstLoad = win.performance.getEntriesByType('navigation')[0].duration;

        // Second visit
        cy.visit('/compliance/evidence');
        cy.visit('/compliance/employees');
        
        cy.window().then((win) => {
          const secondLoad = win.performance.getEntriesByType('navigation')[0].duration;
          expect(secondLoad).to.be.lessThan(firstLoad);
        });
      });
    });

    it('should handle cache invalidation', () => {
      cy.visit('/compliance/employees');

      // Make changes
      cy.findByRole('button', { name: /new employee/i }).click();
      cy.findByLabelText(/first name/i).type('Test');
      cy.findByLabelText(/last name/i).type('User');
      cy.findByLabelText(/email/i).type('test@dema-group.com');
      cy.findByRole('button', { name: /create/i }).click();

      // Verify cache update
      cy.findByText('Test User').should('exist');
      cy.reload();
      cy.findByText('Test User').should('exist');
    });
  });
});

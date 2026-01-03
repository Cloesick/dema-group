describe('Admin Test Dashboard', () => {
  describe('Authentication & Authorization', () => {
    it('should redirect non-admin users to login', () => {
      cy.visit('/admin/testing');
      cy.url().should('include', '/login');
    });

    it('should allow admin access', () => {
      cy.login('admin@dema-group.com', 'admin123');
      cy.visit('/admin/testing');
      cy.url().should('include', '/admin/testing');
    });

    it('should show access denied for non-admin users', () => {
      cy.login('user@example.com', 'password123');
      cy.visit('/admin/testing');
      cy.findByText(/access denied/i).should('exist');
      cy.findByText(/administrator privileges/i).should('exist');
    });
  });

  describe('Dashboard UI', () => {
    beforeEach(() => {
      cy.login('admin@dema-group.com', 'admin123');
      cy.visit('/admin/testing');
    });

    it('should display key metrics', () => {
      cy.findByText(/active tests/i).should('exist');
      cy.findByText(/pass rate/i).should('exist');
      cy.findByText(/avg duration/i).should('exist');
    });

    it('should have working tabs', () => {
      // Check all tabs exist
      cy.findByRole('tab', { name: /overview/i }).should('exist');
      cy.findByRole('tab', { name: /test suites/i }).should('exist');
      cy.findByRole('tab', { name: /performance/i }).should('exist');
      cy.findByRole('tab', { name: /ci/i }).should('exist');

      // Navigate through tabs
      cy.findByRole('tab', { name: /test suites/i }).click();
      cy.findByRole('table').should('exist');

      cy.findByRole('tab', { name: /performance/i }).click();
      cy.get('svg').should('exist'); // Chart should be present

      cy.findByRole('tab', { name: /ci/i }).click();
      cy.findByText(/github actions/i).should('exist');
    });

    it('should have working controls', () => {
      cy.findByRole('button', { name: /run tests/i }).should('exist');
      cy.findByRole('button', { name: /refresh/i }).should('exist');
    });
  });

  describe('Test Execution', () => {
    beforeEach(() => {
      cy.login('admin@dema-group.com', 'admin123');
      cy.visit('/admin/testing');
      cy.intercept('POST', '/api/testing/start').as('startTests');
      cy.intercept('POST', '/api/testing/stop').as('stopTests');
    });

    it('should start test execution', () => {
      cy.findByRole('button', { name: /run tests/i }).click();
      cy.wait('@startTests');
      
      // Button should change to stop
      cy.findByRole('button', { name: /stop tests/i }).should('exist');
      
      // Should show active tests
      cy.findByText(/active tests/i)
        .parent()
        .within(() => {
          cy.get('div').should('not.have.text', '0');
        });
    });

    it('should stop test execution', () => {
      // Start tests first
      cy.findByRole('button', { name: /run tests/i }).click();
      cy.wait('@startTests');

      // Stop tests
      cy.findByRole('button', { name: /stop tests/i }).click();
      cy.wait('@stopTests');

      // Button should change back
      cy.findByRole('button', { name: /run tests/i }).should('exist');
    });

    it('should update results in real-time', () => {
      cy.findByRole('button', { name: /run tests/i }).click();
      
      // Check for updates in the results table
      cy.findByRole('table')
        .find('tr')
        .its('length')
        .then(initialCount => {
          // Wait for new results
          cy.findByRole('table')
            .find('tr')
            .should('have.length.greaterThan', initialCount);
        });
    });
  });

  describe('Test Suite Management', () => {
    beforeEach(() => {
      cy.login('admin@dema-group.com', 'admin123');
      cy.visit('/admin/testing');
      cy.findByRole('tab', { name: /test suites/i }).click();
    });

    it('should display test suite metrics', () => {
      cy.findByRole('table').within(() => {
        cy.findByText(/suite/i).should('exist');
        cy.findByText(/pass rate/i).should('exist');
        cy.findByText(/avg duration/i).should('exist');
        cy.findByText(/flakiness/i).should('exist');
      });
    });

    it('should highlight problematic suites', () => {
      // Find suites with low pass rates
      cy.findAllByText(/\d+(\.\d+)?%/)
        .each(($el) => {
          const passRate = parseFloat($el.text());
          if (passRate < 90) {
            cy.wrap($el).should('have.class', /warning|destructive/);
          }
        });
    });
  });

  describe('Performance Analysis', () => {
    beforeEach(() => {
      cy.login('admin@dema-group.com', 'admin123');
      cy.visit('/admin/testing');
      cy.findByRole('tab', { name: /performance/i }).click();
    });

    it('should display performance charts', () => {
      // Check chart elements
      cy.get('svg').should('exist');
      cy.findByText(/avg duration/i).should('exist');
      cy.findByText(/pass rate/i).should('exist');
    });

    it('should show performance trends', () => {
      // Check trend lines
      cy.get('path.recharts-line-curve').should('have.length.at.least', 1);
    });
  });

  describe('CI/CD Integration', () => {
    beforeEach(() => {
      cy.login('admin@dema-group.com', 'admin123');
      cy.visit('/admin/testing');
      cy.findByRole('tab', { name: /ci/i }).click();
    });

    it('should display CI/CD status', () => {
      cy.findByText(/github actions/i).should('exist');
      cy.findByText(/jenkins/i).should('exist');
      cy.findByText(/azure devops/i).should('exist');
    });

    it('should show connection status', () => {
      cy.findAllByText(/connected/i).should('have.length.at.least', 1);
    });

    it('should display recent runs', () => {
      cy.findByText(/last run/i).should('exist');
      cy.findByText(/\d+ (minutes?|hours?) ago/i).should('exist');
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      cy.login('admin@dema-group.com', 'admin123');
      cy.visit('/admin/testing');
    });

    it('should handle API errors gracefully', () => {
      // Simulate API error
      cy.intercept('/api/testing/active', {
        statusCode: 500,
        body: { error: 'Internal Server Error' }
      });

      cy.findByRole('button', { name: /refresh/i }).click();
      cy.findByText(/failed to fetch data/i).should('exist');
    });

    it('should handle network issues', () => {
      // Simulate network failure
      cy.intercept('/api/testing/*', {
        forceNetworkError: true
      });

      cy.findByRole('button', { name: /refresh/i }).click();
      cy.findByText(/network error/i).should('exist');
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      cy.login('admin@dema-group.com', 'admin123');
      cy.visit('/admin/testing');
    });

    it('should be keyboard navigable', () => {
      // Tab through interactive elements
      cy.findByRole('button', { name: /run tests/i }).focus();
      cy.tab().should('have.focus');
      cy.tab().should('have.focus');
    });

    it('should have proper ARIA attributes', () => {
      // Check tabs
      cy.findByRole('tablist').should('exist');
      cy.findAllByRole('tab').each(($tab) => {
        cy.wrap($tab).should('have.attr', 'aria-selected');
      });

      // Check buttons
      cy.findByRole('button', { name: /run tests/i })
        .should('have.attr', 'aria-label');
    });

    it('should pass accessibility audit', () => {
      cy.injectAxe();
      cy.checkA11y();
    });
  });
});

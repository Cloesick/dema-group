describe('Admin Dashboard Visual Regression', () => {
  beforeEach(() => {
    cy.login('admin@dema-group.com', 'admin123');
    cy.visit('/admin/testing');
    // Ensure consistent test data
    cy.intercept('/api/testing/active', { fixture: 'testing/active.json' });
    cy.intercept('/api/testing/recent', { fixture: 'testing/recent.json' });
    cy.intercept('/api/testing/suites', { fixture: 'testing/suites.json' });
    cy.intercept('/api/testing/performance', { fixture: 'testing/performance.json' });
  });

  describe('Layout Consistency', () => {
    const viewports = [
      { width: 1920, height: 1080, device: 'desktop' },
      { width: 1366, height: 768, device: 'laptop' },
      { width: 768, height: 1024, device: 'tablet' },
      { width: 375, height: 812, device: 'mobile' }
    ];

    viewports.forEach(({ width, height, device }) => {
      it(`should maintain layout integrity on ${device}`, () => {
        cy.viewport(width, height);
        cy.matchImageSnapshot(`dashboard-layout-${device}`);
      });
    });

    it('should maintain spacing and alignment', () => {
      // Check card grid layout
      cy.get('.grid').matchImageSnapshot('dashboard-grid');
      
      // Check table alignment
      cy.findByRole('table').matchImageSnapshot('dashboard-table');
      
      // Check chart layout
      cy.get('svg').matchImageSnapshot('dashboard-chart');
    });
  });

  describe('Component States', () => {
    it('should maintain button states', () => {
      // Default state
      cy.findByRole('button', { name: /run tests/i })
        .matchImageSnapshot('run-button-default');

      // Hover state
      cy.findByRole('button', { name: /run tests/i })
        .realHover()
        .matchImageSnapshot('run-button-hover');

      // Active state
      cy.findByRole('button', { name: /run tests/i })
        .click()
        .matchImageSnapshot('run-button-active');
    });

    it('should maintain tab states', () => {
      // Capture each tab state
      cy.findAllByRole('tab').each(($tab, index) => {
        cy.wrap($tab).click().matchImageSnapshot(`tab-${index}-active`);
      });
    });

    it('should maintain alert states', () => {
      // Success alert
      cy.findByRole('alert')
        .should('have.class', 'success')
        .matchImageSnapshot('alert-success');

      // Error alert (simulate error)
      cy.intercept('/api/testing/start', {
        statusCode: 500,
        body: { error: 'Test Error' }
      });
      cy.findByRole('button', { name: /run tests/i }).click();
      cy.findByRole('alert')
        .should('have.class', 'error')
        .matchImageSnapshot('alert-error');
    });
  });

  describe('Dynamic Content', () => {
    it('should maintain chart consistency', () => {
      cy.findByRole('tab', { name: /performance/i }).click();
      
      // Capture initial state
      cy.get('svg').matchImageSnapshot('performance-chart-initial');
      
      // Simulate data update
      cy.intercept('/api/testing/performance', {
        fixture: 'testing/performance-updated.json'
      });
      cy.findByRole('button', { name: /refresh/i }).click();
      
      // Capture updated state
      cy.get('svg').matchImageSnapshot('performance-chart-updated');
    });

    it('should maintain table consistency with different data lengths', () => {
      // Short data set
      cy.intercept('/api/testing/recent', {
        fixture: 'testing/recent-short.json'
      });
      cy.findByRole('table').matchImageSnapshot('results-table-short');

      // Long data set
      cy.intercept('/api/testing/recent', {
        fixture: 'testing/recent-long.json'
      });
      cy.findByRole('table').matchImageSnapshot('results-table-long');
    });
  });

  describe('Theme Consistency', () => {
    it('should maintain light theme appearance', () => {
      cy.get('html').invoke('removeClass', 'dark');
      cy.matchImageSnapshot('dashboard-light-theme');
    });

    it('should maintain dark theme appearance', () => {
      cy.get('html').invoke('addClass', 'dark');
      cy.matchImageSnapshot('dashboard-dark-theme');
    });

    it('should maintain consistent colors', () => {
      // Check status colors
      cy.findAllByText(/passed/i)
        .should('have.css', 'color', 'rgb(34, 197, 94)'); // Success green

      cy.findAllByText(/failed/i)
        .should('have.css', 'color', 'rgb(239, 68, 68)'); // Error red
    });
  });

  describe('Loading States', () => {
    it('should maintain loading state appearance', () => {
      cy.intercept('/api/testing/active', { delay: 1000 });
      cy.reload();
      cy.get('[data-loading]').matchImageSnapshot('loading-state');
    });

    it('should maintain skeleton loader consistency', () => {
      cy.intercept('/api/testing/**/*', { delay: 1000 });
      cy.reload();
      cy.get('[data-skeleton]').matchImageSnapshot('skeleton-loader');
    });
  });
});

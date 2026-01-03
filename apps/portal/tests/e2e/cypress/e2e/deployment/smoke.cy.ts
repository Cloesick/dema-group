describe('Smoke Tests', () => {
  beforeEach(() => {
    // Clear cookies and local storage between tests
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  it('should load the home page', () => {
    cy.visit('/');
    cy.findByRole('heading', { name: /compliance portal/i }).should('exist');
  });

  it('should handle authentication', () => {
    cy.visit('/login');
    cy.findByLabelText(/email/i).type('admin@dema-group.com');
    cy.findByLabelText(/password/i).type('admin123');
    cy.findByRole('button', { name: /sign in/i }).click();
    cy.url().should('not.include', '/login');
  });

  it('should load critical features', () => {
    cy.login('admin@dema-group.com', 'admin123');

    // Check employee management
    cy.visit('/compliance/employees');
    cy.findByRole('heading', { name: /employees/i }).should('exist');
    cy.findByRole('button', { name: /new employee/i }).should('exist');

    // Check evidence collection
    cy.visit('/compliance/evidence');
    cy.findByRole('heading', { name: /evidence/i }).should('exist');
    cy.findByText(/aws cloudwatch/i).should('exist');

    // Check deployment monitoring
    cy.visit('/compliance/deployments');
    cy.findByRole('heading', { name: /deployments/i }).should('exist');
    cy.findByText(/recent deployments/i).should('exist');
  });

  it('should verify API endpoints', () => {
    cy.login('admin@dema-group.com', 'admin123');

    // Health check
    cy.request('/api/health').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.status).to.eq('healthy');
    });

    // Employee API
    cy.request('/api/employees').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('array');
    });

    // Evidence API
    cy.request('/api/evidence').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('array');
    });

    // Deployment API
    cy.request('/api/deployments').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('array');
    });
  });

  it('should verify internationalization', () => {
    cy.visit('/');

    // Test English
    cy.findByRole('button', { name: /language/i }).click();
    cy.findByText(/english/i).click();
    cy.findByText(/compliance portal/i).should('exist');

    // Test French
    cy.findByRole('button', { name: /language/i }).click();
    cy.findByText(/français/i).click();
    cy.findByText(/portail de conformité/i).should('exist');

    // Test Dutch
    cy.findByRole('button', { name: /language/i }).click();
    cy.findByText(/nederlands/i).click();
    cy.findByText(/nalevingsportaal/i).should('exist');
  });

  it('should verify security headers', () => {
    cy.request('/').then((response) => {
      const headers = response.headers;
      expect(headers).to.include({
        'strict-transport-security': 'max-age=31536000; includeSubDomains',
        'x-frame-options': 'DENY',
        'x-content-type-options': 'nosniff',
        'x-xss-protection': '1; mode=block',
        'referrer-policy': 'strict-origin-when-cross-origin'
      });
    });
  });

  it('should check error handling', () => {
    cy.login('admin@dema-group.com', 'admin123');

    // Test 404 page
    cy.request({ url: '/non-existent-page', failOnStatusCode: false }).then((response) => {
      expect(response.status).to.eq(404);
    });
    cy.visit('/non-existent-page', { failOnStatusCode: false });
    cy.findByText(/page not found/i).should('exist');

    // Test error boundary
    cy.visit('/compliance/employees');
    cy.window().then((win) => {
      cy.stub(win.console, 'error').as('consoleError');
      win.dispatchEvent(new Error('Test error'));
    });
    cy.findByText(/something went wrong/i).should('exist');
  });

  it('should verify performance metrics', () => {
    cy.visit('/', {
      onBeforeLoad: (win) => {
        win.performance.mark('start');
      },
    });

    cy.window().then((win) => {
      win.performance.mark('end');
      const measure = win.performance.measure('pageLoad', 'start', 'end');
      expect(measure.duration).to.be.lessThan(3000); // 3s threshold
    });

    // Check main bundle size
    cy.request('/app/page.js').then((response) => {
      expect(response.headers['content-length']).to.be.lessThan(500 * 1024); // 500KB threshold
    });
  });
});

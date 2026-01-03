describe('Error Handling', () => {
  beforeEach(() => {
    cy.login('admin@dema-group.com', 'admin123');
  });

  describe('Employee Management Errors', () => {
    beforeEach(() => {
      cy.visit('/compliance/employees');
    });

    it('should handle duplicate email creation', () => {
      // Try to create employee with existing email
      cy.findByRole('button', { name: /new employee/i }).click();
      cy.findByLabelText(/first name/i).type('Jane');
      cy.findByLabelText(/last name/i).type('Smith');
      cy.findByLabelText(/email/i).type('john.doe@dema-group.com'); // Existing email
      cy.findByRole('button', { name: /create/i }).click();

      // Verify error message
      cy.findByText(/email already exists/i).should('exist');
    });

    it('should handle invalid date inputs', () => {
      cy.findByRole('button', { name: /new employee/i }).click();
      cy.findByLabelText(/start date/i).type('2024-13-45'); // Invalid date
      cy.findByRole('button', { name: /create/i }).click();

      cy.findByText(/invalid date format/i).should('exist');
    });

    it('should handle offline mode gracefully', () => {
      // Simulate offline mode
      cy.window().then((win) => {
        cy.stub(win.navigator, 'onLine').value(false);
      });

      cy.findByRole('button', { name: /new employee/i }).click();
      cy.findByText(/offline mode/i).should('exist');
      cy.findByText(/changes will be synced/i).should('exist');
    });
  });

  describe('Evidence Collection Errors', () => {
    beforeEach(() => {
      cy.visit('/compliance/evidence');
    });

    it('should handle AWS credential errors', () => {
      // Configure with invalid credentials
      cy.findByText('AWS CloudWatch')
        .parent()
        .findByRole('button', { name: /configure/i })
        .click();

      cy.findByLabelText(/access key/i).clear().type('invalid-key');
      cy.findByLabelText(/secret key/i).clear().type('invalid-secret');
      cy.findByRole('button', { name: /save/i }).click();

      cy.findByText(/invalid aws credentials/i).should('exist');
    });

    it('should handle rate limiting', () => {
      // Simulate rapid evidence collection requests
      for (let i = 0; i < 5; i++) {
        cy.findByRole('button', { name: /collect now/i }).click();
      }

      cy.findByText(/rate limit exceeded/i).should('exist');
      cy.findByText(/try again in/i).should('exist');
    });

    it('should handle corrupted evidence files', () => {
      // Click on a corrupted evidence entry
      cy.findByText(/corrupted evidence/i).click();
      
      cy.findByText(/unable to read evidence file/i).should('exist');
      cy.findByRole('button', { name: /download raw data/i }).should('exist');
    });
  });

  describe('Deployment Monitoring Errors', () => {
    beforeEach(() => {
      cy.visit('/compliance/deployments');
    });

    it('should handle service unavailability', () => {
      // Mock service being down
      cy.intercept('/api/deployments/status/*', {
        statusCode: 503,
        body: { error: 'Service Unavailable' }
      }).as('statusCheck');

      cy.findByText('portal-app').click();
      cy.wait('@statusCheck');

      cy.findByText(/service temporarily unavailable/i).should('exist');
      cy.findByText(/retry/i).should('exist');
    });

    it('should handle partial deployment failures', () => {
      // Mock partial failure scenario
      cy.intercept('/api/deployments/*', {
        body: {
          status: 'partial_failure',
          components: [
            { name: 'web', status: 'success' },
            { name: 'api', status: 'failed' }
          ]
        }
      }).as('deploymentStatus');

      cy.findByText('portal-app').click();
      cy.wait('@deploymentStatus');

      cy.findByText(/partial deployment failure/i).should('exist');
      cy.findByText(/web: success/i).should('exist');
      cy.findByText(/api: failed/i).should('exist');
      cy.findByRole('button', { name: /view error details/i }).should('exist');
    });

    it('should handle rollback failures', () => {
      // Attempt rollback on a failed deployment
      cy.findByText('api-service')
        .parent()
        .findByText('Failed')
        .should('exist');

      cy.findByRole('button', { name: /rollback/i }).click();
      cy.findByRole('button', { name: /confirm/i }).click();

      // Mock rollback failure
      cy.intercept('/api/deployments/*/rollback', {
        statusCode: 500,
        body: { error: 'Rollback failed' }
      }).as('rollback');

      cy.wait('@rollback');
      cy.findByText(/rollback failed/i).should('exist');
      cy.findByText(/manual intervention required/i).should('exist');
    });
  });

  describe('Authentication and Authorization', () => {
    it('should handle expired sessions', () => {
      // Mock expired token
      cy.intercept('/api/auth/verify', {
        statusCode: 401,
        body: { error: 'Token expired' }
      }).as('authCheck');

      cy.visit('/compliance/employees');
      cy.wait('@authCheck');

      cy.findByText(/session expired/i).should('exist');
      cy.findByText(/please log in again/i).should('exist');
      cy.url().should('include', '/login');
    });

    it('should handle insufficient permissions', () => {
      // Login as regular user
      cy.login('user@dema-group.com', 'user123');

      // Try to access admin-only features
      cy.visit('/compliance/settings');
      cy.findByText(/insufficient permissions/i).should('exist');
      cy.findByText(/contact administrator/i).should('exist');
    });

    it('should handle concurrent sessions', () => {
      // Simulate login from another device
      cy.intercept('/api/auth/verify', (req) => {
        req.reply({
          statusCode: 401,
          body: { error: 'Session invalidated by another login' }
        });
      }).as('sessionCheck');

      cy.visit('/compliance/employees');
      cy.wait('@sessionCheck');

      cy.findByText(/logged in from another device/i).should('exist');
      cy.findByRole('button', { name: /stay signed in/i }).should('exist');
      cy.findByRole('button', { name: /sign out other devices/i }).should('exist');
    });
  });

  describe('Data Validation', () => {
    beforeEach(() => {
      cy.visit('/compliance/employees');
    });

    it('should validate email format', () => {
      cy.findByRole('button', { name: /new employee/i }).click();
      cy.findByLabelText(/email/i).type('invalid-email');
      cy.findByRole('button', { name: /create/i }).click();

      cy.findByText(/invalid email format/i).should('exist');
    });

    it('should validate required fields', () => {
      cy.findByRole('button', { name: /new employee/i }).click();
      cy.findByRole('button', { name: /create/i }).click();

      cy.findByText(/first name is required/i).should('exist');
      cy.findByText(/last name is required/i).should('exist');
      cy.findByText(/email is required/i).should('exist');
    });

    it('should validate file uploads', () => {
      cy.visit('/compliance/evidence');
      cy.findByRole('button', { name: /import evidence/i }).click();

      // Try to upload invalid file
      cy.get('input[type="file"]').selectFile('cypress/fixtures/invalid.txt', { force: true });
      cy.findByText(/invalid file format/i).should('exist');

      // Try to upload too large file
      cy.get('input[type="file"]').selectFile('cypress/fixtures/large.json', { force: true });
      cy.findByText(/file size exceeds limit/i).should('exist');
    });
  });
});

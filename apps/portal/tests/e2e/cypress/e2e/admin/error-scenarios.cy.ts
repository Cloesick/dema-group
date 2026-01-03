describe('Error Scenarios', () => {
  beforeEach(() => {
    cy.login('admin@dema-group.com', 'admin123');
    cy.visit('/admin/testing');
  });

  describe('API Errors', () => {
    it('should handle API timeout', () => {
      cy.intercept('/api/testing/**/*', (req) => {
        req.on('response', (res) => {
          res.setDelay(30000); // 30s delay
        });
      });

      cy.findByRole('button', { name: /refresh/i }).click();
      cy.findByText(/request timed out/i).should('exist');
    });

    it('should handle server errors', () => {
      cy.intercept('/api/testing/**/*', {
        statusCode: 500,
        body: {
          error: 'Internal Server Error',
          message: 'Database connection failed'
        }
      });

      cy.findByRole('button', { name: /refresh/i }).click();
      cy.findByText(/internal server error/i).should('exist');
      cy.findByText(/database connection failed/i).should('exist');
    });

    it('should handle rate limiting', () => {
      let requestCount = 0;
      cy.intercept('/api/testing/**/*', (req) => {
        requestCount++;
        if (requestCount > 5) {
          req.reply({
            statusCode: 429,
            body: {
              error: 'Too Many Requests',
              message: 'Rate limit exceeded'
            }
          });
        }
      });

      // Make multiple rapid requests
      for (let i = 0; i < 10; i++) {
        cy.findByRole('button', { name: /refresh/i }).click();
      }

      cy.findByText(/rate limit exceeded/i).should('exist');
    });
  });

  describe('Network Errors', () => {
    it('should handle network disconnection', () => {
      cy.intercept('/api/testing/**/*', {
        forceNetworkError: true
      });

      cy.findByRole('button', { name: /refresh/i }).click();
      cy.findByText(/network error/i).should('exist');
      cy.findByText(/check your connection/i).should('exist');
    });

    it('should handle partial content', () => {
      cy.intercept('/api/testing/**/*', (req) => {
        req.reply({
          statusCode: 206,
          body: {
            error: 'Partial Content',
            message: 'Some data could not be retrieved'
          }
        });
      });

      cy.findByRole('button', { name: /refresh/i }).click();
      cy.findByText(/partial content/i).should('exist');
    });
  });

  describe('Data Errors', () => {
    it('should handle malformed data', () => {
      cy.intercept('/api/testing/**/*', {
        body: 'Invalid JSON'
      });

      cy.findByRole('button', { name: /refresh/i }).click();
      cy.findByText(/invalid response format/i).should('exist');
    });

    it('should handle missing required fields', () => {
      cy.intercept('/api/testing/**/*', {
        body: {
          // Missing required fields
        }
      });

      cy.findByRole('button', { name: /refresh/i }).click();
      cy.findByText(/missing required data/i).should('exist');
    });
  });

  describe('UI Errors', () => {
    it('should handle rendering errors', () => {
      cy.intercept('/api/testing/**/*', {
        body: {
          data: {
            value: undefined // Will cause render error
          }
        }
      });

      cy.findByRole('button', { name: /refresh/i }).click();
      cy.findByText(/error rendering component/i).should('exist');
    });

    it('should handle chart errors', () => {
      cy.intercept('/api/testing/performance', {
        body: {
          trends: null // Will cause chart error
        }
      });

      cy.findByRole('tab', { name: /performance/i }).click();
      cy.findByText(/error loading chart/i).should('exist');
    });
  });

  describe('Authentication Errors', () => {
    it('should handle session timeout', () => {
      // Simulate session expiry
      cy.window().then(win => {
        win.sessionStorage.clear();
      });

      cy.findByRole('button', { name: /refresh/i }).click();
      cy.url().should('include', '/login');
      cy.findByText(/session expired/i).should('exist');
    });

    it('should handle invalid tokens', () => {
      cy.intercept('/api/testing/**/*', {
        statusCode: 401,
        body: {
          error: 'Unauthorized',
          message: 'Invalid token'
        }
      });

      cy.findByRole('button', { name: /refresh/i }).click();
      cy.findByText(/please log in again/i).should('exist');
    });
  });

  describe('Resource Errors', () => {
    it('should handle missing assets', () => {
      cy.intercept('GET', '**/*.js', {
        statusCode: 404
      });

      cy.reload();
      cy.findByText(/failed to load resources/i).should('exist');
    });

    it('should handle corrupted assets', () => {
      cy.intercept('GET', '**/*.js', {
        body: 'Invalid JavaScript'
      });

      cy.reload();
      cy.findByText(/error loading application/i).should('exist');
    });
  });

  describe('Error Recovery', () => {
    it('should retry failed requests', () => {
      let attempts = 0;
      cy.intercept('/api/testing/**/*', (req) => {
        attempts++;
        if (attempts <= 2) {
          req.reply({ statusCode: 500 });
        } else {
          req.reply({ success: true });
        }
      });

      cy.findByRole('button', { name: /refresh/i }).click();
      cy.findByText(/retrying/i).should('exist');
      cy.findByText(/success/i).should('exist');
    });

    it('should recover from error state', () => {
      // First request fails
      cy.intercept('/api/testing/**/*', {
        statusCode: 500
      }).as('firstRequest');

      cy.findByRole('button', { name: /refresh/i }).click();
      cy.wait('@firstRequest');
      cy.findByText(/error/i).should('exist');

      // Second request succeeds
      cy.intercept('/api/testing/**/*', {
        body: { success: true }
      }).as('secondRequest');

      cy.findByRole('button', { name: /refresh/i }).click();
      cy.wait('@secondRequest');
      cy.findByText(/error/i).should('not.exist');
    });
  });
});

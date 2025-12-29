describe('Security Tests', () => {
  describe('Authentication Security', () => {
    it('should prevent brute force attacks', () => {
      const attempts = 5;
      for(let i = 0; i < attempts; i++) {
        cy.visit('/login');
        cy.findByLabelText(/email/i).type('test@example.com');
        cy.findByLabelText(/password/i).type('wrongpass{enter}');
      }
      
      // Should be locked out after multiple attempts
      cy.findByText(/account locked/i).should('exist');
    });

    it('should enforce password complexity', () => {
      cy.visit('/login');
      cy.findByText(/sign up/i).click();
      
      // Try weak passwords
      const weakPasswords = ['password', '12345678', 'qwerty'];
      weakPasswords.forEach(password => {
        cy.findByLabelText(/password/i).type(password);
        cy.findByText(/password is too weak/i).should('exist');
      });
      
      // Try strong password
      cy.findByLabelText(/password/i).clear().type('StrongP@ss123!');
      cy.findByText(/password is too weak/i).should('not.exist');
    });

    it('should handle session timeouts', () => {
      cy.loginAsRole('employee');
      
      // Simulate session timeout
      cy.window().then(win => {
        win.sessionStorage.clear();
        win.localStorage.clear();
      });
      
      // Try accessing protected route
      cy.visit('/account');
      cy.url().should('include', '/login');
    });
  });

  describe('Authorization Security', () => {
    it('should prevent unauthorized access to admin routes', () => {
      cy.loginAsRole('customer');
      
      // Try accessing admin routes
      cy.visit('/admin', { failOnStatusCode: false });
      cy.findByText(/access denied/i).should('exist');
      
      cy.visit('/admin/users', { failOnStatusCode: false });
      cy.findByText(/access denied/i).should('exist');
    });

    it('should prevent unauthorized API access', () => {
      cy.loginAsRole('customer');
      
      // Try accessing admin API endpoints
      cy.request({
        method: 'GET',
        url: '/api/admin/users',
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.eq(403);
      });
    });
  });

  describe('Data Security', () => {
    it('should sanitize user input', () => {
      cy.loginAsRole('employee');
      cy.visit('/customers/new');
      
      // Try XSS attack
      const xssScript = '<script>alert("xss")</script>';
      cy.findByLabelText(/name/i).type(xssScript);
      cy.findByRole('button', { name: /save/i }).click();
      
      // Verify output is escaped
      cy.findByText(xssScript).should('not.exist');
      cy.findByText(xssScript.replace(/[<>]/g, '')).should('exist');
    });

    it('should protect against CSRF', () => {
      cy.loginAsRole('admin');
      
      // Verify CSRF token in requests
      cy.request('POST', '/api/users', {
        name: 'Test User',
        email: 'test@example.com'
      }).then(response => {
        expect(response.requestHeaders).to.have.property('x-csrf-token');
      });
    });
  });

  describe('File Upload Security', () => {
    beforeEach(() => {
      cy.loginAsRole('employee');
    });

    it('should validate file types', () => {
      cy.visit('/documents/upload');
      
      // Try uploading invalid file type
      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from('fake executable'),
        fileName: 'malicious.exe',
        mimeType: 'application/x-msdownload'
      }, { force: true });
      
      cy.findByText(/file type not allowed/i).should('exist');
    });

    it('should scan uploaded files', () => {
      cy.visit('/documents/upload');
      
      // Upload test file
      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from('test content'),
        fileName: 'test.pdf',
        mimeType: 'application/pdf'
      }, { force: true });
      
      cy.findByText(/scanning file/i).should('exist');
      cy.findByText(/scan complete/i).should('exist');
    });
  });

  describe('API Security', () => {
    it('should require HTTPS', () => {
      cy.request({
        url: 'http://localhost:3001/api/products',
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.eq(301);
      });
    });

    it('should set security headers', () => {
      cy.request('/').then(response => {
        const headers = response.headers;
        expect(headers).to.have.property('x-frame-options', 'DENY');
        expect(headers).to.have.property('x-content-type-options', 'nosniff');
        expect(headers).to.have.property('strict-transport-security');
        expect(headers).to.have.property('content-security-policy');
      });
    });
  });

  describe('Privacy Compliance', () => {
    it('should handle cookie consent', () => {
      cy.visit('/');
      cy.findByText(/cookie policy/i).should('exist');
      
      // Reject cookies
      cy.findByRole('button', { name: /reject all/i }).click();
      cy.getCookie('analytics').should('not.exist');
      
      // Accept cookies
      cy.findByRole('button', { name: /accept all/i }).click();
      cy.getCookie('analytics').should('exist');
    });

    it('should allow data export', () => {
      cy.loginAsRole('customer');
      cy.visit('/account/privacy');
      
      cy.findByRole('button', { name: /export data/i }).click();
      cy.findByText(/export prepared/i).should('exist');
    });
  });
});

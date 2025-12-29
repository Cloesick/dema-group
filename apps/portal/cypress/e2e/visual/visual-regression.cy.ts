describe('Visual Regression Tests', () => {
  describe('Layout Consistency', () => {
    const viewports = [
      { width: 375, height: 667, device: 'mobile' },
      { width: 768, height: 1024, device: 'tablet' },
      { width: 1280, height: 800, device: 'desktop' },
      { width: 1920, height: 1080, device: 'large-desktop' }
    ];

    const pages = [
      '/',
      '/products',
      '/orders',
      '/account',
      '/support'
    ];

    viewports.forEach(viewport => {
      describe(`${viewport.device} Layout`, () => {
        beforeEach(() => {
          cy.viewport(viewport.width, viewport.height);
        });

        pages.forEach(page => {
          it(`should match ${page} snapshot`, () => {
            cy.visit(page);
            cy.matchImageSnapshot(`${page}-${viewport.device}`);
          });
        });
      });
    });
  });

  describe('Component Visual Tests', () => {
    beforeEach(() => {
      cy.viewport(1280, 800);
    });

    it('should render navigation correctly', () => {
      cy.visit('/');
      cy.get('nav').matchImageSnapshot('navigation');
    });

    it('should render forms consistently', () => {
      cy.visit('/login');
      cy.get('form').matchImageSnapshot('login-form');
    });

    it('should render data tables properly', () => {
      cy.loginAsRole('admin');
      cy.visit('/admin/users');
      cy.get('table').matchImageSnapshot('users-table');
    });

    it('should render modals correctly', () => {
      cy.loginAsRole('admin');
      cy.visit('/products');
      cy.findByRole('button', { name: /add product/i }).click();
      cy.get('[role="dialog"]').matchImageSnapshot('product-modal');
    });
  });

  describe('Dynamic Content', () => {
    it('should render loading states consistently', () => {
      cy.visit('/products');
      cy.get('[data-cy="loading-skeleton"]').matchImageSnapshot('loading-state');
    });

    it('should render error states properly', () => {
      cy.intercept('GET', '/api/products', { statusCode: 500 });
      cy.visit('/products');
      cy.get('[data-cy="error-state"]').matchImageSnapshot('error-state');
    });

    it('should render empty states correctly', () => {
      cy.intercept('GET', '/api/products', { body: [] });
      cy.visit('/products');
      cy.get('[data-cy="empty-state"]').matchImageSnapshot('empty-state');
    });
  });

  describe('Theme Consistency', () => {
    it('should maintain consistent colors', () => {
      cy.visit('/');
      cy.document().then(doc => {
        const style = getComputedStyle(doc.documentElement);
        const primaryColor = style.getPropertyValue('--primary-color');
        expect(primaryColor).to.equal('rgb(79, 70, 229)'); // Indigo-600
      });
    });

    it('should render dark mode correctly', () => {
      cy.visit('/');
      cy.get('html').invoke('addClass', 'dark');
      cy.matchImageSnapshot('dark-mode-home');
    });
  });

  describe('Animation States', () => {
    it('should capture dropdown animations', () => {
      cy.visit('/');
      cy.get('[data-cy="user-menu"]').click();
      cy.wait(150); // Wait for animation
      cy.matchImageSnapshot('dropdown-open');
    });

    it('should capture modal transitions', () => {
      cy.visit('/products');
      cy.findByRole('button', { name: /add product/i }).click();
      cy.wait(150); // Wait for animation
      cy.matchImageSnapshot('modal-transition');
    });
  });

  describe('Interactive Elements', () => {
    it('should style hover states correctly', () => {
      cy.visit('/');
      cy.get('button').first().realHover();
      cy.wait(100);
      cy.matchImageSnapshot('button-hover');
    });

    it('should style focus states correctly', () => {
      cy.visit('/');
      cy.get('button').first().focus();
      cy.matchImageSnapshot('button-focus');
    });

    it('should style active states correctly', () => {
      cy.visit('/');
      cy.get('button').first().realMouseDown();
      cy.matchImageSnapshot('button-active');
    });
  });
});

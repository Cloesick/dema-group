describe('Accessibility Tests', () => {
  beforeEach(() => {
    cy.login('admin@dema-group.com', 'admin123');
    cy.injectAxe(); // Inject axe-core runtime
  });

  describe('Employee Management', () => {
    beforeEach(() => {
      cy.visit('/compliance/employees');
    });

    it('should have proper heading structure', () => {
      cy.checkA11y('h1,h2,h3,h4,h5,h6', {
        runOnly: ['heading-order']
      });
    });

    it('should have accessible forms', () => {
      // Open new employee form
      cy.findByRole('button', { name: /new employee/i }).click();

      cy.checkA11y('form', {
        runOnly: [
          'label',
          'aria-required-attr',
          'aria-valid-attr',
          'autocomplete-valid'
        ]
      });
    });

    it('should support keyboard navigation', () => {
      // Navigate through table
      cy.findByRole('grid').focus();
      cy.realPress('Tab');
      cy.realPress('ArrowDown');
      cy.realPress('Enter');

      // Verify focus indicators
      cy.focused().should('be.visible');
    });

    it('should have sufficient color contrast', () => {
      cy.checkA11y(undefined, { rules: { runOnly: ['wcag2a', 'wcag2aa'] } });
    });
  });

  describe('Evidence Collection', () => {
    beforeEach(() => {
      cy.visit('/compliance/evidence');
    });

    it('should have accessible data tables', () => {
      cy.checkA11y('[role="grid"]', {
        runOnly: [
          'aria-required-children',
          'aria-required-parent',
          'th-has-data-cells'
        ]
      });
    });

    it('should provide status announcements', () => {
      // Start evidence collection
      cy.findByRole('button', { name: /collect now/i }).click();

      // Verify ARIA live regions
      cy.findByRole('alert').should('exist');
      cy.findByRole('status').should('exist');
    });

    it('should have accessible modals', () => {
      // Open configuration modal
      cy.findByText('AWS CloudWatch')
        .parent()
        .findByRole('button', { name: /configure/i })
        .click();

      cy.checkA11y('[role="dialog"]', {
        runOnly: [
          'aria-dialog-name',
          'focus-trap-dialog',
          'no-keyboard-trap'
        ]
      });
    });
  });

  describe('Deployment Monitoring', () => {
    beforeEach(() => {
      cy.visit('/compliance/deployments');
    });

    it('should have accessible charts', () => {
      cy.findByRole('tab', { name: /metrics/i }).click();

      cy.get('[role="img"]').each(($chart) => {
        // Check for aria-label or aria-labelledby
        expect($chart).to.satisfy(($el: JQuery<HTMLElement>) => {
          return $el.attr('aria-label') || $el.attr('aria-labelledby');
        });
      });
    });

    it('should handle focus management', () => {
      // Open deployment details
      cy.findByText('portal-app').click();

      // Verify focus trap in modal
      cy.focused().should('have.attr', 'role', 'dialog');
      cy.realPress('Tab');
      cy.realPress('Tab');
      cy.realPress('Tab');
      cy.focused().should('have.attr', 'aria-label', 'Close');
    });

    it('should support screen readers', () => {
      // Check for ARIA landmarks
      cy.get('[role="main"]').should('exist');
      cy.get('[role="navigation"]').should('exist');
      cy.get('[role="search"]').should('exist');

      // Check for descriptive buttons
      cy.findAllByRole('button').each(($button) => {
        expect($button).to.satisfy(($el) => {
          return $el.text().trim() !== '' || $el.attr('aria-label');
        });
      });
    });
  });

  describe('Form Validation', () => {
    it('should communicate errors accessibly', () => {
      cy.visit('/compliance/employees');
      cy.findByRole('button', { name: /new employee/i }).click();

      // Submit empty form
      cy.findByRole('button', { name: /create/i }).click();

      // Check error messages
      cy.findAllByRole('alert').each(($error) => {
        expect($error).to.have.attr('aria-live', 'polite');
      });
    });

    it('should have accessible custom form controls', () => {
      cy.visit('/compliance/evidence');

      // Check date picker
      cy.findByLabelText(/start date/i).parent().checkA11y(undefined, {
        rules: {
          runOnly: [
            'aria-allowed-attr',
            'aria-required-attr',
            'aria-valid-attr'
          ]
        }
      });

      // Check multi-select
      cy.findByLabelText(/sources/i).parent().checkA11y(undefined, {
        rules: {
          runOnly: [
            'aria-required-attr',
            'aria-valid-attr',
            'select-name'
          ]
        }
      });
    });
  });

  describe('Responsive Design', () => {
    const sizes = [[1200, 800], [768, 1024], [375, 667]];

    sizes.forEach(([width, height]) => {
      it(`should be accessible at ${width}x${height}`, () => {
        cy.viewport(width, height);
        
        // Test main pages
        cy.visit('/compliance/employees');
        cy.checkA11y();

        cy.visit('/compliance/evidence');
        cy.checkA11y();

        cy.visit('/compliance/deployments');
        cy.checkA11y();
      });
    });

    it('should handle touch interactions', () => {
      cy.viewport('iphone-x');
      cy.visit('/compliance/employees');

      // Test touch targets
      cy.findAllByRole('button').each(($button) => {
        const rect = $button[0].getBoundingClientRect();
        expect(Math.min(rect.width, rect.height)).to.be.at.least(44);
      });
    });
  });

  describe('Dynamic Content', () => {
    it('should announce status changes', () => {
      cy.visit('/compliance/deployments');

      // Monitor deployment status
      cy.findByText('portal-app').click();
      
      // Verify status announcements
      cy.findByRole('status')
        .should('have.attr', 'aria-live', 'polite')
        .and('contain.text', /status/i);
    });

    it('should handle loading states accessibly', () => {
      cy.visit('/compliance/evidence');

      // Start long operation
      cy.findByRole('button', { name: /collect all/i }).click();

      // Verify loading indicators
      cy.findByRole('progressbar').should('exist');
      cy.findByText(/loading/i)
        .should('have.attr', 'aria-live', 'polite');
    });
  });
});

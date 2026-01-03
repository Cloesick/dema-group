describe('Accessibility Tests', () => {
  describe('Core Pages Accessibility', () => {
    const pages = [
      { name: 'Home', path: '/' },
      { name: 'Products', path: '/products' },
      { name: 'Academy', path: '/academy' },
      { name: 'Account', path: '/account' },
      { name: 'Cart', path: '/cart' }
    ];

    pages.forEach(page => {
      it(`should pass accessibility tests for ${page.name} page`, () => {
        cy.login('admin@dema-group.com', 'admin123');
        cy.visit(page.path);
        cy.injectAxe();
        cy.checkA11y(null, {
          includedImpacts: ['critical', 'serious'],
          rules: {
            'color-contrast': { enabled: true },
            'aria-valid-attr-value': { enabled: true }
          }
        });
      });
    });
  });

  describe('Navigation and Structure', () => {
    beforeEach(() => {
      cy.login('admin@dema-group.com', 'admin123');
      cy.visit('/');
      cy.injectAxe();
    });

    it('should have proper landmark regions', () => {
      // Main landmarks
      cy.findByRole('banner').should('exist');
      cy.findByRole('main').should('exist');
      cy.findByRole('contentinfo').should('exist');

      // Navigation
      cy.findByRole('navigation', { name: 'Primary navigation' }).should('exist');
      cy.findByRole('navigation', { name: 'Secondary navigation' }).should('exist');

      // Search
      cy.findAllByRole('search').should('have.length', 2);
      cy.findByRole('search', { name: 'Zoek producten' }).should('exist');
    });

    it('should have proper heading hierarchy', () => {
      // Should have one h1
      cy.get('h1').should('have.length', 1);

      // Headings should be properly nested
      cy.get('h1, h2, h3, h4, h5, h6').each(($heading, index, $headings) => {
        if (index > 0) {
          const prevHeading = $headings[index - 1];
          const prevLevel = parseInt(prevHeading.tagName.slice(1));
          const currentLevel = parseInt($heading.prop('tagName').slice(1));
          expect(currentLevel - prevLevel).to.be.lessThan(2);
        }
      });
    });
  });

  describe('Forms and Interactive Elements', () => {
    it('should have accessible forms', () => {
      cy.visit('/login');
      cy.injectAxe();

      // Form should be labeled
      cy.get('form').should('have.attr', 'aria-label');

      // All form controls should have labels
      cy.get('input, select, textarea').each($input => {
        const hasLabel = $input.attr('aria-label') || $input.attr('aria-labelledby');
        expect(hasLabel).to.exist;
      });

      // Error messages should be associated with inputs
      cy.get('input[type="email"]').type('invalid');
      cy.get('input[type="password"]').type('123');
      cy.findByRole('button', { name: /sign in to your account/i }).click();
      cy.get('[role="alert"]').each($alert => {
        expect($alert).to.have.attr('aria-describedby');
      });
    });

    it('should have accessible buttons and links', () => {
      // Buttons should have accessible names
      cy.get('button').each($button => {
        const hasName = $button.attr('aria-label') || $button.text().trim();
        expect(hasName).to.not.be.empty;
      });

      // Links should have meaningful text
      cy.get('a').each($link => {
        const text = $link.text().toLowerCase();
        expect(text).to.not.match(/click here|more|read more/i);
      });
    });

    it('should support keyboard navigation', () => {
      // Focus should be visible
      cy.get('a[href="/products"]').focus();
      cy.focused().should('have.css', 'outline-style').and('not.equal', 'none');

      // Skip links should be available
      cy.get('a[href="#main-content"]')
        .focus()
        .should('be.visible')
        .click();
      cy.get('#main-content').should('exist');

      // Menu button
      cy.get('button[aria-label="Open websites menu"]').should('exist')
        .should('have.attr', 'aria-expanded', 'false')
        .click()
        .should('have.attr', 'aria-expanded', 'true');
    });
  });

  describe('Dynamic Content', () => {
    it('should announce status changes', () => {
      cy.visit('/cart');
      cy.injectAxe();

      // Loading states
      cy.get('[role="alert"][aria-label="Loading status"]').should('contain', /loading/i);
      cy.get('[role="status"][aria-label="Cart status"]').should('contain', /items in cart/i);

      // Update announcements
      cy.get('button[aria-label="Remove item"]').first().click();
      cy.get('[role="status"][aria-label="Cart status"]').should('contain', /items in cart/i);
      cy.get('[role="alert"][aria-label="Operation status"]').should('be.visible');
    });

    it('should handle expandable content', () => {
      cy.visit('/products');
      // Expandable sections should indicate state
      cy.get('button[aria-expanded][aria-controls]')
        .first()
        .should('have.attr', 'aria-expanded', 'false')
        .click()
        .should('have.attr', 'aria-expanded', 'true')
        .invoke('attr', 'aria-controls')
        .then(id => {
          cy.get(`#${id}`).should('be.visible');
        });
    });
  });

  describe('Images and Media', () => {
    it('should have proper image alternatives', () => {
      // Meaningful images should have alt text
      cy.get('img').each($img => {
        const isDecorative = $img.attr('role') === 'presentation' || $img.attr('aria-hidden') === 'true';
        if (!isDecorative) {
          expect($img.attr('alt')).to.not.be.empty;
        } else {
          expect($img.attr('alt')).to.equal('');
        }
      });

      // Complex images should have extended descriptions
      cy.get('img[aria-describedby]').each($img => {
        const descId = $img.attr('aria-describedby');
        if (descId) {
          cy.get(`#${descId}`).should('not.be.empty');
        }
      });
    });
  });

  describe('Color and Contrast', () => {
    it('should have sufficient color contrast', () => {
      cy.checkA11y();
    });

    it('should not rely solely on color', () => {
      // Visit cart page to test status indicators
      cy.visit('/cart');
      cy.injectAxe();

      // Status indicators should have icons or text
      cy.get('[role="status"], [role="alert"]').should('have.length.gt', 0).each($status => {
        const label = $status.attr('aria-label');
        const text = $status.text();
        const hasIndicator = 
          (label && label.match(/status|error|success|warning|loading|cart/i)) ||
          (text && text.match(/loading|success|error|warning|status|items|removed|updated|cart/i));
        expect(hasIndicator, `Status indicator should have descriptive text or label. Found label: ${label}, text: ${text}`).to.be.true;
      });

      // Visit home page to test links
      cy.visit('/');
      cy.injectAxe();

      // Links should be underlined or have sufficient contrast
      cy.get('a').should('have.length.gt', 0).each($link => {
        const hasIcon = $link.find('svg').length > 0;
        const hasUnderline = $link.css('text-decoration-line') === 'underline';
        const hasBackground = $link.css('background-color') !== 'transparent';
        const hasFocusOutline = $link.css('outline') !== 'none';
        const hasVisualIndicator = hasIcon || hasUnderline || hasBackground || hasFocusOutline;
        expect(hasVisualIndicator, `Link should have visual indicator. Found icon: ${hasIcon}, underline: ${hasUnderline}, background: ${hasBackground}, outline: ${hasFocusOutline}`).to.be.true;
      });
    });
  });
});



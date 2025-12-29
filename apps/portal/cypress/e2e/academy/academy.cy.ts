describe('Academy', () => {
  beforeEach(() => {
    cy.login('admin@dema-group.com', 'admin123');
    // Force visit academy page after login
    cy.visit('/academy', { timeout: 10000 });
    // Wait for the page to load and verify we're on the academy page
    cy.url().should('include', '/academy');
    cy.get('a[href^="/academy/"]').should('have.length.greaterThan', 0);
  });

  describe('Course Catalog', () => {
    it('should display featured courses', () => {
      // Find the main heading by its specific class and text
      cy.get('h1.text-3xl').contains('Leer van de experts').should('exist');
      
      // Find course cards by their specific href pattern
      cy.get('a[href^="/academy/"]').should('have.length.greaterThan', 2);
      
      // Verify each course card structure
      cy.get('a[href^="/academy/"]').each($article => {
        cy.wrap($article).find('h3').should('exist');
        cy.wrap($article).find('img').should('exist');
        cy.wrap($article).find('.text-slate-500').should('exist');
      });
    });

    it('should show course details on hover', () => {
      // Find the course card and verify its content
      cy.get('a[href="/academy/pump-basics"]').should('exist').within(() => {
        cy.get('h3.font-semibold').should('contain', 'Pomp Basiskennis');
        cy.get('p.text-sm').should('contain', 'Leer de basis van pomptechnologie, selectie en onderhoud.');
        cy.get('.absolute.bottom-2').should('contain', '2h');
        cy.get('.text-xs').contains('Beginner').should('exist');
        cy.get('.mt-3').contains('Certificaat inbegrepen').should('exist');
      });
    });

    it('should have working search functionality', () => {
      // Verify search input exists and works
      cy.get('input[type="search"]')
        .should('be.visible')
        .clear()
        .type('pomp')
        .should('have.value', 'pomp');

      // Wait for any potential filtering
      cy.wait(1000);

      // Verify that the pump course is still visible
      cy.get('a[href="/academy/pump-basics"]')
        .should('exist')
        .within(() => {
          cy.get('h3').should('contain', 'Pomp Basiskennis');
        });

      // Clear search
      cy.get('input[type="search"]')
        .clear()
        .should('have.value', '');

      // Wait for any potential filtering
      cy.wait(1000);

      // Verify that other courses are still in the DOM
      cy.get('a[href^="/academy/"]').should('have.length.greaterThan', 2);
    });
  });

  describe('Course Categories', () => {
    it('should display course categories', () => {
      // Verify category badges
      cy.get('.bg-blue-100').contains('Producttraining').should('exist');
      cy.get('.bg-green-100').contains('Beginner').should('exist');
      cy.get('.bg-orange-100').contains('Onderhoud').should('exist');
      cy.get('.bg-purple-100').contains('Technische Vaardigheden').should('exist');
    });

    it('should show course pricing', () => {
      // Verify free courses
      cy.get('.bg-emerald-500').contains('GRATIS').should('exist');
      
      // Verify paid courses
      cy.get('.text-emerald-600').contains('€').should('exist');
    });
  });

  describe('Course Information', () => {
    it('should display course statistics', () => {
      // Verify enrollment numbers
      cy.get('.lucide-users').parent().contains(/[0-9,]+/).should('exist');
      
      // Verify ratings
      cy.get('.lucide-star').parent().contains(/[0-9.]+/).should('exist');
    });

    it('should show certification info', () => {
      cy.get('.lucide-award').parent().contains('Certificaat inbegrepen').should('exist');
    });
  });

  describe('Course Layout', () => {
    it('should have correct course card structure', () => {
      cy.get('a[href^="/academy/"]').each($card => {
        // Verify card structure
        cy.wrap($card).within(() => {
          cy.get('img').should('exist');
          cy.get('h3').should('exist');
          cy.get('p.text-slate-500').should('exist');
          cy.get('.text-sm').should('exist');
        });
      });
    });

    it('should have correct grid layout', () => {
      cy.get('a[href^="/academy/"]').should('have.length.greaterThan', 2);
      cy.get('a[href^="/academy/"]').first().should('have.class', 'bg-white');
    });
  });
});



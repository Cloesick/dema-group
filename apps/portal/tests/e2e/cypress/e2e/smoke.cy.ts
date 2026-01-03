describe('Smoke Test', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should load the home page', () => {
    cy.url().should('include', '/');
  });

  it('should have basic page structure', () => {
    cy.get('header').should('exist');
    cy.get('main').should('exist');
    cy.get('footer').should('exist');
  });

  it('should handle navigation', () => {
    cy.get('nav').should('exist');
  });
});

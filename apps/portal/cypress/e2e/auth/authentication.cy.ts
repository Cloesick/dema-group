describe('Authentication', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should display login form', () => {
    cy.findByLabelText(/email/i).should('exist');
    cy.findByLabelText(/password/i).should('exist');
    cy.findByRole('button', { name: /sign in/i }).should('exist');
  });

  it('should login with valid credentials', () => {
    cy.findByLabelText(/email/i).type('admin@dema-group.com');
    cy.findByLabelText(/password/i).type('admin123');
    cy.findByRole('button', { name: /sign in/i }).click();
    cy.url().should('not.include', '/login');
  });

  it('should show error with invalid credentials', () => {
    cy.findByLabelText(/email/i).type('wrong@email.com');
    cy.findByLabelText(/password/i).type('wrongpass');
    cy.findByRole('button', { name: /sign in/i }).click();
    cy.url().should('include', '/login');
  });

  it('should require email and password', () => {
    cy.findByRole('button', { name: /sign in/i }).click();
    cy.findByLabelText(/email/i).then($el => {
      // Cast to HTMLInputElement to access validationMessage
      const input = $el[0] as HTMLInputElement;
      expect(input.validationMessage).to.not.be.empty;
    });
  });
});

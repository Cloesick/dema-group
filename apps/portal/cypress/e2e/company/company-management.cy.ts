describe('Company Management', () => {
  beforeEach(() => {
    cy.login('admin@dema-group.com', 'admin123');
    cy.visit('/company');
  });

  it('should display company list', () => {
    cy.findByRole('heading', { name: /companies/i }).should('exist');
    cy.findByRole('table').should('exist');
  });

  it('should add new company', () => {
    cy.findByRole('button', { name: /add company/i }).click();

    // Fill company details
    cy.findByLabelText(/company name/i).type('Test Company');
    cy.findByLabelText(/vat number/i).type('BE0123456789');
    cy.findByLabelText(/address/i).type('123 Test Street');
    cy.findByLabelText(/city/i).type('Brussels');
    cy.findByLabelText(/country/i).type('Belgium');
    cy.findByLabelText(/phone/i).type('+32123456789');

    cy.findByRole('button', { name: /save/i }).click();
    cy.findByText('Test Company').should('exist');
  });

  it('should edit company details', () => {
    cy.findByText('Test Company').click();
    cy.findByRole('button', { name: /edit/i }).click();
    
    cy.findByLabelText(/company name/i).clear().type('Updated Company');
    cy.findByRole('button', { name: /save/i }).click();
    
    cy.findByText('Updated Company').should('exist');
  });

  it('should manage company users', () => {
    cy.findByText('Test Company').click();
    cy.findByRole('tab', { name: /users/i }).click();

    // Add user
    cy.findByRole('button', { name: /add user/i }).click();
    cy.findByLabelText(/email/i).type('user@testcompany.com');
    cy.findByLabelText(/role/i).select('user');
    cy.findByRole('button', { name: /add/i }).click();

    cy.findByText('user@testcompany.com').should('exist');
  });

  it('should view company activity log', () => {
    cy.findByText('Test Company').click();
    cy.findByRole('tab', { name: /activity/i }).click();

    cy.findByRole('table').should('exist');
    cy.findByText(/date/i).should('exist');
    cy.findByText(/action/i).should('exist');
    cy.findByText(/user/i).should('exist');
  });

  it('should manage company documents', () => {
    cy.findByText('Test Company').click();
    cy.findByRole('tab', { name: /documents/i }).click();

    // Upload document
    cy.findByRole('button', { name: /upload/i }).click();
    cy.get('input[type="file"]').attachFile('test-document.pdf');
    cy.findByRole('button', { name: /upload/i }).click();

    cy.findByText('test-document.pdf').should('exist');
  });
});

describe('Dealer Management', () => {
  beforeEach(() => {
    cy.login('admin@dema-group.com', 'admin123');
    cy.visit('/dealers');
  });

  it('should display dealer network map', () => {
    cy.findByRole('heading', { name: /dealer network/i }).should('exist');
    cy.get('#map-container').should('exist');
  });

  it('should add new dealer', () => {
    cy.findByRole('button', { name: /add dealer/i }).click();
    
    // Fill dealer details
    cy.findByLabelText(/business name/i).type('Test Dealer');
    cy.findByLabelText(/contact person/i).type('John Doe');
    cy.findByLabelText(/email/i).type('john@testdealer.com');
    cy.findByLabelText(/phone/i).type('+32123456789');
    cy.findByLabelText(/address/i).type('123 Dealer Street');
    cy.findByLabelText(/city/i).type('Brussels');
    cy.findByLabelText(/country/i).type('Belgium');
    
    // Set dealer type and territory
    cy.findByLabelText(/dealer type/i).select('Premium');
    cy.findByLabelText(/territory/i).select('Benelux');
    
    cy.findByRole('button', { name: /save/i }).click();
    cy.findByText('Test Dealer').should('exist');
  });

  it('should manage dealer products', () => {
    cy.findByText('Test Dealer').click();
    cy.findByRole('tab', { name: /products/i }).click();
    
    // Add product access
    cy.findByRole('button', { name: /add product/i }).click();
    cy.findByLabelText(/product category/i).select('Tools');
    cy.findByRole('button', { name: /grant access/i }).click();
    
    cy.findByText(/access granted/i).should('exist');
  });

  it('should track dealer performance', () => {
    cy.findByText('Test Dealer').click();
    cy.findByRole('tab', { name: /performance/i }).click();
    
    cy.findByText(/sales performance/i).should('exist');
    cy.findByText(/customer satisfaction/i).should('exist');
    cy.findByText(/response time/i).should('exist');
  });

  it('should manage dealer certifications', () => {
    cy.findByText('Test Dealer').click();
    cy.findByRole('tab', { name: /certifications/i }).click();
    
    // Add certification
    cy.findByRole('button', { name: /add certification/i }).click();
    cy.findByLabelText(/certification type/i).select('Technical Expert');
    cy.findByLabelText(/expiry date/i).type('2025-12-31');
    cy.findByRole('button', { name: /save/i }).click();
    
    cy.findByText(/technical expert/i).should('exist');
  });

  it('should handle dealer support requests', () => {
    cy.findByText('Test Dealer').click();
    cy.findByRole('tab', { name: /support/i }).click();
    
    // Create support ticket
    cy.findByRole('button', { name: /new ticket/i }).click();
    cy.findByLabelText(/subject/i).type('Product Issue');
    cy.findByLabelText(/description/i).type('Need assistance with product setup');
    cy.findByLabelText(/priority/i).select('High');
    
    cy.findByRole('button', { name: /submit/i }).click();
    cy.findByText(/ticket created/i).should('exist');
  });

  it('should generate dealer reports', () => {
    cy.findByText('Test Dealer').click();
    cy.findByRole('tab', { name: /reports/i }).click();
    
    // Generate report
    cy.findByLabelText(/report type/i).select('Performance Report');
    cy.findByLabelText(/date range/i).select('Last Month');
    cy.findByRole('button', { name: /generate/i }).click();
    
    cy.findByText(/report generated/i).should('exist');
    cy.findByRole('link', { name: /download pdf/i }).should('exist');
  });
});

describe('Inventory Management', () => {
  beforeEach(() => {
    cy.login('admin@dema-group.com', 'admin123');
    cy.visit('/api/inventory');
  });

  it('should display inventory overview', () => {
    cy.findByRole('heading', { name: /inventory/i }).should('exist');
    cy.findByText(/total items/i).should('exist');
    cy.findByText(/low stock/i).should('exist');
  });

  it('should update stock levels', () => {
    // Find first inventory item
    cy.findByRole('row').first().within(() => {
      cy.findByRole('button', { name: /edit/i }).click();
    });

    // Update stock level
    cy.findByLabelText(/quantity/i).clear().type('100');
    cy.findByRole('button', { name: /save/i }).click();

    // Verify update
    cy.findByText('Stock updated successfully').should('exist');
  });

  it('should show low stock alerts', () => {
    cy.findByRole('tab', { name: /alerts/i }).click();
    cy.findByText(/low stock items/i).should('exist');
  });

  it('should filter inventory by SKU', () => {
    cy.findByLabelText(/search sku/i).type('TEST-001');
    cy.findByRole('button', { name: /search/i }).click();
    cy.findByText('TEST-001').should('exist');
  });

  it('should export inventory report', () => {
    cy.findByRole('button', { name: /export/i }).click();
    cy.findByRole('button', { name: /download csv/i }).click();
    // Add assertion for download success based on your implementation
  });

  it('should show inventory history', () => {
    cy.findByRole('tab', { name: /history/i }).click();
    cy.findByRole('table').should('exist');
    cy.findByText(/date/i).should('exist');
    cy.findByText(/action/i).should('exist');
    cy.findByText(/quantity/i).should('exist');
  });
});

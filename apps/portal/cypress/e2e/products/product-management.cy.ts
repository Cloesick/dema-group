describe('Product Management', () => {
  beforeEach(() => {
    cy.login('admin@dema-group.com', 'admin123');
    cy.visit('/admin/products');
  });

  it('should display product list', () => {
    cy.findByRole('heading', { name: /products/i }).should('exist');
    cy.findByRole('table').should('exist');
  });

  it('should allow filtering products', () => {
    cy.findByLabelText(/search/i).type('test product');
    cy.findByRole('button', { name: /filter/i }).click();
    // Add assertions based on your filter implementation
  });

  it('should navigate to product details', () => {
    cy.findByRole('link', { name: /view details/i }).first().click();
    cy.url().should('include', '/products/');
    cy.findByRole('heading', { name: /product details/i }).should('exist');
  });

  it('should create new product', () => {
    cy.findByRole('button', { name: /add product/i }).click();
    
    // Fill product form
    cy.findByLabelText(/name/i).type('Test Product');
    cy.findByLabelText(/description/i).type('Test Description');
    cy.findByLabelText(/price/i).type('99.99');
    cy.findByLabelText(/sku/i).type('TEST-001');
    
    cy.findByRole('button', { name: /save/i }).click();
    
    // Verify product creation
    cy.findByText('Test Product').should('exist');
  });

  it('should edit existing product', () => {
    cy.findByRole('button', { name: /edit/i }).first().click();
    cy.findByLabelText(/name/i).clear().type('Updated Product');
    cy.findByRole('button', { name: /save/i }).click();
    cy.findByText('Updated Product').should('exist');
  });

  it('should delete product', () => {
    cy.findByRole('button', { name: /delete/i }).first().click();
    cy.findByRole('button', { name: /confirm/i }).click();
    cy.findByText('Product deleted successfully').should('exist');
  });
});

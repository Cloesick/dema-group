describe('Product Configurator', () => {
  beforeEach(() => {
    cy.login('admin@dema-group.com', 'admin123');
    cy.visit('/configurator');
  });

  it('should display product categories', () => {
    cy.findByRole('heading', { name: /product configurator/i }).should('exist');
    cy.findByRole('list', { name: /categories/i }).should('exist');
  });

  it('should configure basic product', () => {
    // Select product category
    cy.findByText(/machinery/i).click();
    cy.findByText(/conveyor system/i).click();
    
    // Configure dimensions
    cy.findByLabelText(/length/i).type('1000');
    cy.findByLabelText(/width/i).type('500');
    cy.findByLabelText(/height/i).type('800');
    
    // Select options
    cy.findByLabelText(/material/i).select('Stainless Steel');
    cy.findByLabelText(/speed/i).select('Medium');
    
    // Save configuration
    cy.findByRole('button', { name: /save/i }).click();
    cy.findByText(/configuration saved/i).should('exist');
  });

  it('should handle complex configurations', () => {
    cy.findByText(/automation/i).click();
    cy.findByText(/control system/i).click();
    
    // Basic settings
    cy.findByLabelText(/system type/i).select('PLC');
    cy.findByLabelText(/interface/i).select('Touchscreen');
    
    // Add components
    cy.findByRole('button', { name: /add component/i }).click();
    cy.findByLabelText(/component type/i).select('Sensor');
    cy.findByLabelText(/quantity/i).type('4');
    cy.findByRole('button', { name: /add/i }).click();
    
    // Configure logic
    cy.findByRole('tab', { name: /logic/i }).click();
    cy.findByLabelText(/operation mode/i).select('Automatic');
    cy.findByLabelText(/error handling/i).select('Advanced');
    
    // Save configuration
    cy.findByRole('button', { name: /save/i }).click();
    cy.findByText(/configuration saved/i).should('exist');
  });

  it('should validate configurations', () => {
    cy.findByText(/machinery/i).click();
    cy.findByText(/conveyor system/i).click();
    
    // Enter invalid dimensions
    cy.findByLabelText(/length/i).type('0');
    cy.findByRole('button', { name: /save/i }).click();
    cy.findByText(/invalid length/i).should('exist');
    
    // Fix and validate
    cy.findByLabelText(/length/i).clear().type('1000');
    cy.findByRole('button', { name: /validate/i }).click();
    cy.findByText(/configuration valid/i).should('exist');
  });

  it('should generate technical documentation', () => {
    // Load existing configuration
    cy.findByRole('button', { name: /load/i }).click();
    cy.findByText(/conveyor-config-1/i).click();
    
    // Generate docs
    cy.findByRole('button', { name: /generate docs/i }).click();
    cy.findByLabelText(/document type/i).select('Technical Specs');
    cy.findByRole('button', { name: /generate/i }).click();
    
    cy.findByText(/documents generated/i).should('exist');
    cy.findByRole('link', { name: /download pdf/i }).should('exist');
  });

  it('should handle pricing calculations', () => {
    cy.findByText(/machinery/i).click();
    cy.findByText(/conveyor system/i).click();
    
    // Configure product
    cy.findByLabelText(/length/i).type('1000');
    cy.findByLabelText(/material/i).select('Stainless Steel');
    
    // Check pricing
    cy.findByRole('button', { name: /calculate price/i }).click();
    cy.findByText(/base price/i).should('exist');
    cy.findByText(/options/i).should('exist');
    cy.findByText(/total/i).should('exist');
    
    // Add to quote
    cy.findByRole('button', { name: /add to quote/i }).click();
    cy.findByText(/added to quote/i).should('exist');
  });

  it('should manage saved configurations', () => {
    // View saved configs
    cy.findByRole('button', { name: /saved configs/i }).click();
    
    // Clone configuration
    cy.findByText(/conveyor-config-1/i).parent()
      .findByRole('button', { name: /clone/i }).click();
    cy.findByText(/configuration cloned/i).should('exist');
    
    // Delete configuration
    cy.findByText(/conveyor-config-1-copy/i).parent()
      .findByRole('button', { name: /delete/i }).click();
    cy.findByRole('button', { name: /confirm/i }).click();
    cy.findByText(/configuration deleted/i).should('exist');
  });
});

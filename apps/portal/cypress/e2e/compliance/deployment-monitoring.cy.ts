describe('Deployment Monitoring', () => {
  beforeEach(() => {
    cy.login('admin@dema-group.com', 'admin123');
    cy.visit('/compliance/deployments');
  });

  it('should display deployment status', () => {
    // Verify deployment list
    cy.findByText(/recent deployments/i).should('exist');
    cy.findByText(/service/i).should('exist');
    cy.findByText(/status/i).should('exist');
    cy.findByText(/deployed at/i).should('exist');

    // Check specific deployment
    cy.findByText('portal-app').should('exist');
    cy.findByText('Successful').should('exist');
  });

  it('should verify deployment compliance', () => {
    // Click on deployment
    cy.findByText('portal-app').click();

    // Check compliance status
    cy.findByText(/compliance status/i).should('exist');
    cy.findByText(/security scan/i).should('exist');
    cy.findByText(/passed/i).should('exist');

    // View detailed report
    cy.findByRole('button', { name: /view report/i }).click();
    cy.findByText(/compliance report/i).should('exist');
  });

  it('should handle rollback scenario', () => {
    // Find failed deployment
    cy.findByText('api-service')
      .parent()
      .findByText('Failed')
      .should('exist');

    // Trigger rollback
    cy.findByRole('button', { name: /rollback/i }).click();

    // Confirm rollback
    cy.findByRole('button', { name: /confirm/i }).click();

    // Verify rollback success
    cy.findByText(/rollback successful/i).should('exist');
  });

  it('should configure monitoring rules', () => {
    // Go to monitoring settings
    cy.findByRole('tab', { name: /settings/i }).click();

    // Add new rule
    cy.findByRole('button', { name: /add rule/i }).click();
    cy.findByLabelText(/rule name/i).type('High Error Rate');
    cy.findByLabelText(/metric/i).select('error_rate');
    cy.findByLabelText(/threshold/i).type('5');
    cy.findByLabelText(/duration/i).type('5');
    cy.findByLabelText(/unit/i).select('minutes');

    // Save rule
    cy.findByRole('button', { name: /save/i }).click();

    // Verify rule creation
    cy.findByText(/rule created successfully/i).should('exist');
    cy.findByText('High Error Rate').should('exist');
  });

  it('should view monitoring metrics', () => {
    // Go to metrics view
    cy.findByRole('tab', { name: /metrics/i }).click();

    // Select service
    cy.findByLabelText(/service/i).select('portal-app');

    // Check metrics
    cy.findByText(/error rate/i).should('exist');
    cy.findByText(/response time/i).should('exist');
    cy.findByText(/throughput/i).should('exist');

    // Change time range
    cy.findByLabelText(/time range/i).select('Last 24 hours');
    cy.findByText(/loading/i).should('exist');
    cy.findByText(/loading/i).should('not.exist');
  });
});

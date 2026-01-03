describe('Evidence Collection', () => {
  beforeEach(() => {
    cy.login('admin@dema-group.com', 'admin123');
    cy.visit('/compliance/evidence');
  });

  it('should display evidence sources', () => {
    // Verify AWS source
    cy.findByText('AWS CloudWatch').should('exist');
    cy.findByText('Active').should('exist');

    // Verify GitHub source
    cy.findByText('GitHub').should('exist');
    cy.findByText('Active').should('exist');

    // Verify Slack source
    cy.findByText('Slack').should('exist');
    cy.findByText('Active').should('exist');
  });

  it('should configure evidence source', () => {
    // Click configure on AWS source
    cy.findByText('AWS CloudWatch')
      .parent()
      .findByRole('button', { name: /configure/i })
      .click();

    // Update configuration
    cy.findByLabelText(/access key/i).clear().type('new-access-key');
    cy.findByLabelText(/secret key/i).clear().type('new-secret-key');
    cy.findByLabelText(/region/i).select('us-west-2');

    // Save changes
    cy.findByRole('button', { name: /save/i }).click();

    // Verify success
    cy.findByText(/configuration updated successfully/i).should('exist');
  });

  it('should view collected evidence', () => {
    // Go to evidence log
    cy.findByRole('tab', { name: /evidence log/i }).click();

    // Filter by source
    cy.findByLabelText(/source/i).select('AWS CloudWatch');

    // Verify evidence entries
    cy.findByText(/cloudwatch logs/i).should('exist');
    cy.findByText(/collected at/i).should('exist');

    // View evidence details
    cy.findByText(/cloudwatch logs/i).click();
    cy.findByText(/evidence details/i).should('exist');
    cy.findByText(/log group/i).should('exist');
    cy.findByText(/log stream/i).should('exist');
  });

  it('should manage retention policies', () => {
    // Go to retention settings
    cy.findByRole('tab', { name: /retention/i }).click();

    // Update retention period
    cy.findByLabelText(/retention period/i).clear().type('90');
    cy.findByRole('button', { name: /update/i }).click();

    // Verify success
    cy.findByText(/retention policy updated/i).should('exist');
  });

  it('should export evidence report', () => {
    // Go to evidence log
    cy.findByRole('tab', { name: /evidence log/i }).click();

    // Set date range
    cy.findByLabelText(/start date/i).type('2024-01-01');
    cy.findByLabelText(/end date/i).type('2024-12-31');

    // Export report
    cy.findByRole('button', { name: /export/i }).click();

    // Verify download
    cy.findByText(/report downloaded successfully/i).should('exist');
  });
});

describe('Employee Lifecycle', () => {
  beforeEach(() => {
    cy.login('admin@dema-group.com', 'admin123');
    cy.visit('/compliance/employees');
  });

  it('should create a new employee', () => {
    cy.findByRole('button', { name: /new employee/i }).click();

    // Fill in employee details
    cy.findByLabelText(/first name/i).type('John');
    cy.findByLabelText(/last name/i).type('Doe');
    cy.findByLabelText(/email/i).type('john.doe@dema-group.com');
    cy.findByLabelText(/department/i).type('Engineering');
    cy.findByLabelText(/role/i).type('Developer');
    cy.findByLabelText(/start date/i).type('2024-01-15');
    cy.findByLabelText(/manager/i).type('jane.smith@dema-group.com');

    // Submit form
    cy.findByRole('button', { name: /create/i }).click();

    // Verify success
    cy.findByText(/employee created successfully/i).should('exist');
    cy.findByText('John Doe').should('exist');
    cy.findByText('john.doe@dema-group.com').should('exist');
  });

  it('should offboard an employee', () => {
    // Find employee in list
    cy.findByText('John Doe').click();

    // Click offboard button
    cy.findByRole('button', { name: /offboard/i }).click();

    // Confirm offboarding
    cy.findByLabelText(/end date/i).type('2024-12-31');
    cy.findByRole('button', { name: /confirm/i }).click();

    // Verify success
    cy.findByText(/employee offboarded successfully/i).should('exist');
    cy.findByText('Offboarded').should('exist');
  });

  it('should track employee training', () => {
    // Find employee in list
    cy.findByText('John Doe').click();

    // Go to training tab
    cy.findByRole('tab', { name: /training/i }).click();

    // Complete training
    cy.findByText('Security Awareness Training')
      .parent()
      .findByRole('button', { name: /complete/i })
      .click();

    // Verify completion
    cy.findByText('Completed').should('exist');
  });

  it('should manage policy acknowledgments', () => {
    // Find employee in list
    cy.findByText('John Doe').click();

    // Go to compliance tab
    cy.findByRole('tab', { name: /compliance/i }).click();

    // Acknowledge policy
    cy.findByText('Code of Conduct')
      .parent()
      .findByRole('button', { name: /acknowledge/i })
      .click();

    // Verify acknowledgment
    cy.findByText('Acknowledged').should('exist');
  });
});

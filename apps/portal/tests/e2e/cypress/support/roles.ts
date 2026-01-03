// Test users for different roles
export const users = {
  admin: {
    email: 'admin@dema-group.com',
    password: 'admin123',
    role: 'admin'
  },
  employee: {
    email: 'employee@dema-group.com',
    password: 'employee123',
    role: 'employee'
  },
  customer: {
    email: 'customer@example.com',
    password: 'customer123',
    role: 'customer'
  },
  manager: {
    email: 'manager@dema-group.com',
    password: 'manager123',
    role: 'manager'
  },
  dealer: {
    email: 'dealer@partner.com',
    password: 'dealer123',
    role: 'dealer'
  }
};

// Role-specific commands
Cypress.Commands.add('loginAsRole', (role: keyof typeof users) => {
  const user = users[role];
  cy.login(user.email, user.password);
});

// Permission verification commands
Cypress.Commands.add('verifyAccess', (path: string, shouldHaveAccess: boolean) => {
  cy.visit(path);
  if (shouldHaveAccess) {
    cy.url().should('include', path);
    cy.findByText(/access denied/i).should('not.exist');
  } else {
    cy.url().should('include', '/login');
    // or expect access denied message
    cy.findByText(/access denied/i).should('exist');
  }
});

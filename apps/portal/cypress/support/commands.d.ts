/// <reference types="cypress" />
/// <reference types="@testing-library/cypress" />
/// <reference types="cypress-axe" />
/// <reference types="cypress-real-events" />

declare namespace Cypress {
  interface Chainable {
    // Custom commands
    matchImageSnapshot(name?: string): Chainable<void>;
    tab(): Chainable<void>;
    
    // Role-based commands
    loginAsRole(role: 'admin' | 'employee' | 'customer' | 'manager' | 'dealer'): Chainable<void>;
    verifyAccess(path: string, shouldHaveAccess: boolean): Chainable<void>;
    
    // Testing Library commands
    findByTestId(id: string): Chainable<JQuery<HTMLElement>>;
    findAllByTestId(id: string): Chainable<JQuery<HTMLElement>>;
    
    // Real Events
    realHover(): Chainable<void>;
    realMouseDown(): Chainable<void>;
  }
}

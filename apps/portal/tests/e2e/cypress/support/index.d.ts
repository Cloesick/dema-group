/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable<Subject = any> {
    // Visual Testing
    matchImageSnapshot(name?: string, options?: object): Chainable<void>;
    // Authentication
    login(email: string, password: string): Chainable<void>;
    loginAsRole(role: 'admin' | 'employee' | 'customer' | 'manager' | 'dealer'): Chainable<void>;
    
    // Access Control
    verifyAccess(path: string, shouldHaveAccess: boolean): Chainable<void>;
    
    // Testing Library Commands
    findByLabelText(label: string | RegExp): Chainable<JQuery<HTMLElement>>;
    findByRole(role: string, options?: { name?: string | RegExp }): Chainable<JQuery<HTMLElement>>;
    findByText(text: string | RegExp): Chainable<JQuery<HTMLElement>>;
    findAllByRole(role: string): Chainable<JQuery<HTMLElement>>;
    findAllByText(text: string | RegExp): Chainable<JQuery<HTMLElement>>;
    
    // Accessibility Testing
    injectAxe(): Chainable<void>;
    checkA11y(context?: string | null, options?: any): Chainable<void>;
  }
}

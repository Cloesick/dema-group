describe('Account Management', () => {
  beforeEach(() => {
    cy.login('admin@dema-group.com', 'admin123');
    cy.visit('/account');
  });

  it('should display account overview', () => {
    // Go to settings
    cy.findByRole('menuitem', { name: /settings/i }).click();

    // Check settings page heading
    cy.findByRole('heading', { name: /account settings/i }).should('exist');

    // Check profile tab content
    cy.findByRole('tabpanel', { name: /profile/i }).within(() => {
      cy.findByRole('heading', { name: /profile information/i }).should('exist');
    });
  });

  it('should update profile information', () => {
    // Go to settings
    cy.findByRole('menuitem', { name: /settings/i }).click();
    cy.findByRole('tab', { name: /profile/i }).click();
    
    // Update profile
    cy.findByLabelText(/name/i).clear().type('John Updated');
    cy.findByLabelText(/phone/i).clear().type('+32987654321');
    cy.findByRole('button', { name: /save changes/i }).click();
    
    cy.findByText(/profile updated/i).should('exist');
  });

  it('should change password', () => {
    // Go to settings
    cy.findByRole('menuitem', { name: /settings/i }).click();
    cy.findByRole('tab', { name: /security/i }).click();
    
    cy.findByLabelText(/current password/i).type('admin123');
    cy.findByLabelText(/new password/i).type('newPassword123');
    cy.findByLabelText(/confirm password/i).type('newPassword123');
    
    cy.findByRole('button', { name: /change password/i }).click();
    cy.findByText(/password updated/i).should('exist');
  });

  it('should manage 2FA settings', () => {
    // Go to settings
    cy.findByRole('menuitem', { name: /settings/i }).click();
    cy.findByRole('tab', { name: /security/i }).click();
    
    // Enable 2FA
    cy.findByRole('button', { name: /enable 2fa/i }).click();
    cy.findByText(/scan qr code/i).should('exist');
    cy.findByLabelText(/verification code/i).type('123456');
    cy.findByRole('button', { name: /verify/i }).click();
    
    cy.findByText(/2fa enabled/i).should('exist');
  });

  it('should update notification preferences', () => {
    // Go to settings
    cy.findByRole('menuitem', { name: /settings/i }).click();
    cy.findByRole('tab', { name: /preferences/i }).click();
    
    // Toggle notifications
    cy.findByLabelText(/email notifications/i).click();
    cy.findByLabelText(/product updates/i).click();
    cy.findByLabelText(/security alerts/i).click();
    
    cy.findByRole('button', { name: /save preferences/i }).click();
    cy.findByText(/preferences updated/i).should('exist');
  });

  it('should manage API keys', () => {
    // Go to settings
    cy.findByRole('menuitem', { name: /settings/i }).click();
    cy.findByRole('tab', { name: /api access/i }).click();
    
    // Generate API key
    cy.findByRole('button', { name: /generate key/i }).click();
    cy.findByLabelText(/key name/i).type('Test API Key');
    cy.findByLabelText(/expiry/i).type('2025-12-31');
    cy.findByRole('button', { name: /create/i }).click();
    
    cy.findByText(/api key generated/i).should('exist');
    
    // Revoke API key
    cy.findByRole('button', { name: /revoke/i }).click();
    cy.findByRole('button', { name: /confirm/i }).click();
    cy.findByText(/api key revoked/i).should('exist');
  });

  it('should show account activity log', () => {
    // Go to settings
    cy.findByRole('menuitem', { name: /settings/i }).click();
    cy.findByRole('tab', { name: /activity/i }).click();
    
    cy.findByText(/login history/i).should('exist');
    cy.findByText(/security events/i).should('exist');
    cy.findByText(/system access/i).should('exist');
  });

  it('should handle account deletion', () => {
    // Go to settings
    cy.findByRole('menuitem', { name: /settings/i }).click();
    cy.findByRole('tab', { name: /danger zone/i }).click();
    
    // Attempt deletion without confirmation
    cy.findByRole('button', { name: /delete account/i }).click();
    cy.findByText(/type "delete" to confirm/i).should('exist');
    cy.findByRole('button', { name: /confirm/i }).should('be.disabled');
    
    // Confirm deletion
    cy.findByLabelText(/confirmation/i).type('delete');
    cy.findByRole('button', { name: /confirm/i }).click();
    
    cy.url().should('include', '/login');
  });
});


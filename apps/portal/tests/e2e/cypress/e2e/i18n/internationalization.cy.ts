describe('Internationalization', () => {
  const languages = ['en', 'fr', 'nl'] as const;
  type Language = typeof languages[number];

  const translations = {
    en: {
      login: 'Sign in',
      email: 'Email',
      password: 'Password',
      products: 'Products',
      orders: 'Orders',
      account: 'Account'
    },
    fr: {
      login: 'Se connecter',
      email: 'E-mail',
      password: 'Mot de passe',
      products: 'Produits',
      orders: 'Commandes',
      account: 'Compte'
    },
    nl: {
      login: 'Inloggen',
      email: 'E-mail',
      password: 'Wachtwoord',
      products: 'Producten',
      orders: 'Bestellingen',
      account: 'Account'
    }
  };

  const testLanguage = (lang: Language) => {
    it(`should display correct translations for ${lang}`, () => {
      cy.visit(`/?lang=${lang}`);
      
      // Check language switcher
      cy.findByRole('button', { name: /language/i }).should('exist');
      
      // Check main navigation
      Object.entries(translations[lang]).forEach(([key, value]) => {
        if (['products', 'orders', 'account'].includes(key)) {
          cy.findByText(value).should('exist');
        }
      });
    });
  };

  describe('Guest User Language Support', () => {
    languages.forEach(lang => {
      it(`should show login page in ${lang}`, () => {
        cy.visit(`/login?lang=${lang}`);
        
        // Check login form translations
        cy.findByLabelText(translations[lang].email).should('exist');
        cy.findByLabelText(translations[lang].password).should('exist');
        cy.findByRole('button', { name: translations[lang].login }).should('exist');
      });
    });

    it('should persist language preference', () => {
      cy.visit('/login?lang=fr');
      cy.findByRole('button', { name: /language/i }).click();
      cy.findByText('Français').click();
      
      // Verify persistence after navigation
      cy.visit('/');
      cy.findByText(translations.fr.products).should('exist');
    });
  });

  describe('Employee Language Support', () => {
    beforeEach(() => {
      cy.loginAsRole('employee');
    });

    languages.forEach(lang => {
      testLanguage(lang);
    });

    it('should maintain language across protected routes', () => {
      // Set language to French
      cy.visit('/account?lang=fr');
      
      // Navigate through protected routes
      cy.findByText(translations.fr.products).click();
      cy.url().should('include', '/products');
      cy.findByRole('heading').should('have.text', translations.fr.products);
      
      cy.findByText(translations.fr.orders).click();
      cy.url().should('include', '/orders');
      cy.findByRole('heading').should('have.text', translations.fr.orders);
    });
  });

  describe('Admin Language Support', () => {
    beforeEach(() => {
      cy.loginAsRole('admin');
    });

    languages.forEach(lang => {
      it(`should display admin interface in ${lang}`, () => {
        cy.visit(`/admin?lang=${lang}`);
        
        // Check admin-specific translations
        cy.findByRole('navigation').within(() => {
          if (lang === 'en') {
            cy.findByText('Dashboard').should('exist');
            cy.findByText('User Management').should('exist');
            cy.findByText('Settings').should('exist');
          } else if (lang === 'fr') {
            cy.findByText('Tableau de bord').should('exist');
            cy.findByText('Gestion des utilisateurs').should('exist');
            cy.findByText('Paramètres').should('exist');
          } else if (lang === 'nl') {
            cy.findByText('Dashboard').should('exist');
            cy.findByText('Gebruikersbeheer').should('exist');
            cy.findByText('Instellingen').should('exist');
          }
        });
      });
    });

    it('should handle language-specific content management', () => {
      cy.visit('/admin/content?lang=fr');
      
      // Add content in French
      cy.findByRole('button', { name: 'Ajouter du contenu' }).click();
      cy.findByLabelText('Titre').type('Nouveau Produit');
      cy.findByLabelText('Description').type('Description du produit');
      cy.findByRole('button', { name: 'Sauvegarder' }).click();
      
      // Verify content is tagged with correct language
      cy.findByText('fr').should('exist');
    });
  });

  describe('Customer Language Support', () => {
    beforeEach(() => {
      cy.loginAsRole('customer');
    });

    languages.forEach(lang => {
      it(`should display order process in ${lang}`, () => {
        cy.visit(`/products?lang=${lang}`);
        
        // Add product to cart
        cy.findByRole('button', { name: lang === 'en' ? 'Add to cart' : 
                                       lang === 'fr' ? 'Ajouter au panier' : 
                                       'Toevoegen aan winkelwagen' }).click();
        
        // Check cart
        cy.visit(`/cart?lang=${lang}`);
        cy.findByRole('button', { name: lang === 'en' ? 'Checkout' :
                                       lang === 'fr' ? 'Commander' :
                                       'Afrekenen' }).should('exist');
      });
    });

    it('should handle multi-language support tickets', () => {
      languages.forEach(lang => {
        cy.visit(`/support?lang=${lang}`);
        
        // Create support ticket
        cy.findByRole('button', { name: lang === 'en' ? 'New Ticket' :
                                       lang === 'fr' ? 'Nouveau Ticket' :
                                       'Nieuw Ticket' }).click();
        
        // Verify form is in correct language
        cy.findByLabelText(lang === 'en' ? 'Subject' :
                          lang === 'fr' ? 'Sujet' :
                          'Onderwerp').should('exist');
      });
    });
  });

  describe('Error Handling with Languages', () => {
    languages.forEach(lang => {
      it(`should show error pages in ${lang}`, () => {
        // Test 404 page
        cy.visit(`/non-existent-page?lang=${lang}`, { failOnStatusCode: false });
        
        if (lang === 'en') {
          cy.findByText('Page Not Found').should('exist');
        } else if (lang === 'fr') {
          cy.findByText('Page Non Trouvée').should('exist');
        } else if (lang === 'nl') {
          cy.findByText('Pagina Niet Gevonden').should('exist');
        }
      });
    });
  });

  describe('Language Switcher Functionality', () => {
    it('should allow switching languages from any page', () => {
      // Test as guest
      cy.visit('/');
      cy.findByRole('button', { name: /language/i }).click();
      cy.findByText('Français').click();
      cy.findByText(translations.fr.login).should('exist');

      // Test as authenticated user
      cy.loginAsRole('employee');
      cy.visit('/account');
      cy.findByRole('button', { name: /language/i }).click();
      cy.findByText('Nederlands').click();
      cy.findByText(translations.nl.account).should('exist');
    });

    it('should maintain selected language after session timeout', () => {
      // Set language preference
      cy.visit('/login?lang=fr');
      cy.loginAsRole('employee');
      
      // Simulate session timeout
      cy.window().then(win => {
        win.sessionStorage.clear();
      });
      
      // Verify language is maintained
      cy.visit('/login');
      cy.findByRole('button', { name: translations.fr.login }).should('exist');
    });
  });
});

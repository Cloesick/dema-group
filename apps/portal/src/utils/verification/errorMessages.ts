export const errorMessages = {
  en: {
    address: {
      invalid: 'Please enter a valid address',
      notFound: 'Address not found',
      restrictedArea: 'Address is outside our service area',
      incomplete: 'Please provide a complete address',
      format: 'Invalid address format'
    },
    phone: {
      invalid: 'Please enter a valid phone number',
      wrongCountry: 'Phone number must be from {{country}}',
      format: 'Invalid phone number format',
      missing: 'Phone number is required',
      mobileRequired: 'Please provide a mobile number'
    },
    company: {
      vatInvalid: 'Invalid VAT number',
      vatNotFound: 'VAT number not found',
      registrationInvalid: 'Invalid company registration',
      sanctioned: 'Company is on sanctions list',
      creditFailed: 'Credit check failed',
      bankInvalid: 'Invalid bank details',
      ibanInvalid: 'Invalid IBAN',
      bicInvalid: 'Invalid BIC'
    },
    general: {
      required: 'This field is required',
      invalid: 'Invalid input',
      network: 'Network error, please try again',
      timeout: 'Request timed out',
      unknown: 'An unknown error occurred'
    }
  },
  nl: {
    address: {
      invalid: 'Voer een geldig adres in',
      notFound: 'Adres niet gevonden',
      restrictedArea: 'Adres ligt buiten ons servicegebied',
      incomplete: 'Voer een volledig adres in',
      format: 'Ongeldig adresformaat'
    },
    phone: {
      invalid: 'Voer een geldig telefoonnummer in',
      wrongCountry: 'Telefoonnummer moet uit {{country}} zijn',
      format: 'Ongeldig formaat telefoonnummer',
      missing: 'Telefoonnummer is verplicht',
      mobileRequired: 'Voer een mobiel nummer in'
    },
    company: {
      vatInvalid: 'Ongeldig BTW-nummer',
      vatNotFound: 'BTW-nummer niet gevonden',
      registrationInvalid: 'Ongeldige bedrijfsregistratie',
      sanctioned: 'Bedrijf staat op sanctielijst',
      creditFailed: 'Kredietcontrole mislukt',
      bankInvalid: 'Ongeldige bankgegevens',
      ibanInvalid: 'Ongeldig IBAN',
      bicInvalid: 'Ongeldige BIC'
    },
    general: {
      required: 'Dit veld is verplicht',
      invalid: 'Ongeldige invoer',
      network: 'Netwerkfout, probeer het opnieuw',
      timeout: 'Verzoek verlopen',
      unknown: 'Er is een onbekende fout opgetreden'
    }
  },
  fr: {
    address: {
      invalid: 'Veuillez entrer une adresse valide',
      notFound: 'Adresse introuvable',
      restrictedArea: 'Adresse hors de notre zone de service',
      incomplete: 'Veuillez fournir une adresse complète',
      format: 'Format d\'adresse invalide'
    },
    phone: {
      invalid: 'Veuillez entrer un numéro de téléphone valide',
      wrongCountry: 'Le numéro doit être de {{country}}',
      format: 'Format de numéro invalide',
      missing: 'Numéro de téléphone requis',
      mobileRequired: 'Veuillez fournir un numéro mobile'
    },
    company: {
      vatInvalid: 'Numéro de TVA invalide',
      vatNotFound: 'Numéro de TVA introuvable',
      registrationInvalid: 'Enregistrement d\'entreprise invalide',
      sanctioned: 'Entreprise sur liste de sanctions',
      creditFailed: 'Vérification de crédit échouée',
      bankInvalid: 'Coordonnées bancaires invalides',
      ibanInvalid: 'IBAN invalide',
      bicInvalid: 'BIC invalide'
    },
    general: {
      required: 'Ce champ est requis',
      invalid: 'Entrée invalide',
      network: 'Erreur réseau, veuillez réessayer',
      timeout: 'Requête expirée',
      unknown: 'Une erreur inconnue est survenue'
    }
  }
};

export type ErrorMessageKey = 
  | keyof typeof errorMessages.en.address
  | keyof typeof errorMessages.en.phone
  | keyof typeof errorMessages.en.company
  | keyof typeof errorMessages.en.general;

export type ErrorLanguage = keyof typeof errorMessages;

export type ErrorCategory = keyof typeof errorMessages.en;

export function getErrorMessage(
  key: ErrorMessageKey,
  language: ErrorLanguage = 'en',
  category: ErrorCategory,
  params?: Record<string, string>
): string {
  const messages = errorMessages[language][category] as Record<string, string>;
  let message = messages[key] || errorMessages[language].general.unknown;

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      message = message.replace(`{{${key}}}`, value);
    });
  }

  return message;
}

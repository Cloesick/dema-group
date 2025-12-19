'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

type Language = 'nl' | 'en' | 'fr';

interface FAQItem {
  question: { nl: string; en: string; fr: string };
  answer: { nl: string; en: string; fr: string };
  category: { nl: string; en: string; fr: string };
}

const FAQ_DATA: FAQItem[] = [
  {
    question: {
      nl: 'Wat is de levertijd voor bestellingen?',
      en: 'What is the delivery time for orders?',
      fr: 'Quel est le délai de livraison pour les commandes?',
    },
    answer: {
      nl: 'Standaard levertijd is 2-5 werkdagen voor producten op voorraad. Voor speciale bestellingen of grotere hoeveelheden kan dit variëren. Neem contact met ons op voor exacte levertijden.',
      en: 'Standard delivery time is 2-5 business days for products in stock. For special orders or larger quantities, this may vary. Contact us for exact delivery times.',
      fr: 'Le délai de livraison standard est de 2 à 5 jours ouvrables pour les produits en stock. Pour les commandes spéciales ou les grandes quantités, cela peut varier. Contactez-nous pour les délais exacts.',
    },
    category: { nl: 'Levering', en: 'Delivery', fr: 'Livraison' },
  },
  {
    question: {
      nl: 'Kan ik een offerte aanvragen voor grotere bestellingen?',
      en: 'Can I request a quote for larger orders?',
      fr: 'Puis-je demander un devis pour des commandes plus importantes?',
    },
    answer: {
      nl: 'Ja, voor grotere bestellingen of projecten kunt u eenvoudig een offerte aanvragen via onze website. Ga naar de offerte-pagina of voeg producten toe aan uw offertemandje. Wij sturen u binnen 24 uur een gepersonaliseerde offerte.',
      en: 'Yes, for larger orders or projects you can easily request a quote through our website. Go to the quote page or add products to your quote basket. We will send you a personalized quote within 24 hours.',
      fr: 'Oui, pour les commandes importantes ou les projets, vous pouvez facilement demander un devis via notre site web. Allez sur la page de devis ou ajoutez des produits à votre panier de devis. Nous vous enverrons un devis personnalisé dans les 24 heures.',
    },
    category: { nl: 'Offerte', en: 'Quote', fr: 'Devis' },
  },
  {
    question: {
      nl: 'Leveren jullie ook in Nederland en Frankrijk?',
      en: 'Do you also deliver to the Netherlands and France?',
      fr: 'Livrez-vous également aux Pays-Bas et en France?',
    },
    answer: {
      nl: 'Ja, wij leveren in heel België, Nederland, Luxemburg en Noord-Frankrijk. Voor leveringen buiten België kunnen extra verzendkosten van toepassing zijn. Neem contact op voor een exacte prijsopgave.',
      en: 'Yes, we deliver throughout Belgium, the Netherlands, Luxembourg and Northern France. Additional shipping costs may apply for deliveries outside Belgium. Contact us for an exact price quote.',
      fr: 'Oui, nous livrons dans toute la Belgique, les Pays-Bas, le Luxembourg et le Nord de la France. Des frais de livraison supplémentaires peuvent s\'appliquer pour les livraisons hors de Belgique. Contactez-nous pour un devis exact.',
    },
    category: { nl: 'Levering', en: 'Delivery', fr: 'Livraison' },
  },
  {
    question: {
      nl: 'Welke betaalmethodes accepteren jullie?',
      en: 'What payment methods do you accept?',
      fr: 'Quels modes de paiement acceptez-vous?',
    },
    answer: {
      nl: 'Wij accepteren Bancontact, Visa, Mastercard, overschrijving en voor zakelijke klanten ook betaling op factuur (na goedkeuring). Bij afhaling is contante betaling ook mogelijk.',
      en: 'We accept Bancontact, Visa, Mastercard, bank transfer and for business customers also payment on invoice (after approval). Cash payment is also possible when picking up.',
      fr: 'Nous acceptons Bancontact, Visa, Mastercard, virement bancaire et pour les clients professionnels également le paiement sur facture (après approbation). Le paiement en espèces est également possible lors du retrait.',
    },
    category: { nl: 'Betaling', en: 'Payment', fr: 'Paiement' },
  },
  {
    question: {
      nl: 'Kan ik producten afhalen in Roeselare?',
      en: 'Can I pick up products in Roeselare?',
      fr: 'Puis-je retirer des produits à Roulers?',
    },
    answer: {
      nl: 'Ja, afhalen is mogelijk op ons adres: Ovenstraat 11, 8800 Roeselare. Openingstijden: maandag t/m vrijdag 8:00-12:00 en 13:00-17:30. Gelieve vooraf te bestellen zodat uw order klaar staat.',
      en: 'Yes, pickup is possible at our address: Ovenstraat 11, 8800 Roeselare. Opening hours: Monday to Friday 8:00-12:00 and 13:00-17:30. Please order in advance so your order is ready.',
      fr: 'Oui, le retrait est possible à notre adresse: Ovenstraat 11, 8800 Roulers. Heures d\'ouverture: du lundi au vendredi de 8h00 à 12h00 et de 13h00 à 17h30. Veuillez commander à l\'avance pour que votre commande soit prête.',
    },
    category: { nl: 'Afhalen', en: 'Pickup', fr: 'Retrait' },
  },
  {
    question: {
      nl: 'Bieden jullie technisch advies aan?',
      en: 'Do you offer technical advice?',
      fr: 'Offrez-vous des conseils techniques?',
    },
    answer: {
      nl: 'Absoluut! Ons team heeft jarenlange ervaring in pompen, buizen, fittingen en gereedschap. Neem contact op via telefoon (+32 51 20 51 41), email of gebruik onze chat-assistent voor direct advies.',
      en: 'Absolutely! Our team has years of experience in pumps, pipes, fittings and tools. Contact us by phone (+32 51 20 51 41), email or use our chat assistant for immediate advice.',
      fr: 'Absolument! Notre équipe a des années d\'expérience dans les pompes, tuyaux, raccords et outils. Contactez-nous par téléphone (+32 51 20 51 41), email ou utilisez notre assistant de chat pour des conseils immédiats.',
    },
    category: { nl: 'Service', en: 'Service', fr: 'Service' },
  },
  {
    question: {
      nl: 'Wat is jullie retourbeleid?',
      en: 'What is your return policy?',
      fr: 'Quelle est votre politique de retour?',
    },
    answer: {
      nl: 'Ongebruikte producten in originele verpakking kunnen binnen 14 dagen geretourneerd worden. Neem eerst contact op voor een retournummer. Op maat gemaakte of speciale bestellingen kunnen niet geretourneerd worden.',
      en: 'Unused products in original packaging can be returned within 14 days. Please contact us first for a return number. Custom-made or special orders cannot be returned.',
      fr: 'Les produits non utilisés dans leur emballage d\'origine peuvent être retournés dans les 14 jours. Veuillez d\'abord nous contacter pour obtenir un numéro de retour. Les commandes sur mesure ou spéciales ne peuvent pas être retournées.',
    },
    category: { nl: 'Retour', en: 'Returns', fr: 'Retours' },
  },
  {
    question: {
      nl: 'Hebben jullie garantie op producten?',
      en: 'Do you have warranty on products?',
      fr: 'Avez-vous une garantie sur les produits?',
    },
    answer: {
      nl: 'Alle producten hebben minimaal de wettelijke garantie van 2 jaar. Veel merken zoals Makita en Kränzle bieden uitgebreide fabrieksgarantie. Bewaar altijd uw aankoopbewijs.',
      en: 'All products have at least the legal warranty of 2 years. Many brands such as Makita and Kränzle offer extended manufacturer warranty. Always keep your proof of purchase.',
      fr: 'Tous les produits bénéficient d\'une garantie légale d\'au moins 2 ans. De nombreuses marques comme Makita et Kränzle offrent une garantie fabricant étendue. Conservez toujours votre preuve d\'achat.',
    },
    category: { nl: 'Garantie', en: 'Warranty', fr: 'Garantie' },
  },
  {
    question: {
      nl: 'Kan ik een zakelijk account aanmaken?',
      en: 'Can I create a business account?',
      fr: 'Puis-je créer un compte professionnel?',
    },
    answer: {
      nl: 'Ja, zakelijke klanten kunnen een B2B-account aanvragen met voordelen zoals betaling op factuur, volumekortingen en een persoonlijke accountmanager. Registreer via de website of neem contact op.',
      en: 'Yes, business customers can request a B2B account with benefits such as payment on invoice, volume discounts and a personal account manager. Register via the website or contact us.',
      fr: 'Oui, les clients professionnels peuvent demander un compte B2B avec des avantages tels que le paiement sur facture, des remises sur volume et un gestionnaire de compte personnel. Inscrivez-vous via le site web ou contactez-nous.',
    },
    category: { nl: 'Zakelijk', en: 'Business', fr: 'Professionnel' },
  },
  {
    question: {
      nl: 'Hoe kan ik de status van mijn bestelling volgen?',
      en: 'How can I track my order status?',
      fr: 'Comment puis-je suivre le statut de ma commande?',
    },
    answer: {
      nl: 'Na verzending ontvangt u een e-mail met track & trace informatie. U kunt ook inloggen op uw account om de bestelstatus te bekijken. Bij vragen kunt u altijd contact opnemen.',
      en: 'After shipping, you will receive an email with track & trace information. You can also log in to your account to view the order status. If you have any questions, you can always contact us.',
      fr: 'Après l\'expédition, vous recevrez un e-mail avec les informations de suivi. Vous pouvez également vous connecter à votre compte pour voir le statut de la commande. Si vous avez des questions, vous pouvez toujours nous contacter.',
    },
    category: { nl: 'Bestelling', en: 'Order', fr: 'Commande' },
  },
];

const UI_TEXT = {
  title: {
    nl: 'Veelgestelde Vragen',
    en: 'Frequently Asked Questions',
    fr: 'Questions Fréquentes',
  },
  subtitle: {
    nl: 'Vind snel antwoord op de meest gestelde vragen over onze producten en diensten',
    en: 'Find quick answers to the most frequently asked questions about our products and services',
    fr: 'Trouvez rapidement des réponses aux questions les plus fréquentes sur nos produits et services',
  },
  noQuestion: {
    nl: 'Staat uw vraag er niet bij?',
    en: 'Can\'t find your question?',
    fr: 'Vous ne trouvez pas votre question?',
  },
  contact: {
    nl: 'Neem contact op',
    en: 'Contact us',
    fr: 'Contactez-nous',
  },
};

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [language, setLanguage] = useState<Language>('nl');

  // Detect language from localStorage or browser
  useEffect(() => {
    const stored = localStorage.getItem('preferred-language') as Language | null;
    if (stored && ['nl', 'en', 'fr'].includes(stored)) {
      setLanguage(stored);
    } else {
      // Detect from browser
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.startsWith('fr')) {
        setLanguage('fr');
      } else if (browserLang.startsWith('en')) {
        setLanguage('en');
      } else {
        setLanguage('nl');
      }
    }
  }, []);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('preferred-language', lang);
  };

  return (
    <section id="faq" className="py-16 bg-gray-50 scroll-mt-24">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-4">
            <HelpCircle className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">{UI_TEXT.title[language]}</h2>
          <p className="text-gray-600">
            {UI_TEXT.subtitle[language]}
          </p>
          
          {/* Language Selector */}
          <div className="flex justify-center gap-2 mt-4">
            {(['nl', 'en', 'fr'] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => handleLanguageChange(lang)}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  language === lang
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                {lang === 'nl' ? 'NL' : lang === 'en' ? 'EN' : 'FR'}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {FAQ_DATA.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-4 sm:px-6 py-4 text-left flex items-center justify-between gap-2 sm:gap-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-w-0">
                  {faq.category && (
                    <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded w-fit flex-shrink-0">
                      {faq.category[language]}
                    </span>
                  )}
                  <span className="font-semibold text-gray-900 text-sm sm:text-base">{faq.question[language]}</span>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform duration-200 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-200 ${
                  openIndex === index ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <div className="px-4 sm:px-6 pb-4">
                  <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{faq.answer[language]}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">{UI_TEXT.noQuestion[language]}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="/contact"
              className="inline-flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-600 transition"
            >
              {UI_TEXT.contact[language]}
            </a>
            <a
              href="tel:+3251205141"
              className="inline-flex items-center gap-2 border-2 border-gray-300 text-gray-700 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition"
            >
              +32 51 20 51 41
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

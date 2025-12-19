/**
 * User Persona Definitions for Journey Tests
 */

import { UserPersona } from '../_shared/journey-utils';

export const GARDENER: UserPersona = {
  id: 'gardener',
  name: 'Jan de Tuinman',
  businessType: 'B2B',
  sector: 'agriculture',
  typicalProducts: ['Grasmaaiers', 'Heggenscharen', 'Bladblazers', 'Irrigatie'],
  catalogs: ['makita-tuinfolder-2022-nl', 'makita-catalogus-2022-nl'],
  orderSize: 'medium',
  contactInfo: {
    firstName: 'Jan',
    lastName: 'de Tuinman',
    email: 'jan.tuinman@tuinservice.be',
    phone: '+32 476 12 34 56',
    company: 'Tuinservice Jan BVBA',
    vatNumber: 'BE0123456789',
    address: 'Tuinstraat 15',
    postalCode: '8800',
    city: 'Roeselare',
    country: 'Belgium',
  },
};

export const HANDYMAN: UserPersona = {
  id: 'handyman',
  name: 'Pieter Klusser',
  businessType: 'B2C',
  sector: 'construction',
  typicalProducts: ['Gereedschap', 'Fittingen', 'Bevestigingsmaterialen', 'Slangen'],
  catalogs: ['makita-catalogus-2022-nl', 'messing-draadfittingen', 'slangkoppelingen'],
  orderSize: 'small',
  contactInfo: {
    firstName: 'Pieter',
    lastName: 'Klusser',
    email: 'pieter.klusser@gmail.com',
    phone: '+32 479 98 76 54',
    address: 'Klusstraat 42',
    postalCode: '9000',
    city: 'Gent',
    country: 'Belgium',
  },
};

export const FARMER: UserPersona = {
  id: 'farmer',
  name: 'Karel Boerderij',
  businessType: 'B2B',
  sector: 'agriculture',
  typicalProducts: ['Dompelpompen', 'Bronpompen', 'PE Buizen', 'Irrigatiesystemen'],
  catalogs: ['dompelpompen', 'bronpompen', 'pe-buizen', 'centrifugaalpompen'],
  orderSize: 'large',
  contactInfo: {
    firstName: 'Karel',
    lastName: 'Boerderij',
    email: 'karel@hoeveboerderij.be',
    phone: '+32 477 11 22 33',
    company: 'Hoeve Boerderij NV',
    vatNumber: 'BE0987654321',
    address: 'Landbouwweg 100',
    postalCode: '8500',
    city: 'Kortrijk',
    country: 'Belgium',
  },
};

export const PLUMBER: UserPersona = {
  id: 'plumber',
  name: 'Marc Loodgieter',
  businessType: 'B2B',
  sector: 'plumbing',
  typicalProducts: ['Drukbuizen', 'Fittingen', 'Kleppen', 'Pompen', 'Koppelingen'],
  catalogs: ['drukbuizen', 'messing-draadfittingen', 'rvs-draadfittingen', 'slangkoppelingen', 'centrifugaalpompen'],
  orderSize: 'medium',
  contactInfo: {
    firstName: 'Marc',
    lastName: 'Loodgieter',
    email: 'marc@loodgietersbedrijf.be',
    phone: '+32 478 55 66 77',
    company: 'Loodgietersbedrijf Marc BVBA',
    vatNumber: 'BE0456789123',
    address: 'Sanitairstraat 8',
    postalCode: '2000',
    city: 'Antwerpen',
    country: 'Belgium',
  },
};

export const INDUSTRIAL_BUYER: UserPersona = {
  id: 'industrial',
  name: 'Sophie Industrie',
  businessType: 'B2B',
  sector: 'industry',
  typicalProducts: ['Perslucht', 'Aandrijftechniek', 'Industriële pompen', 'Hogedrukreinigers'],
  catalogs: ['airpress-catalogus-nl-fr', 'catalogus-aandrijftechniek-150922', 'kranzle-catalogus-2021-nl-1'],
  orderSize: 'large',
  contactInfo: {
    firstName: 'Sophie',
    lastName: 'Industrie',
    email: 'sophie.inkoop@industrienl.be',
    phone: '+32 470 88 99 00',
    company: 'Industrie NV',
    vatNumber: 'BE0111222333',
    address: 'Industrielaan 200',
    postalCode: '3500',
    city: 'Hasselt',
    country: 'Belgium',
  },
};

// All personas for iteration
export const ALL_PERSONAS = [GARDENER, HANDYMAN, FARMER, PLUMBER, INDUSTRIAL_BUYER];

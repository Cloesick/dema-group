/**
 * Product Knowledge Base for AI Product Assistant
 * Maps user intents/contexts to relevant catalogs and products
 */

export interface CatalogMapping {
  id: string;
  name: string;
  nameNL: string;
  nameFR: string;
  keywords: string[];
  applications: string[];
  description: string;
  descriptionNL: string;
  descriptionFR: string;
}

// =============================================================================
// MULTILINGUAL PRODUCT TERM DICTIONARY
// Maps singular/plural forms and translations across NL/EN/FR
// =============================================================================
export const PRODUCT_TERM_DICTIONARY: Record<string, {
  nl: string[];      // Dutch terms (singular, plural, variations)
  en: string[];      // English terms
  fr: string[];      // French terms
  catalogs: string[]; // Related catalog IDs
}> = {
  // PIPES / BUIZEN / TUYAUX
  'pipe': {
    nl: ['buis', 'buizen', 'pijp', 'pijpen', 'leiding', 'leidingen'],
    en: ['pipe', 'pipes', 'tube', 'tubes', 'tubing'],
    fr: ['tuyau', 'tuyaux', 'tube', 'tubes', 'conduit', 'conduits'],
    catalogs: ['pe_buizen', 'drukbuizen', 'kunststof_afvoerleidingen', 'verzinkte_buizen', 'abs_persluchtbuizen'],
  },
  // PUMPS / POMPEN / POMPES
  'pump': {
    nl: ['pomp', 'pompen', 'pompje', 'pompjes'],
    en: ['pump', 'pumps'],
    fr: ['pompe', 'pompes'],
    catalogs: ['bronpompen', 'centrifugaalpompen', 'dompelpompen', 'zuigerpompen', 'pomp_specials'],
  },
  // FITTINGS / FITTINGEN / RACCORDS
  'fitting': {
    nl: ['fitting', 'fittingen', 'hulpstuk', 'hulpstukken', 'koppelstuk', 'koppelstukken'],
    en: ['fitting', 'fittings', 'connector', 'connectors'],
    fr: ['raccord', 'raccords', 'connecteur', 'connecteurs'],
    catalogs: ['messing_draadfittingen', 'rvs_draadfittingen', 'verzinkte_buizen', 'zwarte_draad_en_lasfittingen'],
  },
  // HOSES / SLANGEN / TUYAUX FLEXIBLES
  'hose': {
    nl: ['slang', 'slangen', 'tuinslang', 'tuinslangen'],
    en: ['hose', 'hoses', 'flexible tube', 'flexible tubes'],
    fr: ['tuyau flexible', 'tuyaux flexibles', 'flexible', 'flexibles'],
    catalogs: ['rubber_slangen', 'plat_oprolbare_slangen', 'pu_afzuigslangen'],
  },
  // COUPLINGS / KOPPELINGEN / RACCORDS RAPIDES
  'coupling': {
    nl: ['koppeling', 'koppelingen', 'snelkoppeling', 'snelkoppelingen'],
    en: ['coupling', 'couplings', 'quick coupling', 'quick couplings', 'connector', 'connectors'],
    fr: ['raccord', 'raccords', 'raccord rapide', 'raccords rapides', 'couplage', 'couplages'],
    catalogs: ['slangkoppelingen'],
  },
  // CLAMPS / KLEMMEN / COLLIERS
  'clamp': {
    nl: ['klem', 'klemmen', 'slangklem', 'slangklemmen'],
    en: ['clamp', 'clamps', 'hose clamp', 'hose clamps'],
    fr: ['collier', 'colliers', 'collier de serrage', 'colliers de serrage'],
    catalogs: ['slangklemmen'],
  },
  // COMPRESSORS / COMPRESSOREN / COMPRESSEURS
  'compressor': {
    nl: ['compressor', 'compressoren', 'persluchtcompressor', 'persluchtcompressoren'],
    en: ['compressor', 'compressors', 'air compressor', 'air compressors'],
    fr: ['compresseur', 'compresseurs', 'compresseur d\'air'],
    catalogs: ['airpress_catalogus_nl_fr', 'airpress_catalogus_eng'],
  },
  // TOOLS / GEREEDSCHAP / OUTILS
  'tool': {
    nl: ['gereedschap', 'gereedschappen', 'werktuig', 'werktuigen', 'machine', 'machines'],
    en: ['tool', 'tools', 'power tool', 'power tools', 'equipment'],
    fr: ['outil', 'outils', 'outillage', 'machine', 'machines', 'équipement'],
    catalogs: ['makita_catalogus_2022_nl', 'makita_tuinfolder_2022_nl'],
  },
  // DRILL / BOOR / PERCEUSE
  'drill': {
    nl: ['boor', 'boren', 'boormachine', 'boormachines', 'accuboor', 'accuboren'],
    en: ['drill', 'drills', 'drilling machine', 'cordless drill'],
    fr: ['perceuse', 'perceuses', 'foreuse', 'foreuses', 'perforateur'],
    catalogs: ['makita_catalogus_2022_nl'],
  },
  // SAW / ZAAG / SCIE
  'saw': {
    nl: ['zaag', 'zagen', 'cirkelzaag', 'cirkelzagen', 'kettingzaag', 'kettingzagen', 'decoupeerzaag'],
    en: ['saw', 'saws', 'circular saw', 'chainsaw', 'jigsaw'],
    fr: ['scie', 'scies', 'scie circulaire', 'tronçonneuse', 'scie sauteuse'],
    catalogs: ['makita_catalogus_2022_nl', 'makita_tuinfolder_2022_nl'],
  },
  // GRINDER / SLIJPER / MEULEUSE
  'grinder': {
    nl: ['slijper', 'slijpers', 'slijpmachine', 'slijpmachines', 'haakse slijper'],
    en: ['grinder', 'grinders', 'angle grinder', 'grinding machine'],
    fr: ['meuleuse', 'meuleuses', 'meuleuse d\'angle', 'disqueuse'],
    catalogs: ['makita_catalogus_2022_nl'],
  },
  // MOWER / MAAIER / TONDEUSE
  'mower': {
    nl: ['maaier', 'maaiers', 'grasmaaier', 'grasmaaiers', 'gazonmaaier'],
    en: ['mower', 'mowers', 'lawn mower', 'grass cutter'],
    fr: ['tondeuse', 'tondeuses', 'tondeuse à gazon'],
    catalogs: ['makita_tuinfolder_2022_nl'],
  },
  // TRIMMER / TRIMMER / COUPE-BORDURE
  'trimmer': {
    nl: ['trimmer', 'trimmers', 'grastrimmer', 'grastrimmers', 'bosmaaier'],
    en: ['trimmer', 'trimmers', 'grass trimmer', 'string trimmer', 'brush cutter'],
    fr: ['coupe-bordure', 'coupe-bordures', 'débroussailleuse', 'rotofil'],
    catalogs: ['makita_tuinfolder_2022_nl'],
  },
  // BLOWER / BLAZER / SOUFFLEUR
  'blower': {
    nl: ['blazer', 'blazers', 'bladblazer', 'bladblazers'],
    en: ['blower', 'blowers', 'leaf blower', 'leaf blowers'],
    fr: ['souffleur', 'souffleurs', 'souffleur de feuilles'],
    catalogs: ['makita_tuinfolder_2022_nl'],
  },
  // PRESSURE WASHER / HOGEDRUKREINIGER / NETTOYEUR HAUTE PRESSION
  'pressure_washer': {
    nl: ['hogedrukreiniger', 'hogedrukreinigers', 'hogedrukspuit', 'hogedrukspuiten'],
    en: ['pressure washer', 'pressure washers', 'power washer', 'jet wash'],
    fr: ['nettoyeur haute pression', 'nettoyeurs haute pression', 'karcher'],
    catalogs: ['kranzle_catalogus_2021_nl_1'],
  },
  // VALVE / KLEP / VANNE
  'valve': {
    nl: ['klep', 'kleppen', 'kraan', 'kranen', 'afsluiter', 'afsluiters', 'ventiel', 'ventielen'],
    en: ['valve', 'valves', 'tap', 'taps', 'faucet', 'faucets'],
    fr: ['vanne', 'vannes', 'robinet', 'robinets', 'soupape', 'soupapes'],
    catalogs: ['drukbuizen', 'messing_draadfittingen', 'rvs_draadfittingen'],
  },
  // BEARING / LAGER / ROULEMENT
  'bearing': {
    nl: ['lager', 'lagers', 'kogellager', 'kogellagers'],
    en: ['bearing', 'bearings', 'ball bearing', 'ball bearings'],
    fr: ['roulement', 'roulements', 'roulement à billes'],
    catalogs: ['catalogus_aandrijftechniek_150922'],
  },
  // BELT / RIEM / COURROIE
  'belt': {
    nl: ['riem', 'riemen', 'v-riem', 'v-riemen', 'aandrijfriem'],
    en: ['belt', 'belts', 'v-belt', 'drive belt'],
    fr: ['courroie', 'courroies', 'courroie trapézoïdale'],
    catalogs: ['catalogus_aandrijftechniek_150922'],
  },
  // CHAIN / KETTING / CHAÎNE
  'chain': {
    nl: ['ketting', 'kettingen', 'aandrijfketting', 'rollenketting'],
    en: ['chain', 'chains', 'drive chain', 'roller chain'],
    fr: ['chaîne', 'chaînes', 'chaîne de transmission'],
    catalogs: ['catalogus_aandrijftechniek_150922'],
  },
  // IRRIGATION / BEREGENING / IRRIGATION
  'irrigation': {
    nl: ['beregening', 'irrigatie', 'besproeiing', 'sproeier', 'sproeiers'],
    en: ['irrigation', 'sprinkler', 'sprinklers', 'watering'],
    fr: ['irrigation', 'arrosage', 'arroseur', 'arroseurs'],
    catalogs: ['bronpompen', 'centrifugaalpompen', 'pe_buizen', 'plat_oprolbare_slangen', 'slangkoppelingen'],
  },
  // DRAINAGE / AFVOER / DRAINAGE
  'drainage': {
    nl: ['afvoer', 'drainage', 'ontwatering', 'afwatering'],
    en: ['drainage', 'drain', 'draining', 'dewatering'],
    fr: ['drainage', 'évacuation', 'assèchement'],
    catalogs: ['dompelpompen', 'kunststof_afvoerleidingen', 'rubber_slangen'],
  },
  // STAINLESS STEEL / RVS / INOX
  'stainless': {
    nl: ['rvs', 'roestvrij staal', 'inox', 'roestvast'],
    en: ['stainless steel', 'stainless', 'inox', 'ss'],
    fr: ['inox', 'acier inoxydable', 'acier inox'],
    catalogs: ['rvs_draadfittingen', 'slangklemmen'],
  },
  // BRASS / MESSING / LAITON
  'brass': {
    nl: ['messing', 'geelkoper'],
    en: ['brass'],
    fr: ['laiton', 'cuivre jaune'],
    catalogs: ['messing_draadfittingen'],
  },
  // GALVANIZED / VERZINKT / GALVANISÉ
  'galvanized': {
    nl: ['verzinkt', 'gegalvaniseerd'],
    en: ['galvanized', 'galvanised', 'zinc plated'],
    fr: ['galvanisé', 'zingué'],
    catalogs: ['verzinkte_buizen'],
  },
};

export const CATALOG_MAPPINGS: CatalogMapping[] = [
  // Pumps
  {
    id: 'bronpompen',
    name: 'Well Pumps',
    nameNL: 'Bronpompen',
    nameFR: 'Pompes de Puits',
    keywords: ['pump', 'pomp', 'pompen', 'pompe', 'pompes', 'well', 'bron', 'puits', 'groundwater', 'grondwater', 'eau souterraine', 'deep well', 'diepe put', 'submersible', 'dompel', 'immergée', 'irrigation', 'beregening', 'agriculture', 'landbouw'],
    applications: ['agriculture', 'irrigation', 'groundwater', 'industrial'],
    description: 'Submersible pumps for wells and groundwater extraction',
    descriptionNL: 'Dompelpompen voor bronnen en grondwaterwinning',
    descriptionFR: 'Pompes immergées pour puits et extraction d\'eau souterraine',
  },
  {
    id: 'centrifugaalpompen',
    name: 'Centrifugal Pumps',
    nameNL: 'Centrifugaalpompen',
    nameFR: 'Pompes Centrifuges',
    keywords: ['pump', 'pomp', 'pompen', 'pompe', 'pompes', 'centrifugal', 'centrifugaal', 'centrifuge', 'pressure', 'druk', 'pression', 'boost', 'verhoging', 'surpression', 'household', 'huishoudelijk', 'domestique', 'washing', 'was'],
    applications: ['household', 'industrial', 'pressure boosting', 'washing'],
    description: 'Centrifugal pumps for pressure boosting and household use',
    descriptionNL: 'Centrifugaalpompen voor drukverhoging en huishoudelijk gebruik',
    descriptionFR: 'Pompes centrifuges pour surpression et usage domestique',
  },
  {
    id: 'dompelpompen',
    name: 'Submersible Pumps',
    nameNL: 'Dompelpompen',
    nameFR: 'Pompes Submersibles',
    keywords: ['pump', 'pomp', 'pompen', 'pompe', 'pompes', 'submersible', 'dompel', 'immergée', 'drainage', 'afvoer', 'évacuation', 'flood', 'overstroming', 'inondation', 'basement', 'kelder', 'cave', 'sous-sol', 'pool', 'zwembad', 'piscine', 'garden', 'tuin', 'jardin', 'sewage', 'fecaliën', 'eaux usées'],
    applications: ['drainage', 'garden', 'construction', 'sewage', 'household'],
    description: 'Submersible pumps for drainage and water removal',
    descriptionNL: 'Dompelpompen voor drainage en waterafvoer',
    descriptionFR: 'Pompes submersibles pour drainage et évacuation d\'eau',
  },
  {
    id: 'zuigerpompen',
    name: 'Piston Pumps',
    nameNL: 'Zuigerpompen',
    nameFR: 'Pompes à Piston',
    keywords: ['pump', 'pomp', 'pompen', 'pompe', 'pompes', 'piston', 'zuiger', 'hand pump', 'handpomp', 'pompe à main', 'manual', 'manueel', 'manuelle'],
    applications: ['household', 'agriculture', 'irrigation'],
    description: 'Manual and motorized piston pumps',
    descriptionNL: 'Manuele en gemotoriseerde zuigerpompen',
    descriptionFR: 'Pompes à piston manuelles et motorisées',
  },
  {
    id: 'pomp_specials',
    name: 'Special Pumps',
    nameNL: 'Pomp Specials',
    nameFR: 'Pompes Spéciales',
    keywords: ['pump', 'pomp', 'pompen', 'pompe', 'pompes', 'tractor', 'tracteur', 'dosing', 'doseer', 'dosage', 'meststof', 'fertilizer', 'engrais', 'special', 'speciaal', 'spéciale'],
    applications: ['agriculture', 'industrial', 'dosing'],
    description: 'Specialized pumps for tractors, dosing, and special applications',
    descriptionNL: 'Gespecialiseerde pompen voor tractoren, dosering en speciale toepassingen',
    descriptionFR: 'Pompes spécialisées pour tracteurs, dosage et applications spéciales',
  },
  {
    id: 'digitale_versie_pompentoebehoren_compressed',
    name: 'Pump Accessories',
    nameNL: 'Pompentoebehoren',
    nameFR: 'Accessoires de Pompes',
    keywords: ['pump', 'pomp', 'pompen', 'pompe', 'pompes', 'accessory', 'toebehoren', 'accessoire', 'fitting', 'connector', 'aansluiting', 'raccord', 'valve', 'klep', 'vanne', 'filter', 'filtre'],
    applications: ['all pumps', 'accessories'],
    description: 'Accessories and fittings for all pump types',
    descriptionNL: 'Accessoires en fittingen voor alle pomptypes',
    descriptionFR: 'Accessoires et raccords pour tous types de pompes',
  },

  // Pipes & Fittings
  {
    id: 'pe_buizen',
    name: 'PE Pipes',
    nameNL: 'PE Buizen',
    nameFR: 'Tuyaux PE',
    keywords: ['pe', 'polyethylene', 'polyethyleen', 'polyéthylène', 'pipe', 'buis', 'buizen', 'tuyau', 'tuyaux', 'water', 'eau', 'irrigation', 'beregening', 'arrosage', 'agriculture', 'landbouw', 'pressure', 'druk', 'pression'],
    applications: ['agriculture', 'irrigation', 'water supply', 'industrial'],
    description: 'Polyethylene pressure pipes for water and irrigation',
    descriptionNL: 'Polyethyleen drukbuizen voor water en beregening',
    descriptionFR: 'Tuyaux pression en polyéthylène pour eau et irrigation',
  },
  {
    id: 'drukbuizen',
    name: 'Pressure Pipes',
    nameNL: 'Drukbuizen',
    nameFR: 'Tuyaux Pression',
    keywords: ['pressure', 'druk', 'pression', 'pvc', 'pipe', 'buis', 'buizen', 'tuyau', 'tuyaux', 'fitting', 'koppeling', 'raccord', 'valve', 'kraan', 'vanne', 'robinet'],
    applications: ['water supply', 'industrial', 'irrigation'],
    description: 'PVC pressure pipes and fittings',
    descriptionNL: 'PVC drukbuizen en hulpstukken',
    descriptionFR: 'Tuyaux pression PVC et raccords',
  },
  {
    id: 'kunststof_afvoerleidingen',
    name: 'Plastic Drainage',
    nameNL: 'Kunststof Afvoerleidingen',
    nameFR: 'Canalisations Plastique',
    keywords: ['drainage', 'afvoer', 'évacuation', 'pvc', 'pp', 'sewer', 'riool', 'égout', 'rainwater', 'regenwater', 'eau de pluie', 'plumbing', 'sanitair', 'plomberie'],
    applications: ['plumbing', 'drainage', 'rainwater', 'sewage'],
    description: 'PVC and PP drainage pipes and fittings',
    descriptionNL: 'PVC en PP afvoerbuizen en hulpstukken',
    descriptionFR: 'Tuyaux d\'évacuation PVC et PP avec raccords',
  },
  {
    id: 'verzinkte_buizen',
    name: 'Galvanized Pipes',
    nameNL: 'Verzinkte Buizen',
    nameFR: 'Tuyaux Galvanisés',
    keywords: ['galvanized', 'verzinkt', 'galvanisé', 'steel', 'staal', 'acier', 'threaded', 'draad', 'fileté', 'fitting', 'raccord', 'gas', 'gaz', 'water', 'eau'],
    applications: ['gas', 'water', 'industrial', 'plumbing'],
    description: 'Galvanized steel threaded pipes and fittings',
    descriptionNL: 'Verzinkte stalen draadfittingen en buizen',
    descriptionFR: 'Tuyaux et raccords filetés en acier galvanisé',
  },
  {
    id: 'zwarte_draad_en_lasfittingen',
    name: 'Black Steel Fittings',
    nameNL: 'Zwarte Draad- en Lasfittingen',
    nameFR: 'Raccords Acier Noir',
    keywords: ['black', 'zwart', 'noir', 'steel', 'staal', 'acier', 'threaded', 'draad', 'fileté', 'weld', 'las', 'soudure', 'gas', 'gaz', 'heating', 'verwarming', 'chauffage'],
    applications: ['gas', 'heating', 'industrial'],
    description: 'Black steel threaded and weld fittings',
    descriptionNL: 'Zwarte stalen draad- en lasfittingen',
    descriptionFR: 'Raccords filetés et à souder en acier noir',
  },
  {
    id: 'messing_draadfittingen',
    name: 'Brass Fittings',
    nameNL: 'Messing Draadfittingen',
    nameFR: 'Raccords Laiton',
    keywords: ['brass', 'messing', 'laiton', 'threaded', 'draad', 'fileté', 'fitting', 'raccord', 'plumbing', 'sanitair', 'plomberie', 'water', 'eau'],
    applications: ['plumbing', 'water', 'household'],
    description: 'Brass threaded fittings for plumbing',
    descriptionNL: 'Messing draadfittingen voor sanitair',
    descriptionFR: 'Raccords filetés en laiton pour plomberie',
  },
  {
    id: 'rvs_draadfittingen',
    name: 'Stainless Steel Fittings',
    nameNL: 'RVS Draadfittingen',
    nameFR: 'Raccords Inox',
    keywords: ['stainless', 'rvs', 'inox', 'acier inoxydable', 'threaded', 'draad', 'fileté', 'fitting', 'raccord', 'food', 'voeding', 'alimentaire', 'chemical', 'chemisch', 'chimique', 'hygienic', 'hygienisch', 'hygiénique'],
    applications: ['food industry', 'chemical', 'pharmaceutical', 'hygienic'],
    description: 'Stainless steel threaded fittings for hygienic applications',
    descriptionNL: 'RVS draadfittingen voor hygiënische toepassingen',
    descriptionFR: 'Raccords filetés inox pour applications hygiéniques',
  },

  // Hoses & Couplings
  {
    id: 'rubber_slangen',
    name: 'Rubber Hoses',
    nameNL: 'Rubber Slangen',
    nameFR: 'Tuyaux Caoutchouc',
    keywords: ['rubber', 'caoutchouc', 'hose', 'slang', 'slangen', 'tuyau', 'tuyaux', 'flexible', 'flexibel', 'water', 'eau', 'air', 'lucht', 'oil', 'olie', 'huile'],
    applications: ['industrial', 'agriculture', 'construction'],
    description: 'Industrial rubber hoses for various applications',
    descriptionNL: 'Industriële rubber slangen voor diverse toepassingen',
    descriptionFR: 'Tuyaux caoutchouc industriels pour diverses applications',
  },
  {
    id: 'plat_oprolbare_slangen',
    name: 'Layflat Hoses',
    nameNL: 'Plat Oprolbare Slangen',
    nameFR: 'Tuyaux Plats Enroulables',
    keywords: ['layflat', 'plat', 'oprolbaar', 'enroulable', 'fire', 'brand', 'incendie', 'irrigation', 'beregening', 'arrosage', 'discharge', 'afvoer', 'refoulement'],
    applications: ['firefighting', 'irrigation', 'discharge'],
    description: 'Layflat hoses for irrigation and firefighting',
    descriptionNL: 'Plat oprolbare slangen voor beregening en brandweer',
    descriptionFR: 'Tuyaux plats enroulables pour irrigation et lutte incendie',
  },
  {
    id: 'pu_afzuigslangen',
    name: 'PU Suction Hoses',
    nameNL: 'PU Afzuigslangen',
    nameFR: 'Tuyaux d\'Aspiration PU',
    keywords: ['pu', 'polyurethane', 'polyuréthane', 'suction', 'afzuig', 'aspiration', 'dust', 'stof', 'poussière', 'granulate', 'granulaat', 'granulé', 'ventilation', 'ventilatie'],
    applications: ['dust extraction', 'ventilation', 'granulate transport'],
    description: 'Polyurethane suction hoses for dust and granulate',
    descriptionNL: 'Polyurethaan afzuigslangen voor stof en granulaat',
    descriptionFR: 'Tuyaux d\'aspiration polyuréthane pour poussière et granulés',
  },
  {
    id: 'slangkoppelingen',
    name: 'Hose Couplings',
    nameNL: 'Slangkoppelingen',
    nameFR: 'Raccords de Tuyaux',
    keywords: ['coupling', 'koppeling', 'koppelingen', 'raccord', 'raccords', 'bauer', 'perrot', 'camlock', 'storz', 'guillemin', 'geka', 'quick', 'snel', 'rapide'],
    applications: ['agriculture', 'firefighting', 'industrial', 'irrigation'],
    description: 'Quick couplings: Bauer, Perrot, Camlock, Storz, Guillemin',
    descriptionNL: 'Snelkoppelingen: Bauer, Perrot, Camlock, Storz, Guillemin',
    descriptionFR: 'Raccords rapides: Bauer, Perrot, Camlock, Storz, Guillemin',
  },
  {
    id: 'slangklemmen',
    name: 'Hose Clamps',
    nameNL: 'Slangklemmen',
    nameFR: 'Colliers de Serrage',
    keywords: ['clamp', 'klem', 'klemmen', 'collier', 'colliers', 'hose', 'slang', 'slangen', 'tuyau', 'stainless', 'rvs', 'inox', 'worm', 'schroef', 'vis'],
    applications: ['all hoses', 'industrial', 'automotive'],
    description: 'Hose clamps in various materials and sizes',
    descriptionNL: 'Slangklemmen in diverse materialen en maten',
    descriptionFR: 'Colliers de serrage en divers matériaux et tailles',
  },

  // Compressed Air
  {
    id: 'airpress_catalogus_nl_fr',
    name: 'Airpress Compressors NL',
    nameNL: 'Airpress Compressoren',
    nameFR: 'Compresseurs Airpress',
    keywords: ['compressor', 'compressoren', 'compresseur', 'compresseurs', 'air', 'lucht', 'compressed', 'perslucht', 'air comprimé', 'airpress', 'tank', 'ketel', 'cuve'],
    applications: ['workshop', 'industrial', 'construction', 'automotive'],
    description: 'Airpress compressors and compressed air equipment',
    descriptionNL: 'Airpress compressoren en persluchtapparatuur',
    descriptionFR: 'Compresseurs Airpress et équipement d\'air comprimé',
  },
  {
    id: 'airpress_catalogus_eng',
    name: 'Airpress Compressors EN',
    nameNL: 'Airpress Compressoren (EN)',
    nameFR: 'Compresseurs Airpress (EN)',
    keywords: ['compressor', 'compressoren', 'compresseur', 'air', 'compressed', 'airpress', 'tank'],
    applications: ['workshop', 'industrial', 'construction', 'automotive'],
    description: 'Airpress compressors and compressed air equipment (English)',
    descriptionNL: 'Airpress compressoren en persluchtapparatuur (Engels)',
    descriptionFR: 'Compresseurs Airpress et équipement d\'air comprimé (Anglais)',
  },
  {
    id: 'abs_persluchtbuizen',
    name: 'ABS Compressed Air Pipes',
    nameNL: 'ABS Persluchtbuizen',
    nameFR: 'Tuyaux Air Comprimé ABS',
    keywords: ['abs', 'compressed air', 'perslucht', 'air comprimé', 'pipe', 'buis', 'buizen', 'tuyau', 'tuyaux', 'fitting', 'raccord'],
    applications: ['compressed air systems', 'workshop'],
    description: 'ABS piping systems for compressed air',
    descriptionNL: 'ABS leidingsystemen voor perslucht',
    descriptionFR: 'Systèmes de tuyauterie ABS pour air comprimé',
  },

  // Power Tools
  {
    id: 'makita_catalogus_2022_nl',
    name: 'Makita Power Tools',
    nameNL: 'Makita Elektrisch Gereedschap',
    nameFR: 'Outillage Électrique Makita',
    keywords: ['makita', 'power tool', 'elektrisch', 'gereedschap', 'outil', 'outils', 'outillage', 'électrique', 'drill', 'boor', 'boren', 'perceuse', 'saw', 'zaag', 'zagen', 'scie', 'grinder', 'slijper', 'meuleuse', 'battery', 'accu', 'batterie', 'cordless', 'snoerloos', 'sans fil'],
    applications: ['construction', 'workshop', 'professional', 'diy'],
    description: 'Makita professional power tools and accessories',
    descriptionNL: 'Makita professioneel elektrisch gereedschap en accessoires',
    descriptionFR: 'Outillage électrique professionnel Makita et accessoires',
  },
  {
    id: 'makita_tuinfolder_2022_nl',
    name: 'Makita Garden Tools',
    nameNL: 'Makita Tuingereedschap',
    nameFR: 'Outillage de Jardin Makita',
    keywords: ['makita', 'garden', 'tuin', 'jardin', 'lawn', 'gazon', 'pelouse', 'mower', 'maaier', 'maaiers', 'tondeuse', 'trimmer', 'trimmers', 'coupe-bordure', 'hedge', 'haag', 'haie', 'blower', 'blazer', 'blazers', 'souffleur', 'chainsaw', 'kettingzaag', 'tronçonneuse', 'battery', 'accu', 'batterie'],
    applications: ['garden', 'landscaping', 'outdoor'],
    description: 'Makita battery-powered garden tools',
    descriptionNL: 'Makita accu tuingereedschap',
    descriptionFR: 'Outillage de jardin Makita sur batterie',
  },

  // Pressure Washers
  {
    id: 'kranzle_catalogus_2021_nl_1',
    name: 'Kränzle Pressure Washers',
    nameNL: 'Kränzle Hogedrukreinigers',
    nameFR: 'Nettoyeurs Haute Pression Kränzle',
    keywords: ['kranzle', 'kränzle', 'pressure washer', 'hogedrukreiniger', 'hogedrukreinigers', 'nettoyeur haute pression', 'cleaning', 'reinigen', 'nettoyage', 'wash', 'wassen', 'laver', 'professional', 'professionnel', 'karcher'],
    applications: ['cleaning', 'industrial', 'automotive', 'professional'],
    description: 'Kränzle professional pressure washers',
    descriptionNL: 'Kränzle professionele hogedrukreinigers',
    descriptionFR: 'Nettoyeurs haute pression professionnels Kränzle',
  },

  // Drive Technology
  {
    id: 'catalogus_aandrijftechniek_150922',
    name: 'Drive Technology',
    nameNL: 'Aandrijftechniek',
    nameFR: 'Technologie d\'Entraînement',
    keywords: ['bearing', 'lager', 'lagers', 'roulement', 'roulements', 'belt', 'riem', 'riemen', 'courroie', 'courroies', 'chain', 'ketting', 'kettingen', 'chaîne', 'chaînes', 'sprocket', 'tandwiel', 'pignon', 'coupling', 'koppeling', 'accouplement', 'shaft', 'as', 'arbre', 'agricultural', 'landbouw', 'agricole'],
    applications: ['agriculture', 'industrial', 'machinery'],
    description: 'Bearings, belts, chains and drive components',
    descriptionNL: 'Lagers, riemen, kettingen en aandrijfcomponenten',
    descriptionFR: 'Roulements, courroies, chaînes et composants d\'entraînement',
  },
];

// Application/Context to Catalog mapping for smart suggestions
export const APPLICATION_CATALOG_MAP: Record<string, string[]> = {
  // Pumps - direct search
  'pump': ['bronpompen', 'centrifugaalpompen', 'dompelpompen', 'zuigerpompen', 'pomp_specials', 'digitale_versie_pompentoebehoren_compressed'],
  'pomp': ['bronpompen', 'centrifugaalpompen', 'dompelpompen', 'zuigerpompen', 'pomp_specials', 'digitale_versie_pompentoebehoren_compressed'],
  'pompen': ['bronpompen', 'centrifugaalpompen', 'dompelpompen', 'zuigerpompen', 'pomp_specials', 'digitale_versie_pompentoebehoren_compressed'],
  
  // Agriculture & Irrigation
  'agriculture': ['bronpompen', 'centrifugaalpompen', 'dompelpompen', 'zuigerpompen', 'pomp_specials', 'pe_buizen', 'slangkoppelingen', 'plat_oprolbare_slangen', 'catalogus_aandrijftechniek_150922'],
  'landbouw': ['bronpompen', 'centrifugaalpompen', 'dompelpompen', 'zuigerpompen', 'pomp_specials', 'pe_buizen', 'slangkoppelingen', 'plat_oprolbare_slangen', 'catalogus_aandrijftechniek_150922'],
  'irrigation': ['bronpompen', 'centrifugaalpompen', 'pe_buizen', 'slangkoppelingen', 'plat_oprolbare_slangen'],
  'beregening': ['bronpompen', 'centrifugaalpompen', 'pe_buizen', 'slangkoppelingen', 'plat_oprolbare_slangen'],
  
  // Garden & Landscaping
  'garden': ['makita_tuinfolder_2022_nl', 'makita_catalogus_2022_nl', 'dompelpompen', 'rubber_slangen', 'slangklemmen'],
  'tuin': ['makita_tuinfolder_2022_nl', 'makita_catalogus_2022_nl', 'dompelpompen', 'rubber_slangen', 'slangklemmen'],
  'landscaping': ['makita_tuinfolder_2022_nl', 'makita_catalogus_2022_nl'],
  
  // Construction & Industrial
  'construction': ['makita_catalogus_2022_nl', 'airpress_catalogus_nl_fr', 'dompelpompen', 'rubber_slangen', 'kranzle_catalogus_2021_nl_1'],
  'bouw': ['makita_catalogus_2022_nl', 'airpress_catalogus_nl_fr', 'dompelpompen', 'rubber_slangen', 'kranzle_catalogus_2021_nl_1'],
  'industrial': ['airpress_catalogus_nl_fr', 'rvs_draadfittingen', 'verzinkte_buizen', 'rubber_slangen', 'pu_afzuigslangen', 'catalogus_aandrijftechniek_150922'],
  'industrieel': ['airpress_catalogus_nl_fr', 'rvs_draadfittingen', 'verzinkte_buizen', 'rubber_slangen', 'pu_afzuigslangen', 'catalogus_aandrijftechniek_150922'],
  
  // Plumbing & Sanitary
  'plumbing': ['kunststof_afvoerleidingen', 'messing_draadfittingen', 'verzinkte_buizen', 'drukbuizen'],
  'sanitair': ['kunststof_afvoerleidingen', 'messing_draadfittingen', 'verzinkte_buizen', 'drukbuizen'],
  'drainage': ['kunststof_afvoerleidingen', 'dompelpompen', 'pe_buizen'],
  'afvoer': ['kunststof_afvoerleidingen', 'dompelpompen', 'pe_buizen'],
  
  // Food & Hygienic
  'food': ['rvs_draadfittingen', 'rubber_slangen'],
  'voeding': ['rvs_draadfittingen', 'rubber_slangen'],
  'hygienic': ['rvs_draadfittingen'],
  'hygienisch': ['rvs_draadfittingen'],
  
  // Workshop & DIY
  'workshop': ['makita_catalogus_2022_nl', 'airpress_catalogus_nl_fr', 'kranzle_catalogus_2021_nl_1'],
  'werkplaats': ['makita_catalogus_2022_nl', 'airpress_catalogus_nl_fr', 'kranzle_catalogus_2021_nl_1'],
  'diy': ['makita_catalogus_2022_nl', 'makita_tuinfolder_2022_nl'],
  'doe het zelf': ['makita_catalogus_2022_nl', 'makita_tuinfolder_2022_nl'],
  
  // Cleaning
  'cleaning': ['kranzle_catalogus_2021_nl_1', 'dompelpompen'],
  'reinigen': ['kranzle_catalogus_2021_nl_1', 'dompelpompen'],
};

// USE CASE PATTERNS - Maps real-world scenarios to product combinations
export const USE_CASE_PATTERNS: Array<{
  patterns: RegExp[];
  catalogs: string[];
  response: { nl: string; en: string; fr: string };
}> = [
  // Deep well / groundwater pumping
  {
    patterns: [
      /(\d+)\s*m(eter)?\s*(diep|deep|put|well|bron)/i,
      /(diep|deep)\s*(put|well|bron|grondwater)/i,
      /(grondwater|groundwater)\s*(pomp|pump|oppompen)/i,
      /(water|pomp).*(uit|from).*(grond|put|bron)/i,
    ],
    catalogs: ['bronpompen', 'pe_buizen', 'slangkoppelingen', 'digitale_versie_pompentoebehoren_compressed'],
    response: {
      nl: 'Voor het oppompen van water uit een diepe put of bron raad ik aan:\n• **Bronpompen** - dompelpompen speciaal voor diepe putten\n• **PE Buizen** - voor de stijgleiding\n• **Slangkoppelingen** - voor betrouwbare aansluitingen',
      en: 'For pumping water from a deep well, I recommend:\n• **Well Pumps** - submersible pumps for deep wells\n• **PE Pipes** - for the riser pipe\n• **Hose Couplings** - for reliable connections',
      fr: 'Pour pomper l\'eau d\'un puits profond, je recommande:\n• **Pompes de puits** - pompes submersibles pour puits profonds\n• **Tuyaux PE** - pour la colonne montante\n• **Raccords de tuyaux** - pour des connexions fiables',
    },
  },
  // Basement/cellar flooding
  {
    patterns: [
      /(kelder|basement|souterrain)\s*(water|overstroming|leeg|flood)/i,
      /(water|overstroming)\s*(kelder|basement)/i,
      /(leegpompen|drain|afvoer).*(kelder|basement)/i,
    ],
    catalogs: ['dompelpompen', 'rubber_slangen', 'slangkoppelingen'],
    response: {
      nl: 'Voor het leegpompen van een kelder raad ik aan:\n• **Dompelpompen** - voor vuil of schoon water\n• **Rubber slangen** - flexibel en duurzaam\n• **Slangkoppelingen** - voor snelle aansluiting',
      en: 'For draining a basement, I recommend:\n• **Submersible Pumps** - for dirty or clean water\n• **Rubber hoses** - flexible and durable\n• **Hose couplings** - for quick connection',
      fr: 'Pour vider une cave, je recommande:\n• **Pompes submersibles** - pour eau sale ou propre\n• **Tuyaux en caoutchouc** - flexibles et durables\n• **Raccords de tuyaux** - pour connexion rapide',
    },
  },
  // Irrigation system
  {
    patterns: [
      /(beregening|irrigatie|irrigation|sprinkler)/i,
      /(akker|veld|field|gewas|crop)\s*(water|beregenen)/i,
      /(landbouw|agriculture|farm)\s*(water|pomp|irrigatie)/i,
    ],
    catalogs: ['bronpompen', 'centrifugaalpompen', 'pe_buizen', 'plat_oprolbare_slangen', 'slangkoppelingen'],
    response: {
      nl: 'Voor een beregeningssysteem raad ik aan:\n• **Bronpompen of Centrifugaalpompen** - afhankelijk van waterbron\n• **PE Buizen** - voor de hoofdleiding\n• **Plat oprolbare slangen** - voor flexibele beregeningslijnen\n• **Slangkoppelingen** (Bauer/Perrot) - standaard in landbouw',
      en: 'For an irrigation system, I recommend:\n• **Well Pumps or Centrifugal Pumps** - depending on water source\n• **PE Pipes** - for main lines\n• **Layflat hoses** - for flexible irrigation lines\n• **Hose couplings** (Bauer/Perrot) - agricultural standard',
      fr: 'Pour un système d\'irrigation, je recommande:\n• **Pompes de puits ou centrifuges** - selon la source d\'eau\n• **Tuyaux PE** - pour les conduites principales\n• **Tuyaux plats enroulables** - pour lignes d\'irrigation flexibles\n• **Raccords** (Bauer/Perrot) - standard agricole',
    },
  },
  // Pool/swimming pool
  {
    patterns: [
      /(zwembad|pool|jacuzzi|spa)\s*(pomp|pump|water|filter)/i,
      /(pomp|pump).*(zwembad|pool)/i,
    ],
    catalogs: ['centrifugaalpompen', 'dompelpompen', 'rubber_slangen', 'slangklemmen'],
    response: {
      nl: 'Voor zwembadtoepassingen raad ik aan:\n• **Centrifugaalpompen** - voor circulatie en filtratie\n• **Dompelpompen** - voor legen of vullen\n• **Rubber slangen** - chloorbestendig\n• **Slangklemmen** - RVS voor corrosiebestendigheid',
      en: 'For pool applications, I recommend:\n• **Centrifugal Pumps** - for circulation and filtration\n• **Submersible Pumps** - for draining or filling\n• **Rubber hoses** - chlorine resistant\n• **Hose clamps** - stainless steel for corrosion resistance',
      fr: 'Pour les applications piscine, je recommande:\n• **Pompes centrifuges** - pour circulation et filtration\n• **Pompes submersibles** - pour vidange ou remplissage\n• **Tuyaux en caoutchouc** - résistants au chlore\n• **Colliers de serrage** - inox pour résistance à la corrosion',
    },
  },
  // Workshop/garage setup
  {
    patterns: [
      /(werkplaats|workshop|garage|atelier)\s*(inrichten|setup|compressor|gereedschap)/i,
      /(compressor|perslucht).*(werkplaats|garage)/i,
    ],
    catalogs: ['airpress_catalogus_nl_fr', 'abs_persluchtbuizen', 'makita_catalogus_2022_nl', 'kranzle_catalogus_2021_nl_1'],
    response: {
      nl: 'Voor een werkplaats/garage raad ik aan:\n• **Airpress Compressoren** - voor pneumatisch gereedschap\n• **ABS Persluchtbuizen** - voor vaste leidingen\n• **Makita Gereedschap** - professioneel elektrisch gereedschap\n• **Kränzle Hogedrukreinigers** - voor reiniging',
      en: 'For a workshop/garage, I recommend:\n• **Airpress Compressors** - for pneumatic tools\n• **ABS Compressed Air Pipes** - for fixed piping\n• **Makita Tools** - professional power tools\n• **Kränzle Pressure Washers** - for cleaning',
      fr: 'Pour un atelier/garage, je recommande:\n• **Compresseurs Airpress** - pour outils pneumatiques\n• **Tuyaux ABS air comprimé** - pour tuyauterie fixe\n• **Outillage Makita** - outils électriques professionnels\n• **Nettoyeurs haute pression Kränzle** - pour le nettoyage',
    },
  },
  // Food industry / hygienic
  {
    patterns: [
      /(voeding|food|voedsel|zuivel|dairy|brouwerij|brewery)/i,
      /(hygiën|hygien|haccp|food.?safe)/i,
      /(farmaceutisch|pharmaceutical|chemisch|chemical)\s*(industrie|industry)/i,
    ],
    catalogs: ['rvs_draadfittingen', 'rubber_slangen'],
    response: {
      nl: 'Voor de voedingsindustrie en hygiënische toepassingen raad ik aan:\n• **RVS Draadfittingen** - food-grade, corrosiebestendig\n• **Rubber slangen** - FDA-goedgekeurd voor voedselcontact\n\nAl onze RVS producten zijn geschikt voor HACCP-omgevingen.',
      en: 'For food industry and hygienic applications, I recommend:\n• **Stainless Steel Fittings** - food-grade, corrosion resistant\n• **Rubber hoses** - FDA approved for food contact\n\nAll our stainless steel products are suitable for HACCP environments.',
      fr: 'Pour l\'industrie alimentaire et applications hygiéniques, je recommande:\n• **Raccords inox** - qualité alimentaire, résistants à la corrosion\n• **Tuyaux en caoutchouc** - approuvés FDA pour contact alimentaire\n\nTous nos produits inox conviennent aux environnements HACCP.',
    },
  },
  // Pressure boosting
  {
    patterns: [
      /(druk|pressure)\s*(verhoging|boost|verhogen|increase)/i,
      /(waterdruk|water.?pressure)\s*(laag|low|verhogen|increase)/i,
      /(hydrofoor|pressure.?tank)/i,
    ],
    catalogs: ['centrifugaalpompen', 'drukbuizen', 'digitale_versie_pompentoebehoren_compressed'],
    response: {
      nl: 'Voor drukverhoging raad ik aan:\n• **Centrifugaalpompen** - voor constante drukverhoging\n• **Drukbuizen** - PVC voor drukleidingen\n• **Pompentoebehoren** - drukvaten, kleppen, manometers',
      en: 'For pressure boosting, I recommend:\n• **Centrifugal Pumps** - for constant pressure increase\n• **Pressure Pipes** - PVC for pressure lines\n• **Pump Accessories** - pressure vessels, valves, gauges',
      fr: 'Pour l\'augmentation de pression, je recommande:\n• **Pompes centrifuges** - pour augmentation de pression constante\n• **Tuyaux de pression** - PVC pour conduites sous pression\n• **Accessoires de pompe** - réservoirs de pression, vannes, manomètres',
    },
  },
  // Sewage/dirty water
  {
    patterns: [
      /(riool|sewer|fecali|septisch|septic)/i,
      /(vuil|dirty|afval)\s*(water|pomp)/i,
      /(wc|toilet)\s*(pomp|pump|afvoer)/i,
    ],
    catalogs: ['dompelpompen', 'kunststof_afvoerleidingen', 'rubber_slangen'],
    response: {
      nl: 'Voor riool- en vuilwatertoepassingen raad ik aan:\n• **Dompelpompen** - met snijwerk voor vaste delen\n• **Kunststof afvoerleidingen** - PVC/PP rioolbuizen\n• **Rubber slangen** - voor flexibele aansluitingen',
      en: 'For sewage and dirty water applications, I recommend:\n• **Submersible Pumps** - with cutter for solids\n• **Plastic drainage pipes** - PVC/PP sewer pipes\n• **Rubber hoses** - for flexible connections',
      fr: 'Pour les applications eaux usées et sales, je recommande:\n• **Pompes submersibles** - avec broyeur pour solides\n• **Tuyaux d\'évacuation plastique** - PVC/PP égouts\n• **Tuyaux en caoutchouc** - pour connexions flexibles',
    },
  },
];

// INDUSTRY PROFILES - Maps industries to relevant products and considerations
export const INDUSTRY_PROFILES: Record<string, {
  catalogs: string[];
  considerations: { nl: string; en: string; fr: string };
}> = {
  'landbouw': {
    catalogs: ['bronpompen', 'centrifugaalpompen', 'pe_buizen', 'plat_oprolbare_slangen', 'slangkoppelingen', 'pomp_specials', 'catalogus_aandrijftechniek_150922'],
    considerations: {
      nl: 'Voor landbouw zijn Bauer en Perrot koppelingen de standaard. PE buizen zijn ideaal voor ondergrondse leidingen.',
      en: 'For agriculture, Bauer and Perrot couplings are standard. PE pipes are ideal for underground lines.',
      fr: 'Pour l\'agriculture, les raccords Bauer et Perrot sont la norme. Les tuyaux PE sont idéaux pour les conduites souterraines.',
    },
  },
  'agriculture': {
    catalogs: ['bronpompen', 'centrifugaalpompen', 'pe_buizen', 'plat_oprolbare_slangen', 'slangkoppelingen', 'pomp_specials', 'catalogus_aandrijftechniek_150922'],
    considerations: {
      nl: 'Voor landbouw zijn Bauer en Perrot koppelingen de standaard. PE buizen zijn ideaal voor ondergrondse leidingen.',
      en: 'For agriculture, Bauer and Perrot couplings are standard. PE pipes are ideal for underground lines.',
      fr: 'Pour l\'agriculture, les raccords Bauer et Perrot sont la norme. Les tuyaux PE sont idéaux pour les conduites souterraines.',
    },
  },
  'bouw': {
    catalogs: ['dompelpompen', 'makita_catalogus_2022_nl', 'airpress_catalogus_nl_fr', 'rubber_slangen', 'kranzle_catalogus_2021_nl_1'],
    considerations: {
      nl: 'Op bouwplaatsen zijn robuuste dompelpompen essentieel voor bronbemaling. Makita accu-gereedschap biedt mobiliteit.',
      en: 'On construction sites, robust submersible pumps are essential for dewatering. Makita cordless tools offer mobility.',
      fr: 'Sur les chantiers, les pompes submersibles robustes sont essentielles pour l\'assèchement. L\'outillage sans fil Makita offre la mobilité.',
    },
  },
  'construction': {
    catalogs: ['dompelpompen', 'makita_catalogus_2022_nl', 'airpress_catalogus_nl_fr', 'rubber_slangen', 'kranzle_catalogus_2021_nl_1'],
    considerations: {
      nl: 'Op bouwplaatsen zijn robuuste dompelpompen essentieel voor bronbemaling. Makita accu-gereedschap biedt mobiliteit.',
      en: 'On construction sites, robust submersible pumps are essential for dewatering. Makita cordless tools offer mobility.',
      fr: 'Sur les chantiers, les pompes submersibles robustes sont essentielles pour l\'assèchement. L\'outillage sans fil Makita offre la mobilité.',
    },
  },
  'voedingsindustrie': {
    catalogs: ['rvs_draadfittingen', 'rubber_slangen', 'centrifugaalpompen'],
    considerations: {
      nl: 'Alle materialen moeten food-grade zijn. RVS 316 is aanbevolen voor corrosiebestendigheid. HACCP-certificering beschikbaar.',
      en: 'All materials must be food-grade. Stainless steel 316 is recommended for corrosion resistance. HACCP certification available.',
      fr: 'Tous les matériaux doivent être de qualité alimentaire. L\'inox 316 est recommandé pour la résistance à la corrosion. Certification HACCP disponible.',
    },
  },
  'food': {
    catalogs: ['rvs_draadfittingen', 'rubber_slangen', 'centrifugaalpompen'],
    considerations: {
      nl: 'Alle materialen moeten food-grade zijn. RVS 316 is aanbevolen voor corrosiebestendigheid. HACCP-certificering beschikbaar.',
      en: 'All materials must be food-grade. Stainless steel 316 is recommended for corrosion resistance. HACCP certification available.',
      fr: 'Tous les matériaux doivent être de qualité alimentaire. L\'inox 316 est recommandé pour la résistance à la corrosion. Certification HACCP disponible.',
    },
  },
  'industrie': {
    catalogs: ['airpress_catalogus_nl_fr', 'rvs_draadfittingen', 'verzinkte_buizen', 'rubber_slangen', 'pu_afzuigslangen', 'catalogus_aandrijftechniek_150922'],
    considerations: {
      nl: 'Voor industriële toepassingen bieden wij heavy-duty oplossingen. Vraag naar onze projectkortingen voor grote bestellingen.',
      en: 'For industrial applications, we offer heavy-duty solutions. Ask about our project discounts for large orders.',
      fr: 'Pour les applications industrielles, nous proposons des solutions robustes. Renseignez-vous sur nos remises projet pour les grandes commandes.',
    },
  },
  'industrial': {
    catalogs: ['airpress_catalogus_nl_fr', 'rvs_draadfittingen', 'verzinkte_buizen', 'rubber_slangen', 'pu_afzuigslangen', 'catalogus_aandrijftechniek_150922'],
    considerations: {
      nl: 'Voor industriële toepassingen bieden wij heavy-duty oplossingen. Vraag naar onze projectkortingen voor grote bestellingen.',
      en: 'For industrial applications, we offer heavy-duty solutions. Ask about our project discounts for large orders.',
      fr: 'Pour les applications industrielles, nous proposons des solutions robustes. Renseignez-vous sur nos remises projet pour les grandes commandes.',
    },
  },
};

// TECHNICAL SPECS PATTERNS - Extract and match technical requirements
export const TECHNICAL_PATTERNS: Array<{
  pattern: RegExp;
  extract: (match: RegExpMatchArray) => { type: string; value: number; unit: string };
  catalogFilter: (value: number, unit: string) => string[];
}> = [
  // Depth (meters)
  {
    pattern: /(\d+)\s*(m|meter|meters)\s*(diep|deep|depth)?/i,
    extract: (match) => ({ type: 'depth', value: parseInt(match[1]), unit: 'm' }),
    catalogFilter: (value) => {
      if (value > 100) return ['bronpompen']; // Deep well pumps only
      if (value > 8) return ['bronpompen', 'dompelpompen']; // Submersible needed
      return ['centrifugaalpompen', 'dompelpompen', 'zuigerpompen']; // Surface pumps OK
    },
  },
  // Pressure (bar)
  {
    pattern: /(\d+)\s*(bar|atm)\s*(druk|pressure)?/i,
    extract: (match) => ({ type: 'pressure', value: parseInt(match[1]), unit: 'bar' }),
    catalogFilter: (value) => {
      if (value > 10) return ['drukbuizen', 'verzinkte_buizen', 'rvs_draadfittingen'];
      if (value > 6) return ['drukbuizen', 'pe_buizen', 'messing_draadfittingen'];
      return ['pe_buizen', 'kunststof_afvoerleidingen', 'rubber_slangen'];
    },
  },
  // Flow rate (L/min or m³/h)
  {
    pattern: /(\d+)\s*(l\/min|liter.*min|m3\/h|m³\/h)/i,
    extract: (match) => ({ type: 'flow', value: parseInt(match[1]), unit: match[2].toLowerCase() }),
    catalogFilter: (value, unit) => {
      const flowLMin = unit.includes('m3') || unit.includes('m³') ? value * 16.67 : value;
      if (flowLMin > 500) return ['bronpompen', 'centrifugaalpompen'];
      if (flowLMin > 100) return ['centrifugaalpompen', 'dompelpompen'];
      return ['dompelpompen', 'zuigerpompen', 'centrifugaalpompen'];
    },
  },
  // Diameter (mm or inch)
  {
    pattern: /(\d+)\s*(mm|inch|")\s*(diameter|doorsnede|buis|pipe)?/i,
    extract: (match) => ({ type: 'diameter', value: parseInt(match[1]), unit: match[2] }),
    catalogFilter: (value, unit) => {
      const diamMm = unit === 'inch' || unit === '"' ? value * 25.4 : value;
      if (diamMm > 100) return ['pe_buizen', 'drukbuizen', 'kunststof_afvoerleidingen'];
      if (diamMm > 50) return ['pe_buizen', 'drukbuizen', 'verzinkte_buizen', 'rubber_slangen'];
      return ['messing_draadfittingen', 'rvs_draadfittingen', 'rubber_slangen', 'slangklemmen'];
    },
  },
];

// Quick response templates for common questions
export const QUICK_RESPONSES: Record<string, Record<'nl' | 'en' | 'fr', string>> = {
  greeting: {
    nl: 'Hallo! Ik ben de DEMA Product Assistent. Hoe kan ik u helpen? U kunt mij vragen stellen over:\n• Pompen (bronpompen, dompelpompen, centrifugaalpompen)\n• Buizen & Fittingen (PE, PVC, RVS, messing)\n• Slangen & Koppelingen (Bauer, Perrot, Camlock)\n• Gereedschap (Makita, Kränzle)\n• Perslucht (Airpress compressoren)',
    en: 'Hello! I am the DEMA Product Assistant. How can I help you? You can ask me about:\n• Pumps (well pumps, submersible pumps, centrifugal pumps)\n• Pipes & Fittings (PE, PVC, stainless steel, brass)\n• Hoses & Couplings (Bauer, Perrot, Camlock)\n• Tools (Makita, Kränzle)\n• Compressed Air (Airpress compressors)',
    fr: 'Bonjour! Je suis l\'Assistant Produits DEMA. Comment puis-je vous aider? Vous pouvez me poser des questions sur:\n• Pompes (pompes de puits, pompes submersibles, pompes centrifuges)\n• Tuyaux & Raccords (PE, PVC, inox, laiton)\n• Tuyaux flexibles & Raccords rapides (Bauer, Perrot, Camlock)\n• Outillage (Makita, Kränzle)\n• Air comprimé (compresseurs Airpress)',
  },
  notFound: {
    nl: 'Ik kon geen specifieke producten vinden voor uw vraag. Kunt u meer details geven over wat u zoekt? Of neem contact op met ons team via info@demashop.be of +32 (0)51 20 51 41.',
    en: 'I couldn\'t find specific products for your query. Could you provide more details about what you\'re looking for? Or contact our team at info@demashop.be or +32 (0)51 20 51 41.',
    fr: 'Je n\'ai pas trouvé de produits spécifiques pour votre demande. Pourriez-vous donner plus de détails sur ce que vous recherchez? Ou contactez notre équipe via info@demashop.be ou +32 (0)51 20 51 41.',
  },
  quotePrompt: {
    nl: 'Wilt u een offerte aanvragen voor deze producten? Klik op "Offerte aanvragen" of voeg producten toe aan uw offertemandje.',
    en: 'Would you like to request a quote for these products? Click "Request Quote" or add products to your quote basket.',
    fr: 'Souhaitez-vous demander un devis pour ces produits? Cliquez sur "Demander un devis" ou ajoutez des produits à votre panier de devis.',
  },
};

// =============================================================================
// CATEGORY HIERARCHY (matches /categories page structure)
// =============================================================================
export interface CategorySubcategory {
  name: string;
  nameEN: string;
  nameFR: string;
  slug: string;
  catalogs: string[];
  description: string;
  descriptionEN: string;
  descriptionFR: string;
}

export interface CategoryHierarchy {
  name: string;
  nameEN: string;
  nameFR: string;
  slug: string;
  keywords: string[];
  subcategories: CategorySubcategory[];
}

export const CATEGORY_HIERARCHY: CategoryHierarchy[] = [
  {
    name: 'Pompen & Toebehoren',
    nameEN: 'Pumps & Accessories',
    nameFR: 'Pompes & Accessoires',
    slug: 'pompen',
    keywords: ['pomp', 'pompen', 'pump', 'pumps', 'pompe', 'pompes', 'water', 'verpompen'],
    subcategories: [
      {
        name: 'Dompelpompen',
        nameEN: 'Submersible Pumps',
        nameFR: 'Pompes Immergées',
        slug: 'dompelpompen',
        catalogs: ['dompelpompen'],
        description: 'Pompen voor onderwatergebruik, ideaal voor kelderontwatering en vuil water',
        descriptionEN: 'Pumps for underwater use, ideal for basement drainage and dirty water',
        descriptionFR: 'Pompes pour utilisation sous-marine, idéales pour le drainage de caves et eaux sales',
      },
      {
        name: 'Centrifugaalpompen',
        nameEN: 'Centrifugal Pumps',
        nameFR: 'Pompes Centrifuges',
        slug: 'centrifugaalpompen',
        catalogs: ['centrifugaalpompen'],
        description: 'Krachtige pompen voor grote debieten en irrigatie',
        descriptionEN: 'Powerful pumps for high flow rates and irrigation',
        descriptionFR: 'Pompes puissantes pour débits élevés et irrigation',
      },
      {
        name: 'Bronpompen',
        nameEN: 'Well Pumps',
        nameFR: 'Pompes de Puits',
        slug: 'bronpompen',
        catalogs: ['bronpompen'],
        description: 'Diepe bronpompen voor grondwaterwinning',
        descriptionEN: 'Deep well pumps for groundwater extraction',
        descriptionFR: 'Pompes de puits profonds pour extraction d\'eau souterraine',
      },
      {
        name: 'Zuigerpompen',
        nameEN: 'Piston Pumps',
        nameFR: 'Pompes à Piston',
        slug: 'zuigerpompen',
        catalogs: ['zuigerpompen'],
        description: 'Handpompen en zuigerpompen voor diverse toepassingen',
        descriptionEN: 'Hand pumps and piston pumps for various applications',
        descriptionFR: 'Pompes manuelles et pompes à piston pour diverses applications',
      },
      {
        name: 'Pomp Specials',
        nameEN: 'Pump Specials',
        nameFR: 'Pompes Spéciales',
        slug: 'pomp-specials',
        catalogs: ['pomp-specials'],
        description: 'Speciale pompen en accessoires',
        descriptionEN: 'Special pumps and accessories',
        descriptionFR: 'Pompes spéciales et accessoires',
      },
      {
        name: 'Pompen Toebehoren',
        nameEN: 'Pump Accessories',
        nameFR: 'Accessoires de Pompes',
        slug: 'pompen-toebehoren',
        catalogs: ['digitale-versie-pompentoebehoren-compressed'],
        description: 'Toebehoren en onderdelen voor pompen',
        descriptionEN: 'Accessories and parts for pumps',
        descriptionFR: 'Accessoires et pièces pour pompes',
      },
    ],
  },
  {
    name: 'Buizen & Fittingen',
    nameEN: 'Pipes & Fittings',
    nameFR: 'Tuyaux & Raccords',
    slug: 'buizen-fittingen',
    keywords: ['buis', 'buizen', 'pipe', 'pipes', 'tuyau', 'tuyaux', 'fitting', 'fittingen', 'raccord', 'raccords'],
    subcategories: [
      {
        name: 'Kunststof Buizen',
        nameEN: 'Plastic Pipes',
        nameFR: 'Tuyaux Plastiques',
        slug: 'kunststof-buizen',
        catalogs: ['pe-buizen', 'abs-persluchtbuizen', 'kunststof-afvoerleidingen', 'drukbuizen'],
        description: 'PE, ABS en andere kunststof buizen',
        descriptionEN: 'PE, ABS and other plastic pipes',
        descriptionFR: 'Tuyaux PE, ABS et autres plastiques',
      },
      {
        name: 'Metalen Buizen',
        nameEN: 'Metal Pipes',
        nameFR: 'Tuyaux Métalliques',
        slug: 'metalen-buizen',
        catalogs: ['verzinkte-buizen'],
        description: 'Verzinkte en stalen buizen',
        descriptionEN: 'Galvanized and steel pipes',
        descriptionFR: 'Tuyaux galvanisés et en acier',
      },
      {
        name: 'Fittingen',
        nameEN: 'Fittings',
        nameFR: 'Raccords',
        slug: 'fittingen',
        catalogs: ['messing-draadfittingen', 'rvs-draadfittingen', 'zwarte-draad-en-lasfittingen'],
        description: 'Messing, RVS en stalen fittingen',
        descriptionEN: 'Brass, stainless steel and steel fittings',
        descriptionFR: 'Raccords en laiton, inox et acier',
      },
    ],
  },
  {
    name: 'Slangen & Koppelingen',
    nameEN: 'Hoses & Couplings',
    nameFR: 'Tuyaux Flexibles & Raccords',
    slug: 'slangen-koppelingen',
    keywords: ['slang', 'slangen', 'hose', 'hoses', 'tuyau flexible', 'koppeling', 'koppelingen', 'coupling'],
    subcategories: [
      {
        name: 'Slangen',
        nameEN: 'Hoses',
        nameFR: 'Tuyaux Flexibles',
        slug: 'slangen',
        catalogs: ['rubber-slangen', 'pu-afzuigslangen', 'plat-oprolbare-slangen'],
        description: 'Rubber, PU en plat oprolbare slangen',
        descriptionEN: 'Rubber, PU and flat roll-up hoses',
        descriptionFR: 'Tuyaux en caoutchouc, PU et enroulables',
      },
      {
        name: 'Koppelingen & Klemmen',
        nameEN: 'Couplings & Clamps',
        nameFR: 'Raccords & Colliers',
        slug: 'koppelingen-klemmen',
        catalogs: ['slangkoppelingen', 'slangklemmen'],
        description: 'Slangkoppelingen en slangklemmen',
        descriptionEN: 'Hose couplings and hose clamps',
        descriptionFR: 'Raccords et colliers de serrage',
      },
    ],
  },
  {
    name: 'Merken',
    nameEN: 'Brands',
    nameFR: 'Marques',
    slug: 'merken',
    keywords: ['makita', 'airpress', 'kränzle', 'kranzle', 'gereedschap', 'tools', 'outils'],
    subcategories: [
      {
        name: 'Makita',
        nameEN: 'Makita',
        nameFR: 'Makita',
        slug: 'makita',
        catalogs: ['makita-catalogus-2022-nl', 'makita-tuinfolder-2022-nl'],
        description: 'Professioneel elektrisch en accu gereedschap',
        descriptionEN: 'Professional electric and cordless tools',
        descriptionFR: 'Outillage électrique et sans fil professionnel',
      },
      {
        name: 'Airpress',
        nameEN: 'Airpress',
        nameFR: 'Airpress',
        slug: 'airpress',
        catalogs: ['airpress-catalogus-nl-fr', 'airpress-catalogus-eng'],
        description: 'Compressoren en persluchtgereedschap',
        descriptionEN: 'Compressors and pneumatic tools',
        descriptionFR: 'Compresseurs et outillage pneumatique',
      },
      {
        name: 'Kränzle',
        nameEN: 'Kränzle',
        nameFR: 'Kränzle',
        slug: 'kranzle',
        catalogs: ['kranzle-catalogus-2021-nl-1'],
        description: 'Professionele hogedrukreinigers',
        descriptionEN: 'Professional pressure washers',
        descriptionFR: 'Nettoyeurs haute pression professionnels',
      },
    ],
  },
  {
    name: 'Aandrijftechniek',
    nameEN: 'Drive Technology',
    nameFR: 'Technique d\'Entraînement',
    slug: 'aandrijftechniek',
    keywords: ['aandrijving', 'drive', 'entraînement', 'lager', 'bearing', 'roulement', 'riem', 'belt', 'courroie'],
    subcategories: [
      {
        name: 'Aandrijfcomponenten',
        nameEN: 'Drive Components',
        nameFR: 'Composants d\'Entraînement',
        slug: 'aandrijfcomponenten',
        catalogs: ['catalogus-aandrijftechniek-150922'],
        description: 'Lagers, riemen, kettingen en tandwielen',
        descriptionEN: 'Bearings, belts, chains and gears',
        descriptionFR: 'Roulements, courroies, chaînes et engrenages',
      },
    ],
  },
];

export interface Translations {
  auth: {
    createAccount: string
    signup: string
    passwordRequirements: string
    individual: string
    business: string
    register: string
    roles: {
      b2bCustomer: string
      b2cCustomer: string
      employee: string
      partner: string
      supplier: string
    }
    labels: {
      relationship: string
      email: string
      password: string
      firstName: string
      lastName: string
      phone: string
      companyName: string
      vatNumber: string
      industry: string
      companySize: string
      company: string
      department: string
      employeeId: string
      marketingConsent: string
    }
    fields: {
      vatNumber: string
      companyName: string
      industryType: string
      selectIndustry: string
      firstName: string
      lastName: string
      email: string
    }
    errors: {
      creditCheckFailed: string
      registrationFailed: string
    }
  }
  departments: {
    sales: string
    support: string
    logistics: string
    finance: string
    hr: string
    it: string
    operations: string
  }
  industries: {
    manufacturing: string
    construction: string
    wholesale: string
    retail: string
    services: string
  }
  common: {
    backToHome: string
    visitWebsite: string
    browseProducts: string
    contactUs: string
    learnMore: string
    viewAll: string
    languages: string
    search: string
    processing: string
  }
  navigation: {
    individuals: string
    professionals: string
    companies: string
    'all-products': string
    about: string
    inspiration: string
    help: string
    promotions: string
    myportal: string
  }
  home: {
    title: string
    subtitle: string
    browseAllProducts: string
    ourCompanies: string
    needHelp: string
    helpDescription: string
    startChat: string
    stats: {
      companies: string
      products: string
      yearsExperience: string
      serviceAvailable: string
    }
  }
  company: {
    ourProducts: string
    productCategories: string
    ourServices: string
    industriesWeServe: string
    otherCompanies: string
    partOfDemaGroup: string
  }
  footer: {
    description: string
    companies: string
    contact: string
    allRightsReserved: string
  }
  companies: {
    dema: {
      tagline: string
      description: string
    }
    fluxer: {
      tagline: string
      description: string
    }
    beltz247: {
      tagline: string
      description: string
    }
    devisschere: {
      tagline: string
      description: string
    }
    accu: {
      tagline: string
      description: string
    }
  }
  products: {
    pump: string
    pumpDesc: string
    pipes: string
    pipesDesc: string
    tools: string
    toolsDesc: string
    compressor: string
    compressorDesc: string
    valve: string
    valveDesc: string
    actuator: string
    actuatorDesc: string
    instrumentation: string
    instrumentationDesc: string
    conveyor: string
    conveyorDesc: string
    sprinkler: string
    sprinklerDesc: string
    drip: string
    dripDesc: string
    screws: string
    screwsDesc: string
  }
}

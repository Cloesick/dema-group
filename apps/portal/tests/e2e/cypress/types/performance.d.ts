declare namespace Cypress {
  interface Chainable<Subject> {
    measurePerformance(): Chainable<void>;
  }
}

interface PerformanceResourceTimingExtended extends PerformanceResourceTiming {
  initiatorType: string;
}

interface PerformanceEntryExtended extends PerformanceEntry {
  initiatorType?: string;
}

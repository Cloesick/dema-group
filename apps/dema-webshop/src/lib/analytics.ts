/**
 * Customer Behavior Analytics
 * Track user journey, engagement, and conversion patterns
 */

// Types for customer behavior tracking
export interface CustomerBehaviorEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  customData?: Record<string, any>;
}

export interface PageViewEvent {
  path: string;
  title?: string;
  referrer?: string;
  timeOnPage?: number;
}

export interface ProductInteraction {
  productId: string;
  productName: string;
  catalog: string;
  action: 'view' | 'add_to_quote' | 'variant_select' | 'pdf_view' | 'compare';
  price?: number;
  quantity?: number;
}

export interface CustomerJourney {
  sessionId: string;
  touchpoints: string[];
  entryPage: string;
  exitPage?: string;
  totalTimeSpent: number;
  pagesViewed: number;
  productsViewed: number;
  quotesRequested: number;
}

// Check if we're in browser and GA is loaded
const isGAAvailable = (): boolean => {
  return typeof window !== 'undefined' && typeof (window as any).gtag === 'function';
};

// Track page view
export function trackPageView(event: PageViewEvent): void {
  if (!isGAAvailable()) return;
  
  (window as any).gtag('event', 'page_view', {
    page_path: event.path,
    page_title: event.title,
    page_referrer: event.referrer,
  });
}

// Track custom event
export function trackEvent(event: CustomerBehaviorEvent): void {
  if (!isGAAvailable()) return;
  
  (window as any).gtag('event', event.action, {
    event_category: event.category,
    event_label: event.label,
    value: event.value,
    ...event.customData,
  });
}

// Track product interactions - Customer behavior focused
export function trackProductInteraction(event: ProductInteraction): void {
  if (!isGAAvailable()) return;
  
  (window as any).gtag('event', event.action, {
    event_category: 'product_engagement',
    event_label: event.productName,
    product_id: event.productId,
    catalog: event.catalog,
    price: event.price,
    quantity: event.quantity,
  });
}

// Track customer engagement with product cards
export function trackProductCardEngagement(
  productId: string,
  productName: string,
  catalog: string,
  engagementType: 'hover' | 'click' | 'expand' | 'variant_change'
): void {
  if (!isGAAvailable()) return;
  
  (window as any).gtag('event', 'product_card_engagement', {
    event_category: 'customer_engagement',
    engagement_type: engagementType,
    product_id: productId,
    product_name: productName,
    catalog: catalog,
  });
}

// Track time spent on product
export function trackProductViewDuration(
  productId: string,
  productName: string,
  durationSeconds: number
): void {
  if (!isGAAvailable()) return;
  
  (window as any).gtag('event', 'product_view_duration', {
    event_category: 'customer_engagement',
    product_id: productId,
    product_name: productName,
    duration_seconds: durationSeconds,
    engagement_level: durationSeconds > 30 ? 'high' : durationSeconds > 10 ? 'medium' : 'low',
  });
}

// Track search
export function trackSearch(query: string, resultsCount: number): void {
  if (!isGAAvailable()) return;
  
  (window as any).gtag('event', 'search', {
    search_term: query,
    results_count: resultsCount,
  });
}

// Track quote actions
export function trackQuote(action: 'add_item' | 'remove_item' | 'submit' | 'view', itemCount?: number): void {
  if (!isGAAvailable()) return;
  
  (window as any).gtag('event', `quote_${action}`, {
    event_category: 'quote',
    items_count: itemCount,
  });
}

// Track chatbot interactions
export function trackChatbot(action: 'open' | 'close' | 'message_sent' | 'suggestion_clicked', data?: Record<string, any>): void {
  if (!isGAAvailable()) return;
  
  (window as any).gtag('event', `chatbot_${action}`, {
    event_category: 'chatbot',
    ...data,
  });
}

// Track PDF views
export function trackPdfView(pdfName: string, page?: number): void {
  if (!isGAAvailable()) return;
  
  (window as any).gtag('event', 'pdf_view', {
    event_category: 'pdf',
    pdf_name: pdfName,
    page_number: page,
  });
}

// Track errors
export function trackError(errorMessage: string, errorSource: string): void {
  if (!isGAAvailable()) return;
  
  (window as any).gtag('event', 'exception', {
    description: errorMessage,
    fatal: false,
    error_source: errorSource,
  });
}

// ============================================
// CUSTOMER BEHAVIOR TRACKING
// ============================================

// Track customer journey stage
export function trackCustomerJourneyStage(
  stage: 'awareness' | 'consideration' | 'decision' | 'purchase_intent',
  details?: Record<string, any>
): void {
  if (!isGAAvailable()) return;
  
  (window as any).gtag('event', 'customer_journey_stage', {
    event_category: 'customer_journey',
    journey_stage: stage,
    ...details,
  });
}

// Track filter usage patterns
export function trackFilterUsage(
  filterType: string,
  filterValue: string,
  resultsCount: number
): void {
  if (!isGAAvailable()) return;
  
  (window as any).gtag('event', 'filter_applied', {
    event_category: 'customer_behavior',
    filter_type: filterType,
    filter_value: filterValue,
    results_count: resultsCount,
  });
}

// Track catalog browsing behavior
export function trackCatalogBrowsing(
  catalogName: string,
  action: 'enter' | 'browse' | 'exit',
  productsViewed?: number,
  timeSpentSeconds?: number
): void {
  if (!isGAAvailable()) return;
  
  (window as any).gtag('event', 'catalog_browsing', {
    event_category: 'customer_behavior',
    catalog_name: catalogName,
    browsing_action: action,
    products_viewed: productsViewed,
    time_spent_seconds: timeSpentSeconds,
  });
}

// Track quote funnel progression
export function trackQuoteFunnel(
  step: 'view_product' | 'add_to_quote' | 'view_quote' | 'fill_form' | 'submit_quote',
  productCount?: number,
  totalValue?: number
): void {
  if (!isGAAvailable()) return;
  
  (window as any).gtag('event', 'quote_funnel', {
    event_category: 'conversion_funnel',
    funnel_step: step,
    product_count: productCount,
    estimated_value: totalValue,
  });
}

// Track customer intent signals
export function trackIntentSignal(
  signal: 'high_engagement' | 'comparison_shopping' | 'ready_to_buy' | 'price_sensitive' | 'technical_research',
  confidence: number,
  evidence?: string
): void {
  if (!isGAAvailable()) return;
  
  (window as any).gtag('event', 'customer_intent_signal', {
    event_category: 'customer_intelligence',
    intent_signal: signal,
    confidence_score: confidence,
    evidence: evidence,
  });
}

// Track repeat visitor behavior
export function trackVisitorType(
  isReturning: boolean,
  visitCount: number,
  daysSinceLastVisit?: number
): void {
  if (!isGAAvailable()) return;
  
  (window as any).gtag('event', 'visitor_profile', {
    event_category: 'customer_segmentation',
    visitor_type: isReturning ? 'returning' : 'new',
    visit_count: visitCount,
    days_since_last_visit: daysSinceLastVisit,
  });
}

// Track B2B specific behaviors
export function trackB2BBehavior(
  action: 'bulk_inquiry' | 'technical_spec_download' | 'catalog_request' | 'price_inquiry',
  details?: Record<string, any>
): void {
  if (!isGAAvailable()) return;
  
  (window as any).gtag('event', 'b2b_behavior', {
    event_category: 'b2b_engagement',
    b2b_action: action,
    ...details,
  });
}

// Track scroll depth on product pages
export function trackScrollDepth(
  pagePath: string,
  depth: 25 | 50 | 75 | 100
): void {
  if (!isGAAvailable()) return;
  
  (window as any).gtag('event', 'scroll_depth', {
    event_category: 'customer_engagement',
    page_path: pagePath,
    scroll_depth_percent: depth,
  });
}

// Vercel Analytics (Web Vitals)
export function reportWebVitals(metric: {
  id: string;
  name: string;
  value: number;
  label: 'web-vital' | 'custom';
}): void {
  if (!isGAAvailable()) return;
  
  (window as any).gtag('event', metric.name, {
    event_category: metric.label === 'web-vital' ? 'Web Vitals' : 'Custom Metric',
    value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    event_label: metric.id,
    non_interaction: true,
  });
}

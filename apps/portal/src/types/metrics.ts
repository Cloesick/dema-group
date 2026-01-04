export interface ResourceMetric {
  name: string;
  duration: number;
  size: number;
  type: string;
}

export interface PerformanceMetrics {
  fcp: number;
  lcp: number;
  cls: number;
  fid: number;
  ttfb: number;
  tti: number;
  resourceTiming: {
    slow: number;
    size: number;
  };
}

export interface PerformanceMark {
  name: string;
  startTime: number;
}

export interface BuildError {
  type: 'typescript' | 'build' | 'runtime';
  file: string;
  line: number;
  column: number;
  message: string;
  suggestion?: string;
  context?: string;
}

export interface BuildLog {
  timestamp: string;
  type: 'info' | 'warning' | 'error';
  message: string;
  source?: string;
}

export interface DeploymentStatus {
  id: string;
  status: 'building' | 'error' | 'success';
  url?: string;
  error?: BuildError;
  logs: BuildLog[];
  startTime: string;
  endTime?: string;
}

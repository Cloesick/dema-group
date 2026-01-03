export interface BuildLogEvent {
  timestamp: string;
  type: 'build-log' | 'command';
  payload?: {
    text?: string;
  };
  message?: string;
}

export interface VercelDeploymentMeta {
  branch?: string;
  commit?: string;
}

export interface VercelDeploymentPayload {
  id: string;
  name: string;
  url: string;
  inspectorUrl: string;
  state: 'BUILDING' | 'ERROR' | 'READY' | 'CANCELED';
  meta?: VercelDeploymentMeta;
  errorMessage?: string;
  createdAt: string;
  buildingAt?: string;
  ready?: string;
  regions?: string[];
}

export interface VercelDeployment {
  id: string;
  type: string;
  payload: VercelDeploymentPayload;
  createdAt: number;
}

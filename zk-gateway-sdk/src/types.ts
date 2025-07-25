// SDK Types

export interface Identity {
  secret: string;
  orgId: string;
  createdAt: string;
}

export interface EndpointMapping {
  hash: string;
  originalUrl: string;
  organizationId: string;
  createdAt: string;
}

export interface ZKGatewayConfig {
  gatewayUrl?: string;
  organizationId: string;
  secret?: string;
}

export interface ZKRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  data?: any;
  params?: any;
  headers?: Record<string, string>;
}

export interface ZKResponse {
  success: boolean;
  data: any;
  error?: string;
}

export interface ZKProof {
  protocol: string;
  curve: string;
  pi_a: string[];
  pi_b: string[][];
  pi_c: string[];
}

export interface CircuitInput {
  secret: string;
  org_id: string;
  nonce: string;
} 
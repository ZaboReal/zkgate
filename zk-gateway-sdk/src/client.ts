import axios from 'axios';
import { generateProof } from './proofs';
import { loadIdentity } from './identity';
import { getHashedEndpoint } from './endpoints';
import { ZKGatewayConfig, ZKRequestOptions, ZKResponse, CircuitInput } from './types';

export class ZKGatewayClient {
  private config: ZKGatewayConfig;
  private isInitialized: boolean = false;

  constructor(config: ZKGatewayConfig) {
    this.config = {
      gatewayUrl: 'http://localhost:3001',
      ...config
    };
  }

  async initialize(): Promise<void> {
    try {
      // Load identity
      const identity = loadIdentity();
      this.config.secret = identity.secret;
      
      this.isInitialized = true;
      console.log('✅ ZK Gateway Client initialized');
    } catch (error) {
      throw new Error('Failed to initialize ZK Gateway Client. Make sure you have run: zk-gateway init <orgId>');
    }
  }

  async request(endpointHash: string, options: ZKRequestOptions = {}): Promise<ZKResponse> {
    if (!this.isInitialized) {
      throw new Error('Client not initialized. Call initialize() first.');
    }

    try {
      // Generate ZK proof
      const nonce = Math.floor(Math.random() * 1e12).toString();
      const input: CircuitInput = {
        secret: this.config.secret!,
        org_id: this.config.organizationId,
        nonce: nonce
      };

      const { proof, publicSignals } = await generateProof(input);

      // Prepare request payload
      const requestPayload = {
        proof: proof,
        publicSignals: publicSignals,
        endpointHash: endpointHash,
        payload: {
          method: options.method || 'GET',
          data: options.data || null,
          params: options.params || null,
          headers: options.headers || {}
        },
        method: options.method || 'GET'
      };

      // Send to gateway
      const response = await axios.post(`${this.config.gatewayUrl}/v1/access`, requestPayload);

      return {
        success: true,
        data: response.data
      };

    } catch (error: any) {
      return {
        success: false,
        data: null,
        error: error.message || 'Request failed'
      };
    }
  }

  async requestByUrl(url: string, options: ZKRequestOptions = {}): Promise<ZKResponse> {
    const hash = getHashedEndpoint(url, this.config.organizationId);
    if (!hash) {
      return {
        success: false,
        data: null,
        error: `No hash found for URL: ${url}. Please upload this endpoint first.`
      };
    }
    return this.request(hash, options);
  }

  isReady(): boolean {
    return this.isInitialized;
  }
} 
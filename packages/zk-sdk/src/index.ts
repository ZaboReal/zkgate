import { generateProof } from '../bin/cli';
import * as endpoints from './endpoints';
import * as identity from './identity';
import * as request from './request';

export async function generateZKProof(inputPath: string, wasmPath: string, zkeyPath: string) {
    await generateProof(inputPath, wasmPath, zkeyPath);
}

// Export all modules
export { endpoints, identity, request };

// Re-export commonly used functions
export const {
  uploadEndpoints,
  getHashedEndpoint,
  getOriginalUrl,
  listEndpointMappings,
  clearEndpointMappings,
  validateEndpoint,
  generateLocalHash
} = endpoints;

export const {
  generateIdentity,
  loadIdentity
} = identity;

export const {
  runZkRequest
} = request;

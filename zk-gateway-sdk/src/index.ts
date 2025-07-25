// Main SDK entry point
export { ZKGatewayClient } from './client';
export { generateIdentity, loadIdentity } from './identity';
export { uploadEndpoints, getHashedEndpoint, listEndpointMappings } from './endpoints';
export { generateProof, verifyProof } from './proofs';

// Types
export type { ZKGatewayConfig, ZKRequestOptions, ZKResponse } from './types';
export type { Identity, EndpointMapping } from './types'; 
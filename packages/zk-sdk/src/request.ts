import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { execSync } from 'child_process';
import { loadIdentity } from './identity';
import { getHashedEndpoint } from './endpoints';

export async function runZkRequest(apiTarget: string, payload: any, method: string = 'POST') {
  const { secret, orgId } = loadIdentity();
  const nonce = Math.floor(Math.random() * 1e12).toString();

  const input = {
    secret: secret.toString(),
    org_id: orgId.toString(),
    nonce: nonce.toString()
  };

  const inputPath = 'input.json';
  const wasmPath = '../zk-circuits/circuits/build/access_proof_with_nonce_js';
  const zkeyPath = '../zk-circuits/circuits/access_proof_with_nonce_final.zkey';
  const witnessPath = 'witness.wtns';
  const proofPath = 'proof.json';
  const publicPath = 'public.json';

  fs.writeFileSync(inputPath, JSON.stringify(input, null, 2));

  console.log('⚙️ Generating witness...');
  execSync(`node ${wasmPath}/generate_witness.js ${wasmPath}/access_proof_with_nonce.wasm ${inputPath} ${witnessPath}`, { stdio: 'inherit' });

  console.log('🔐 Generating proof...');
  execSync(`snarkjs groth16 prove ${zkeyPath} ${witnessPath} ${proofPath} ${publicPath}`, { stdio: 'inherit' });

  const proof = JSON.parse(fs.readFileSync(proofPath, 'utf-8'));
  const publicSignals = JSON.parse(fs.readFileSync(publicPath, 'utf-8'));

  console.log(`🚀 Sending ${method} request to API Gateway...`);

  // Try to get hashed endpoint first, fallback to original URL
  const hashedEndpoint = getHashedEndpoint(apiTarget, orgId);
  
  const requestPayload: any = {
    proof,
    publicSignals,
    payload
  };

  if (hashedEndpoint) {
    // Use new hashed endpoint system
    requestPayload.endpointHash = hashedEndpoint;
    console.log(`🔗 Using hashed endpoint: ${hashedEndpoint}`);
  } else {
    // Fallback to legacy endpoint ID system
    requestPayload.apiTarget = apiTarget;
    console.log(`🔗 Using original endpoint: ${apiTarget}`);
  }

  const res = await axios({
    method: method.toLowerCase(),
    url: 'http://localhost:3001/v1/access',
    data: requestPayload
  });

  console.log('✅ Gateway response:', res.data);
}

// New function for making requests with hashed endpoints
export async function runZkRequestWithHash(endpointHash: string, payload: any, method: string = 'POST') {
  const { secret, orgId } = loadIdentity();
  const nonce = Math.floor(Math.random() * 1e12).toString();

  const input = {
    secret: secret.toString(),
    org_id: orgId.toString(),
    nonce: nonce.toString()
  };

  const inputPath = 'input.json';
  const wasmPath = '../zk-circuits/circuits/build/access_proof_with_nonce_js';
  const zkeyPath = '../zk-circuits/circuits/access_proof_with_nonce_final.zkey';
  const witnessPath = 'witness.wtns';
  const proofPath = 'proof.json';
  const publicPath = 'public.json';

  fs.writeFileSync(inputPath, JSON.stringify(input, null, 2));

  console.log('⚙️ Generating witness...');
  execSync(`node ${wasmPath}/generate_witness.js ${wasmPath}/access_proof_with_nonce.wasm ${inputPath} ${witnessPath}`, { stdio: 'inherit' });

  console.log('🔐 Generating proof...');
  execSync(`snarkjs groth16 prove ${zkeyPath} ${witnessPath} ${proofPath} ${publicPath}`, { stdio: 'inherit' });

  const proof = JSON.parse(fs.readFileSync(proofPath, 'utf-8'));
  const publicSignals = JSON.parse(fs.readFileSync(publicPath, 'utf-8'));

  console.log(`🚀 Sending ${method} request to API Gateway with hash: ${endpointHash}...`);

  const res = await axios({
    method: method.toLowerCase(),
    url: 'http://localhost:3001/v1/access',
    data: {
      proof,
      publicSignals,
      endpointHash,
      payload
    }
  });

  console.log('✅ Gateway response:', res.data);
}

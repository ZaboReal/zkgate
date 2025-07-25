#!/usr/bin/env node

import { generateIdentity } from './identity';
import { uploadEndpoints, listEndpointMappings } from './endpoints';
import { generateProof } from './proofs';
import fs from 'fs';

// Command routing
const command = process.argv[2];

async function main() {
  try {
    if (command === 'init') {
      const orgId = process.argv[3];
      if (!orgId) {
        console.log('Usage: zk-gateway init <organizationId>');
        console.log('Example: zk-gateway init my-company-123');
        process.exit(1);
      }
      
      const identity = generateIdentity(orgId);
      console.log(`✅ Identity created for organization: ${orgId}`);
      console.log(`🔐 Secret: ${identity.secret.substring(0, 16)}...`);
      
    } else if (command === 'upload') {
      const endpointsFile = process.argv[3];
      const gatewayUrl = process.argv[4] || 'http://localhost:3001';
      
      if (!endpointsFile) {
        console.log('Usage: zk-gateway upload <endpointsFile> [gatewayUrl]');
        console.log('Example: zk-gateway upload endpoints.txt');
        console.log('Example: zk-gateway upload endpoints.txt http://localhost:3001');
        process.exit(1);
      }
      
      if (!fs.existsSync(endpointsFile)) {
        console.log(`❌ File not found: ${endpointsFile}`);
        process.exit(1);
      }
      
      const endpoints = fs.readFileSync(endpointsFile, 'utf-8')
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#'));
      
      if (endpoints.length === 0) {
        console.log('❌ No valid endpoints found in file');
        process.exit(1);
      }
      
      console.log(`📤 Uploading ${endpoints.length} endpoints...`);
      const hashedEndpoints = await uploadEndpoints(endpoints, 'test-org-123', gatewayUrl);
      
      console.log('✅ Endpoints uploaded successfully!');
      console.log('📋 Hashed endpoints:');
      Object.entries(hashedEndpoints).forEach(([url, hash]) => {
        console.log(`   ${hash} → ${url}`);
      });
      
    } else if (command === 'list') {
      const mappings = listEndpointMappings();
      if (mappings.length === 0) {
        console.log('📝 No endpoint mappings found');
      } else {
        console.log(`📝 Found ${mappings.length} endpoint mappings:`);
        mappings.forEach((mapping, index) => {
          console.log(`  ${index + 1}. ${mapping.hash} → ${mapping.originalUrl}`);
          console.log(`     Organization: ${mapping.organizationId}`);
          console.log(`     Created: ${mapping.createdAt}`);
          console.log('');
        });
      }
      
    } else if (command === 'test') {
      const endpointHash = process.argv[3];
      if (!endpointHash) {
        console.log('Usage: zk-gateway test <endpointHash>');
        console.log('Example: zk-gateway test a1b2c3d4e5f6g7h8');
        process.exit(1);
      }
      
      console.log('🧪 Testing ZK proof generation...');
      
      // Test proof generation
      const input = {
        secret: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        org_id: 'test-org-123',
        nonce: Math.floor(Math.random() * 1e12).toString()
      };
      
      try {
        const { proof, publicSignals } = await generateProof(input);
        console.log('✅ ZK proof generated successfully');
        console.log(`📊 Proof size: ${JSON.stringify(proof).length} characters`);
        console.log(`📊 Public signals: ${publicSignals.length} items`);
      } catch (error) {
        console.log('❌ ZK proof generation failed:', error);
      }
      
    } else {
      console.log('🔐 ZK Gateway SDK CLI');
      console.log('');
      console.log('Commands:');
      console.log('  init <orgId>                    → Initialize identity for organization');
      console.log('  upload <file> [gatewayUrl]      → Upload endpoints from file');
      console.log('  list                            → List all endpoint mappings');
      console.log('  test <endpointHash>             → Test ZK proof generation');
      console.log('');
      console.log('Examples:');
      console.log('  zk-gateway init my-company-123');
      console.log('  zk-gateway upload endpoints.txt');
      console.log('  zk-gateway list');
      console.log('  zk-gateway test a1b2c3d4e5f6g7h8');
    }
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main(); 
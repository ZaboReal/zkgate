import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { generateIdentity } from '../src/identity';
import { runZkRequest, runZkRequestWithHash } from '../src/request';
import { 
  uploadEndpoints, 
  listEndpointMappings, 
  clearEndpointMappings,
  validateEndpoint,
  generateLocalHash 
} from '../src/endpoints';

export async function generateProof(inputPath: string, wasmPath: string, zkeyPath: string) {
    const witnessPath = "witness.wtns";
    const proofPath = "proof.json";
    const publicPath = "public.json";

    try {
        console.log("⚙️ Generating witness...");
        execSync(`node ${wasmPath}/generate_witness.js ${wasmPath}/access_proof_with_nonce.wasm ${inputPath} ${witnessPath}`, { stdio: 'inherit' });

        console.log("🔐 Generating proof...");
        execSync(`snarkjs groth16 prove ${zkeyPath} ${witnessPath} ${proofPath} ${publicPath}`, { stdio: 'inherit' });

        console.log("✅ Proof and public signals generated:");
        console.log(" -", proofPath);
        console.log(" -", publicPath);
    } catch (err) {
        console.error("❌ Error during proof generation:", err);
    }
}

// Command routing
const command = process.argv[2];

if (command === 'init') {
    const orgId = process.argv[3] || '123';
    generateIdentity(orgId);
} else if (command === 'request') {
    const method = process.argv[3] || 'POST';
    const apiTarget = process.argv[4];
    const payloadJson = process.argv[5];
    if (!apiTarget || !payloadJson) {
        console.log("Usage: ts-node bin/cli.ts request [method] <apiTarget> '<payloadJson>'");
        console.log("Methods: GET, POST, PUT, DELETE, PATCH (default: POST)");
        console.log("Examples:");
        console.log("  ts-node bin/cli.ts request POST http://localhost:3001/v1/access '{\"title\":\"foo\"}'");
        console.log("  ts-node bin/cli.ts request GET http://localhost:3001/v1/access '{\"id\":123}'");
        console.log("  ts-node bin/cli.ts request PUT http://localhost:3001/v1/access '{\"id\":123,\"title\":\"updated\"}'");
        process.exit(1);
    }
    const payload = JSON.parse(payloadJson);
    runZkRequest(apiTarget, payload, method);
} else if (command === 'request-hash') {
    const method = process.argv[3] || 'POST';
    const endpointHash = process.argv[4];
    const payloadJson = process.argv[5];
    if (!endpointHash || !payloadJson) {
        console.log("Usage: ts-node bin/cli.ts request-hash [method] <endpointHash> '<payloadJson>'");
        console.log("Methods: GET, POST, PUT, DELETE, PATCH (default: POST)");
        console.log("Examples:");
        console.log("  ts-node bin/cli.ts request-hash POST a1b2c3d4e5f6g7h8 '{\"title\":\"foo\"}'");
        process.exit(1);
    }
    const payload = JSON.parse(payloadJson);
    runZkRequestWithHash(endpointHash, payload, method);
} else if (command === 'upload-endpoints') {
    const organizationId = process.argv[3];
    const endpointsFile = process.argv[4];
    
    if (!organizationId || !endpointsFile) {
        console.log("Usage: ts-node bin/cli.ts upload-endpoints <organizationId> <endpointsFile>");
        console.log("The endpointsFile should contain one URL per line");
        console.log("Example:");
        console.log("  ts-node bin/cli.ts upload-endpoints my-org-123 endpoints.txt");
        process.exit(1);
    }
    
    try {
        const fs = require('fs');
        const endpoints = fs.readFileSync(endpointsFile, 'utf-8')
            .split('\n')
            .map((line: string) => line.trim())
            .filter((line: string) => line && validateEndpoint(line));
        
        if (endpoints.length === 0) {
            console.log("❌ No valid endpoints found in file");
            process.exit(1);
        }
        
        console.log(`📤 Uploading ${endpoints.length} endpoints for organization: ${organizationId}`);
        uploadEndpoints(endpoints, organizationId).then(() => {
            console.log("✅ Endpoints uploaded successfully");
        }).catch((error) => {
            console.error("❌ Failed to upload endpoints:", error.message);
            process.exit(1);
        });
    } catch (error) {
        console.error("❌ Error reading endpoints file:", error);
        process.exit(1);
    }
} else if (command === 'list-endpoints') {
    const mappings = listEndpointMappings();
    if (mappings.length === 0) {
        console.log("📝 No endpoint mappings found");
    } else {
        console.log(`📝 Found ${mappings.length} endpoint mappings:`);
        mappings.forEach((mapping, index) => {
            console.log(`  ${index + 1}. ${mapping.hash} → ${mapping.originalUrl}`);
            console.log(`     Organization: ${mapping.organizationId || 'N/A'}`);
            console.log(`     Created: ${mapping.createdAt}`);
            console.log("");
        });
    }
} else if (command === 'clear-endpoints') {
    clearEndpointMappings();
    console.log("🗑️ All endpoint mappings cleared");
} else if (command === 'hash-endpoint') {
    const url = process.argv[3];
    const organizationId = process.argv[4];
    
    if (!url) {
        console.log("Usage: ts-node bin/cli.ts hash-endpoint <url> [organizationId]");
        console.log("Example:");
        console.log("  ts-node bin/cli.ts hash-endpoint https://api.example.com/data my-org-123");
        process.exit(1);
    }
    
    if (!validateEndpoint(url)) {
        console.log("❌ Invalid URL format");
        process.exit(1);
    }
    
    const hash = generateLocalHash(url, organizationId);
    console.log(`🔗 Hash for ${url}: ${hash}`);
    if (organizationId) {
        console.log(`   Organization: ${organizationId}`);
    }
} else {
    // fallback to legacy proof generation
    const [input, wasm, zkey] = process.argv.slice(2);
    if (!input || !wasm || !zkey) {
        console.log("Usage:");
        console.log("  ts-node bin/cli.ts init [orgId]                    → Create identity");
        console.log("  ts-node bin/cli.ts request [method] <apiTarget> '<json>' → Generate proof and call API");
        console.log("  ts-node bin/cli.ts request-hash [method] <hash> '<json>' → Generate proof and call API with hash");
        console.log("  ts-node bin/cli.ts upload-endpoints <orgId> <file> → Upload endpoints to gateway");
        console.log("  ts-node bin/cli.ts list-endpoints                  → List all endpoint mappings");
        console.log("  ts-node bin/cli.ts clear-endpoints                 → Clear all endpoint mappings");
        console.log("  ts-node bin/cli.ts hash-endpoint <url> [orgId]     → Generate hash for endpoint");
        console.log("  ts-node bin/cli.ts <input> <wasm> <zkey>          → Manual proof generation");
        process.exit(1);
    }
    generateProof(input, wasm, zkey);
}

import express from 'express';
import { verifyProof } from '../verifier/snark';
import { hasNullifier, addNullifier } from '../utils/nullifiers';
import { appendLog } from '../utils/logs';
import { allowedTargets } from '../config/whitelist';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Load endpoint mappings from local storage
function loadEndpointMappings() {
  const ENDPOINTS_FILE = path.join(__dirname, '../../../endpoints.json');
  if (!fs.existsSync(ENDPOINTS_FILE)) {
    return [];
  }
  
  try {
    const data = fs.readFileSync(ENDPOINTS_FILE, 'utf-8');
    const storage = JSON.parse(data);
    return storage.mappings || [];
  } catch (error) {
    console.warn('⚠️ Failed to load endpoint mappings:', error);
    return [];
  }
}

// Resolve hashed endpoint to original URL
function resolveHashedEndpoint(hash: string): string | null {
  const mappings = loadEndpointMappings();
  const mapping = mappings.find((m: any) => m.hash === hash);
  return mapping?.originalUrl || null;
}

// Handle all HTTP methods
router.all('/', async (req, res) => {
  const { proof, publicSignals, endpointHash, payload, method } = req.body;

  try {
    // Verify ZK proof (this proves the user is authorized)
    const isValid = await verifyProof(proof, publicSignals);
    if (!isValid) return res.status(403).json({ error: 'Invalid proof' });

    // Extract organization ID from public signals (assuming it's at index 1)
    const orgId = publicSignals[1]; // This would be the hashed org ID in a real implementation
    
    // Resolve endpoint URL from hash
    let actualEndpoint: string | null = null;
    
    if (endpointHash) {
      // New hashed endpoint system
      actualEndpoint = resolveHashedEndpoint(endpointHash);
      if (!actualEndpoint) {
        return res.status(403).json({ error: 'Invalid endpoint hash' });
      }
    } else {
      return res.status(400).json({ error: 'Missing endpoint hash' });
    }

    // Check if endpoint is in allowed targets (for demo purposes)
    if (!allowedTargets.includes(actualEndpoint)) {
      return res.status(403).json({ error: 'Endpoint not allowed' });
    }

    const nullifier = publicSignals[0]; // assuming index 0 is nullifier
    if (hasNullifier(nullifier)) {
      return res.status(409).json({ error: 'Replay detected: nullifier already used' });
    }

    addNullifier(nullifier);

    let response;
    
    // Handle localhost targets specially to avoid circular requests
    if (actualEndpoint.includes('localhost')) {
      response = {
        data: {
          success: true,
          message: 'Request processed through ZK Gateway',
          originalPayload: payload,
          nullifier: nullifier,
          timestamp: new Date().toISOString(),
          method: method || req.method,
          endpointHash: endpointHash,
          actualEndpoint: actualEndpoint,
          orgId: orgId // This would be hashed in real implementation
        }
      };
    } else {
      // Make external request for non-localhost targets using the same method
      const config = {
        method: (method || req.method).toLowerCase(),
        url: actualEndpoint,
        data: payload.data,
        params: payload.params,
        headers: payload.headers
      };
      response = await axios(config);
    }

    appendLog({
      timestamp: new Date().toISOString(),
      nullifier,
      apiTarget: actualEndpoint,
      payload,
      method: method || req.method,
      organizationId: orgId, // This would be hashed
      endpointHash: endpointHash
    });

    res.json({ success: true, data: response.data });
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: 'Gateway error', details: err.message });
    } else {
      res.status(500).json({ error: 'Gateway error', details: 'Unknown error' });
    }
  }
});

export default router;

import express from 'express';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Local storage for endpoint mappings (in production, use a database)
const ENDPOINTS_FILE = path.join(__dirname, '../../../endpoints.json');

interface EndpointMapping {
  hash: string;
  originalUrl: string;
  organizationId: string;
  createdAt: string;
}

interface EndpointStorage {
  mappings: EndpointMapping[];
  lastUpdated: string;
}

/**
 * Hash an endpoint URL to create a privacy-preserving identifier
 */
function hashEndpoint(url: string, organizationId: string): string {
  const input = `${url}:${organizationId}`;
  return crypto.createHash('sha256').update(input).digest('hex').substring(0, 16);
}

/**
 * Load endpoint mappings from local storage
 */
function loadEndpointMappings(): EndpointMapping[] {
  if (!fs.existsSync(ENDPOINTS_FILE)) {
    return [];
  }
  
  try {
    const data = fs.readFileSync(ENDPOINTS_FILE, 'utf-8');
    const storage: EndpointStorage = JSON.parse(data);
    return storage.mappings || [];
  } catch (error) {
    console.warn('⚠️ Failed to load endpoint mappings:', error);
    return [];
  }
}

/**
 * Save endpoint mappings to local storage
 */
function saveEndpointMappings(mappings: EndpointMapping[]): void {
  const storage: EndpointStorage = {
    mappings,
    lastUpdated: new Date().toISOString()
  };
  
  fs.writeFileSync(ENDPOINTS_FILE, JSON.stringify(storage, null, 2));
  console.log(`💾 Endpoint mappings saved to ${ENDPOINTS_FILE}`);
}

/**
 * Validate endpoint URL format
 */
function validateEndpoint(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Upload endpoints and get hashed values
router.post('/upload', async (req, res) => {
  try {
    const { organizationId, endpoints } = req.body;
    
    if (!organizationId || !endpoints || !Array.isArray(endpoints)) {
      return res.status(400).json({ 
        error: 'Missing required fields: organizationId and endpoints array' 
      });
    }
    
    // Validate endpoints
    const validEndpoints = endpoints.filter(url => {
      if (!validateEndpoint(url)) {
        console.warn(`⚠️ Invalid endpoint URL: ${url}`);
        return false;
      }
      return true;
    });
    
    if (validEndpoints.length === 0) {
      return res.status(400).json({ 
        error: 'No valid endpoints provided' 
      });
    }
    
    // Load existing mappings
    const existingMappings = loadEndpointMappings();
    
    // Generate hashes for new endpoints
    const hashedEndpoints: Record<string, string> = {};
    const newMappings: EndpointMapping[] = [];
    
    validEndpoints.forEach(url => {
      // Check if endpoint already exists for this organization
      const existing = existingMappings.find(m => 
        m.originalUrl === url && m.organizationId === organizationId
      );
      
      if (existing) {
        // Use existing hash
        hashedEndpoints[url] = existing.hash;
      } else {
        // Generate new hash
        const hash = hashEndpoint(url, organizationId);
        hashedEndpoints[url] = hash;
        
        newMappings.push({
          hash,
          originalUrl: url,
          organizationId,
          createdAt: new Date().toISOString()
        });
      }
    });
    
    // Save new mappings
    if (newMappings.length > 0) {
      const allMappings = [...existingMappings, ...newMappings];
      saveEndpointMappings(allMappings);
    }
    
    console.log(`✅ Endpoints uploaded for organization: ${organizationId}`);
    console.log(`   Valid endpoints: ${validEndpoints.length}`);
    console.log(`   New mappings: ${newMappings.length}`);
    
    res.json({
      success: true,
      organizationId,
      hashedEndpoints,
      stats: {
        total: validEndpoints.length,
        new: newMappings.length,
        existing: validEndpoints.length - newMappings.length
      }
    });
    
  } catch (error) {
    console.error('❌ Endpoint upload error:', error);
    res.status(500).json({ error: 'Failed to upload endpoints' });
  }
});

// Get endpoint mappings for an organization
router.get('/mappings/:organizationId', (req, res) => {
  try {
    const { organizationId } = req.params;
    const mappings = loadEndpointMappings();
    
    const orgMappings = mappings.filter(m => m.organizationId === organizationId);
    
    res.json({
      success: true,
      organizationId,
      mappings: orgMappings,
      count: orgMappings.length
    });
    
  } catch (error) {
    console.error('❌ Error fetching mappings:', error);
    res.status(500).json({ error: 'Failed to fetch mappings' });
  }
});

// Get original URL for a hash (for internal use)
router.get('/resolve/:hash', (req, res) => {
  try {
    const { hash } = req.params;
    const mappings = loadEndpointMappings();
    
    const mapping = mappings.find(m => m.hash === hash);
    
    if (!mapping) {
      return res.status(404).json({ error: 'Hash not found' });
    }
    
    res.json({
      success: true,
      hash,
      originalUrl: mapping.originalUrl,
      organizationId: mapping.organizationId
    });
    
  } catch (error) {
    console.error('❌ Error resolving hash:', error);
    res.status(500).json({ error: 'Failed to resolve hash' });
  }
});

// List all endpoint mappings (for debugging)
router.get('/all', (req, res) => {
  try {
    const mappings = loadEndpointMappings();
    
    res.json({
      success: true,
      mappings,
      count: mappings.length
    });
    
  } catch (error) {
    console.error('❌ Error listing mappings:', error);
    res.status(500).json({ error: 'Failed to list mappings' });
  }
});

// Clear all mappings (for testing)
router.delete('/clear', (req, res) => {
  try {
    if (fs.existsSync(ENDPOINTS_FILE)) {
      fs.unlinkSync(ENDPOINTS_FILE);
    }
    
    console.log('🗑️ All endpoint mappings cleared');
    
    res.json({
      success: true,
      message: 'All mappings cleared'
    });
    
  } catch (error) {
    console.error('❌ Error clearing mappings:', error);
    res.status(500).json({ error: 'Failed to clear mappings' });
  }
});

export default router; 
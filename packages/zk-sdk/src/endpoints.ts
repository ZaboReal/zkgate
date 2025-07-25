import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

export interface EndpointMapping {
  hash: string;
  originalUrl: string;
  createdAt: string;
  organizationId?: string;
}

export interface EndpointStorage {
  mappings: EndpointMapping[];
  lastUpdated: string;
}

const ENDPOINTS_FILE = path.join(process.cwd(), '.endpoints.json');

/**
 * Hash an endpoint URL to create a privacy-preserving identifier
 */
export function hashEndpoint(url: string, organizationId?: string): string {
  const input = organizationId ? `${url}:${organizationId}` : url;
  return crypto.createHash('sha256').update(input).digest('hex').substring(0, 16);
}

/**
 * Upload endpoints to the gateway and get hashed values
 */
export async function uploadEndpoints(
  endpoints: string[], 
  organizationId: string, 
  gatewayUrl: string = 'http://localhost:3001'
): Promise<Record<string, string>> {
  try {
    console.log('📤 Uploading endpoints to gateway...');
    
    const response = await axios.post(`${gatewayUrl}/v1/endpoints/upload`, {
      organizationId,
      endpoints: endpoints.filter(url => url.trim())
    });

    if (response.data.success) {
      console.log('✅ Endpoints uploaded successfully');
      console.log(`   Organization ID: ${organizationId}`);
      console.log(`   Endpoints uploaded: ${endpoints.length}`);
      
      // Save the mappings locally
      const mappings: EndpointMapping[] = endpoints.map(url => ({
        hash: response.data.hashedEndpoints[url],
        originalUrl: url,
        createdAt: new Date().toISOString(),
        organizationId
      }));
      
      saveEndpointMappings(mappings);
      
      return response.data.hashedEndpoints;
    } else {
      throw new Error(response.data.error || 'Upload failed');
    }
  } catch (error) {
    console.error('❌ Failed to upload endpoints:', error);
    throw error;
  }
}

/**
 * Get hashed endpoint for a given URL
 */
export function getHashedEndpoint(url: string, organizationId?: string): string | null {
  const mappings = loadEndpointMappings();
  const mapping = mappings.find(m => 
    m.originalUrl === url && 
    (!organizationId || m.organizationId === organizationId)
  );
  return mapping?.hash || null;
}

/**
 * Get original URL for a given hash
 */
export function getOriginalUrl(hash: string): string | null {
  const mappings = loadEndpointMappings();
  const mapping = mappings.find(m => m.hash === hash);
  return mapping?.originalUrl || null;
}

/**
 * List all endpoint mappings
 */
export function listEndpointMappings(): EndpointMapping[] {
  return loadEndpointMappings();
}

/**
 * Save endpoint mappings to local storage
 */
function saveEndpointMappings(mappings: EndpointMapping[]): void {
  const existing = loadEndpointMappings();
  const combined = [...existing, ...mappings];
  
  const storage: EndpointStorage = {
    mappings: combined,
    lastUpdated: new Date().toISOString()
  };
  
  fs.writeFileSync(ENDPOINTS_FILE, JSON.stringify(storage, null, 2));
  console.log(`💾 Endpoint mappings saved to ${ENDPOINTS_FILE}`);
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
 * Clear all endpoint mappings
 */
export function clearEndpointMappings(): void {
  if (fs.existsSync(ENDPOINTS_FILE)) {
    fs.unlinkSync(ENDPOINTS_FILE);
    console.log('🗑️ Endpoint mappings cleared');
  }
}

/**
 * Validate endpoint URL format
 */
export function validateEndpoint(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Generate endpoint hash locally (without uploading to gateway)
 */
export function generateLocalHash(url: string, organizationId?: string): string {
  return hashEndpoint(url, organizationId);
} 
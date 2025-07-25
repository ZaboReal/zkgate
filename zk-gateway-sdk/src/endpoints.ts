import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { EndpointMapping } from './types';

const ENDPOINTS_FILE = path.join(process.cwd(), '.endpoints.json');

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
        organizationId,
        createdAt: new Date().toISOString()
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

export function getHashedEndpoint(url: string, organizationId?: string): string | null {
  const mappings = loadEndpointMappings();
  const mapping = mappings.find(m => 
    m.originalUrl === url && 
    (!organizationId || m.organizationId === organizationId)
  );
  return mapping?.hash || null;
}

export function listEndpointMappings(): EndpointMapping[] {
  return loadEndpointMappings();
}

function saveEndpointMappings(mappings: EndpointMapping[]): void {
  const existing = loadEndpointMappings();
  const combined = [...existing, ...mappings];
  
  const storage = {
    mappings: combined,
    lastUpdated: new Date().toISOString()
  };
  
  fs.writeFileSync(ENDPOINTS_FILE, JSON.stringify(storage, null, 2));
  console.log(`💾 Endpoint mappings saved to ${ENDPOINTS_FILE}`);
}

function loadEndpointMappings(): EndpointMapping[] {
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
import express from 'express';

const router = express.Router();

// In-memory storage for demo (in production, use a database)
const organizations = new Map();

// Generate random ID
function generateRandomId() {
    return 'ep_' + Math.random().toString(36).substr(2, 9);
}

// Generate gateway token
function generateGatewayToken() {
    return 'gt_' + Math.random().toString(36).substr(2, 12);
}

router.post('/', async (req, res) => {
    try {
        const { organizationId, endpoints, permissions } = req.body;
        
        if (!organizationId || !endpoints || !Array.isArray(endpoints)) {
            return res.status(400).json({ 
                error: 'Missing required fields: organizationId and endpoints array' 
            });
        }
        
        // Generate encrypted endpoint mapping
        const encryptedEndpoints: Record<string, string> = {};
        const endpointIds: string[] = [];
        
        endpoints.forEach(endpoint => {
            if (endpoint && endpoint.trim()) {
                const endpointId = generateRandomId();
                encryptedEndpoints[endpointId] = endpoint.trim();
                endpointIds.push(endpointId);
            }
        });
        
        const gatewayToken = generateGatewayToken();
        
        // Store organization data (in production, use database)
        organizations.set(organizationId, {
            id: organizationId,
            endpoints: encryptedEndpoints,
            permissions: permissions || {},
            gatewayToken: gatewayToken,
            createdAt: new Date().toISOString()
        });
        
        console.log(`✅ Organization registered: ${organizationId}`);
        console.log(`   Endpoints: ${endpoints.length}`);
        console.log(`   Gateway Token: ${gatewayToken}`);
        
        res.json({
            success: true,
            organizationId: organizationId,
            encryptedEndpoints: encryptedEndpoints,
            gatewayToken: gatewayToken,
            circuitConfig: {
                circuitUrl: `${req.protocol}://${req.get('host')}/circuits/access_proof_with_nonce.wasm`,
                provingKeyUrl: `${req.protocol}://${req.get('host')}/circuits/access_proof_with_nonce_final.zkey`
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Get organization by token (for internal use)
export function getOrganizationByToken(token: string) {
    for (const [orgId, org] of organizations.entries()) {
        if (org.gatewayToken === token) {
            return org;
        }
    }
    return null;
}

// Get organization by ID (for debugging)
router.get('/:orgId', (req, res) => {
    const orgId = req.params.orgId;
    const org = organizations.get(orgId);
    
    if (!org) {
        return res.status(404).json({ error: 'Organization not found' });
    }
    
    res.json({
        id: org.id,
        endpoints: org.endpoints,
        gatewayToken: org.gatewayToken,
        createdAt: org.createdAt
    });
});

// List all organizations (for debugging)
router.get('/', (req, res) => {
    const orgList = Array.from(organizations.values()).map(org => ({
        id: org.id,
        endpointCount: Object.keys(org.endpoints).length,
        gatewayToken: org.gatewayToken,
        createdAt: org.createdAt
    }));
    
    res.json(orgList);
});

export default router; 
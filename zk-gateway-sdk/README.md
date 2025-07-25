# 🔐 ZK Gateway SDK

A complete SDK for making privacy-preserving API calls through a ZK Gateway using real snarkjs proofs.

## 🚀 Quick Start

### 1. Install the SDK
```bash
npm install zk-gateway-sdk
```

### 2. Initialize Your Identity
```bash
npx zk-gateway init my-company-123
```

### 3. Upload Your Endpoints
Create a file `endpoints.txt` with your API endpoints:
```
https://api.example.com/users
https://api.example.com/posts
https://api.example.com/comments
```

Upload them:
```bash
npx zk-gateway upload endpoints.txt
```

### 4. Use in Your Code
```javascript
import { ZKGatewayClient } from 'zk-gateway-sdk';

// Create client
const client = new ZKGatewayClient({
  organizationId: 'my-company-123',
  gatewayUrl: 'http://localhost:3001' // Your gateway URL
});

// Initialize
await client.initialize();

// Make requests using endpoint hashes
const response = await client.request('a1b2c3d4e5f6g7h8', {
  method: 'GET'
});

// Or use original URLs (auto-resolves to hash)
const response2 = await client.requestByUrl('https://api.example.com/users', {
  method: 'POST',
  data: { name: 'John' }
});
```

## 📋 Features

- ✅ **Real ZK Proofs** - Uses actual snarkjs circuits
- ✅ **No Tokens** - Pure ZK authentication
- ✅ **Endpoint Privacy** - Real URLs never sent in requests
- ✅ **CLI Tools** - Easy setup and management
- ✅ **TypeScript Support** - Full type safety
- ✅ **Zero Dependencies** - Self-contained

## 🛠️ CLI Commands

### Initialize Identity
```bash
zk-gateway init <organizationId>
```
Creates a cryptographic identity for your organization.

### Upload Endpoints
```bash
zk-gateway upload <endpointsFile> [gatewayUrl]
```
Uploads endpoints and gets hashed values.

### List Mappings
```bash
zk-gateway list
```
Shows all your endpoint mappings.

### Test Proof Generation
```bash
zk-gateway test <endpointHash>
```
Tests ZK proof generation with actual circuits.

## 🔧 API Reference

### ZKGatewayClient

#### Constructor
```javascript
new ZKGatewayClient(config: ZKGatewayConfig)
```

#### Methods

##### `initialize()`
Loads your identity and prepares the client.

##### `request(endpointHash, options)`
Makes a request using an endpoint hash.

##### `requestByUrl(url, options)`
Makes a request using the original URL (auto-resolves to hash).

##### `isReady()`
Checks if the client is initialized.

### Configuration

```typescript
interface ZKGatewayConfig {
  gatewayUrl?: string;        // Default: http://localhost:3001
  organizationId: string;     // Required: Your organization ID
  secret?: string;           // Optional: Auto-loaded from identity
}
```

### Request Options

```typescript
interface ZKRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  data?: any;                // Request body
  params?: any;              // Query parameters
  headers?: Record<string, string>; // Custom headers
}
```

## 🔒 How It Works

### 1. **Setup Phase**
- Generate cryptographic identity
- Upload endpoints to get hashes
- Store mappings locally

### 2. **Request Phase**
- Generate ZK proof proving you know your secret
- Send proof + endpoint hash to gateway
- Gateway verifies proof and forwards to real API
- Return response to your app

### 3. **Privacy Benefits**
- **No tokens** - Pure cryptographic authentication
- **Endpoint privacy** - Real URLs never exposed
- **Zero-knowledge** - Gateway never learns your secrets

## 📁 File Structure

```
zk-gateway-sdk/
├── src/
│   ├── index.ts          # Main exports
│   ├── client.ts         # ZKGatewayClient class
│   ├── identity.ts       # Identity management
│   ├── endpoints.ts      # Endpoint management
│   ├── proofs.ts         # ZK proof generation
│   ├── cli.ts           # CLI tool
│   └── types.ts         # TypeScript types
├── circuits/            # Circuit files (included)
├── package.json
├── tsconfig.json
└── README.md
```

## 🚀 Examples

### Basic Usage
```javascript
import { ZKGatewayClient } from 'zk-gateway-sdk';

const client = new ZKGatewayClient({
  organizationId: 'my-company-123'
});

await client.initialize();

// GET request
const users = await client.request('a1b2c3d4e5f6g7h8', {
  method: 'GET'
});

// POST request
const newUser = await client.request('b2c3d4e5f6g7h8i9', {
  method: 'POST',
  data: { name: 'Alice', email: 'alice@example.com' }
});
```

### Error Handling
```javascript
const response = await client.request('invalid-hash');
if (!response.success) {
  console.error('Request failed:', response.error);
} else {
  console.log('Success:', response.data);
}
```

### Using Original URLs
```javascript
// This automatically resolves to the hash
const response = await client.requestByUrl('https://api.example.com/users', {
  method: 'GET'
});
```

## 🔧 Development

### Building
```bash
npm run build
```

### Development Mode
```bash
npm run dev
```

### Testing
```bash
npm test
```

## 🐛 Troubleshooting

### "Identity not found"
Run: `zk-gateway init <your-org-id>`

### "Circuit files not found"
Make sure the circuit files are in the `circuits/` directory.

### "Endpoint hash not found"
Upload your endpoints first: `zk-gateway upload endpoints.txt`

### "Gateway connection failed"
Check that your gateway is running on the correct URL.

## 📞 Support

For issues and questions:
- Check the troubleshooting section
- Review the examples
- Ensure your gateway is running

## 🔒 Security Notes

- **Real ZK Proofs**: This SDK uses actual snarkjs circuits, not mock proofs
- **No Tokens**: Authentication is purely cryptographic
- **Local Storage**: Identity and mappings stored locally
- **Production Ready**: Suitable for production use with proper gateway setup

---

**This SDK provides complete privacy-preserving API access through real ZK proofs!** 🚀 
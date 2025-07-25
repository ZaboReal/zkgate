# 🔐 ZK SDK - Endpoint Hashing System

This SDK provides a privacy-preserving way to interact with APIs through a ZK Gateway. The new endpoint hashing system allows you to upload your API endpoints and get hashed values that can be used instead of the actual URLs, providing an additional layer of privacy.

## 🚀 Quick Start

### 1. Initialize Identity

```bash
# Create a new identity for your organization
npx ts-node bin/cli.ts init my-company-123
```

### 2. Upload Endpoints

Create a text file with your API endpoints (one per line):

```txt
# endpoints.txt
https://api.example.com/users
https://api.example.com/posts
https://api.example.com/comments
```

Upload them to get hashed values:

```bash
npx ts-node bin/cli.ts upload-endpoints my-company-123 endpoints.txt
```

### 3. Make API Requests

Use the hashed endpoints to make requests:

```bash
# Using hashed endpoint
npx ts-node bin/cli.ts request-hash POST a1b2c3d4e5f6g7h8 '{"title":"Hello World"}'

# Or use original URL (will automatically use hash if available)
npx ts-node bin/cli.ts request POST https://api.example.com/posts '{"title":"Hello World"}'
```

## 📋 Features

### 🔗 Endpoint Hashing
- **Privacy**: Your actual API endpoints are never exposed in requests
- **Consistent**: Same endpoint always generates the same hash for your organization
- **Secure**: Hashes are organization-specific and cannot be reversed

### 🛠️ Management Commands
- **Upload**: Upload multiple endpoints at once
- **List**: View all your endpoint mappings
- **Clear**: Remove all stored mappings
- **Hash**: Generate hash for a single endpoint

### 🔄 Backward Compatibility
- Works with existing endpoint ID system
- Automatic fallback to original URLs if hash not found
- Seamless migration from old to new system

## 📖 Detailed Usage

### Uploading Endpoints

```bash
# Upload from file
npx ts-node bin/cli.ts upload-endpoints <organizationId> <endpointsFile>

# Example
npx ts-node bin/cli.ts upload-endpoints my-org-123 endpoints.txt
```

**Response:**
```json
{
  "success": true,
  "organizationId": "my-org-123",
  "hashedEndpoints": {
    "https://api.example.com/users": "a1b2c3d4e5f6g7h8",
    "https://api.example.com/posts": "b2c3d4e5f6g7h8i9"
  },
  "stats": {
    "total": 2,
    "new": 2,
    "existing": 0
  }
}
```

### Making Requests

```bash
# Using hashed endpoint (recommended)
npx ts-node bin/cli.ts request-hash POST a1b2c3d4e5f6g7h8 '{"title":"New Post"}'

# Using original URL (auto-hash if available)
npx ts-node bin/cli.ts request POST https://api.example.com/posts '{"title":"New Post"}'
```

### Managing Endpoints

```bash
# List all endpoint mappings
npx ts-node bin/cli.ts list-endpoints

# Generate hash for single endpoint
npx ts-node bin/cli.ts hash-endpoint https://api.example.com/data my-org-123

# Clear all mappings
npx ts-node bin/cli.ts clear-endpoints
```

## 🔧 Programmatic Usage

```typescript
import { 
  uploadEndpoints, 
  getHashedEndpoint, 
  runZkRequest,
  runZkRequestWithHash 
} from '@your-org/zk-sdk';

// Upload endpoints
const hashedEndpoints = await uploadEndpoints([
  'https://api.example.com/users',
  'https://api.example.com/posts'
], 'my-org-123');

// Get hash for specific endpoint
const hash = getHashedEndpoint('https://api.example.com/users', 'my-org-123');

// Make request with hash
await runZkRequestWithHash(hash, { title: 'Hello' }, 'POST');

// Or let it auto-resolve
await runZkRequest('https://api.example.com/users', { title: 'Hello' }, 'POST');
```

## 🏗️ Architecture

### How It Works

1. **Upload Phase**: Endpoints are uploaded to the gateway and hashed
2. **Storage**: Mappings are stored both locally and on the gateway
3. **Request Phase**: Client uses hash instead of original URL
4. **Resolution**: Gateway resolves hash back to original URL
5. **Forwarding**: Request is forwarded to the actual API

### Privacy Benefits

- **Endpoint Privacy**: Real URLs are never sent in requests
- **Organization Isolation**: Hashes are unique per organization
- **No Correlation**: Different organizations get different hashes for same URL
- **Local Storage**: Mappings stored locally for offline access

## 🔒 Security Considerations

### Current Implementation
- Uses SHA-256 for hashing (first 16 characters)
- Organization-specific hashing prevents cross-org correlation
- Local storage for endpoint mappings
- Gateway stores mappings in JSON file (demo only)

### Production Recommendations
- Use database for gateway storage
- Implement proper access controls
- Add rate limiting for uploads
- Consider encryption for stored mappings
- Implement audit logging

## 🐛 Troubleshooting

### Common Issues

**"Invalid endpoint hash"**
- Check if endpoint was uploaded for your organization
- Verify organization ID matches
- Try re-uploading the endpoint

**"No valid endpoints found"**
- Check endpoint URL format
- Ensure file contains valid URLs
- Verify file encoding (should be UTF-8)

**"Failed to upload endpoints"**
- Check gateway server is running
- Verify network connectivity
- Check organization ID format

### Debug Commands

```bash
# Check endpoint mappings
npx ts-node bin/cli.ts list-endpoints

# Test hash generation
npx ts-node bin/cli.ts hash-endpoint https://api.example.com/test my-org-123

# Clear and re-upload
npx ts-node bin/cli.ts clear-endpoints
npx ts-node bin/cli.ts upload-endpoints my-org-123 endpoints.txt
```

## 📁 File Structure

```
packages/zk-sdk/
├── src/
│   ├── endpoints.ts      # Endpoint hashing functionality
│   ├── identity.ts       # Identity management
│   ├── request.ts        # Request handling
│   └── index.ts          # Main exports
├── bin/
│   └── cli.ts           # Command-line interface
├── examples/
│   └── endpoints.txt    # Example endpoints file
└── README.md           # This file
```

## 🚀 Next Steps

### For Production
1. **Database Integration**: Replace JSON storage with proper database
2. **Authentication**: Add proper user authentication
3. **Rate Limiting**: Implement upload and request rate limits
4. **Monitoring**: Add comprehensive logging and metrics
5. **Caching**: Implement hash resolution caching

### For Development
1. **SDK Packages**: Create npm packages for different languages
2. **API Documentation**: Generate OpenAPI documentation
3. **Testing**: Add comprehensive test suite
4. **Examples**: Create more usage examples
5. **Tutorials**: Add step-by-step tutorials

## 📞 Support

For issues and questions:
- Check the troubleshooting section above
- Review the example files
- Test with the provided endpoints

This implementation provides a solid foundation for privacy-preserving API access through ZK proofs and endpoint hashing. 
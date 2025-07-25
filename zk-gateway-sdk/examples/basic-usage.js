// Basic usage example for ZK Gateway SDK
const { ZKGatewayClient } = require('../dist');

async function main() {
  try {
    // Create client
    const client = new ZKGatewayClient({
      organizationId: 'my-company-123',
      gatewayUrl: 'http://localhost:3001'
    });

    // Initialize (loads identity)
    await client.initialize();
    console.log('✅ Client initialized');

    // Make a GET request using endpoint hash
    const response = await client.request('a1b2c3d4e5f6g7h8', {
      method: 'GET'
    });

    if (response.success) {
      console.log('✅ Request successful:', response.data);
    } else {
      console.error('❌ Request failed:', response.error);
    }

    // Make a POST request using original URL
    const postResponse = await client.requestByUrl('https://jsonplaceholder.typicode.com/posts', {
      method: 'POST',
      data: {
        title: 'Test Post',
        body: 'This is a test post',
        userId: 1
      }
    });

    if (postResponse.success) {
      console.log('✅ POST request successful:', postResponse.data);
    } else {
      console.error('❌ POST request failed:', postResponse.error);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main(); 
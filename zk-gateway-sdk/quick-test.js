const { ZKGatewayClient } = require('./dist');

const client = new ZKGatewayClient({
  organizationId: 'my-company-123',
  gatewayUrl: 'http://localhost:3001'
});

client.initialize()
  .then(() => client.requestByUrl('https://jsonplaceholder.typicode.com/posts', { method: 'GET' }))
  .then(response => console.log('Response:', JSON.stringify(response, null, 2)))
  .catch(error => console.error('Error:', error));

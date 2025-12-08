const http = require('http');
const fs = require('fs').promises;
const path = require('path');

async function fetchOpenAPISpec() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api-json',
      method: 'GET',
      timeout: 5000,
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

async function generateOpenAPISpec() {
  try {
    console.log('🔄 Fetching OpenAPI specification from running server...');
    console.log('   Make sure the API is running: pnpm dev');
    console.log('');

    const spec = await fetchOpenAPISpec();
    const outputPath = path.join(__dirname, '../openapi.json');

    await fs.writeFile(outputPath, spec);

    console.log('✅ OpenAPI spec generated successfully!');
    console.log(`   Saved to: ${outputPath}`);
    console.log('');
    console.log('💡 Next steps:');
    console.log('   1. Run: pnpm --filter @repo/sdk generate');
    console.log('   2. Or the SDK will auto-update if watching');
  } catch (error) {
    console.error('❌ Failed to fetch OpenAPI spec');
    console.error('');

    if (error.code === 'ECONNREFUSED') {
      console.error('⚠️  API server is not running!');
      console.error('');
      console.error('Please start the API server first:');
      console.error('   cd apps/api && pnpm dev');
      console.error('');
      console.error('Then run this script again:');
      console.error('   pnpm --filter @repo/api generate-openapi');
    } else if (error.message === 'Request timeout') {
      console.error('⚠️  Server did not respond in time');
      console.error('   Is the API server running on port 3000?');
    } else {
      console.error('Error:', error.message);
    }

    console.error('');
    console.error('Alternative: Fetch manually with curl:');
    console.error('   curl http://localhost:3000/api-json > apps/api/openapi.json');

    process.exit(1);
  }
}

generateOpenAPISpec();

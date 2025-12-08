import { createClient } from '@hey-api/openapi-ts';
import { readFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function generate() {
  try {
    console.log('🔄 Generating SDK from OpenAPI spec...');

    const apiOpenapiPath = join(__dirname, '../../../apps/api/openapi.json');

    // Check if openapi.json exists
    try {
      await readFile(apiOpenapiPath, 'utf-8');
    } catch (error) {
      console.warn('⚠️  OpenAPI spec not found at:', apiOpenapiPath);
      console.warn('   Please build the API first: cd apps/api && pnpm build');
      console.warn('   Or run the API server: cd apps/api && pnpm dev');
      console.warn('   Then manually fetch: curl http://localhost:3000/api-json > apps/api/openapi.json');

      // Create a minimal index.ts so the package can still be built
      const srcDir = join(__dirname, '../src');
      await mkdir(srcDir, { recursive: true });
      const indexPath = join(srcDir, 'index.ts');
      const minimalContent = `// SDK not yet generated\n// Run: pnpm --filter @repo/sdk generate\nexport {};\n`;

      const { writeFile } = await import('fs/promises');
      await writeFile(indexPath, minimalContent);
      console.log('   Created minimal index.ts placeholder');
      return;
    }

    // Generate the client
    const outputPath = join(__dirname, '../src/generated');

    await createClient({
      input: apiOpenapiPath,
      output: outputPath,
      client: 'fetch',
    });

    // Create index.ts that re-exports everything
    const indexContent = `// Auto-generated SDK
export * from './generated/index.js';
`;

    const { writeFile } = await import('fs/promises');
    await writeFile(join(__dirname, '../src/index.ts'), indexContent);

    console.log('✅ SDK generated successfully!');
  } catch (error) {
    console.error('❌ Error generating SDK:', error);
    process.exit(1);
  }
}

generate();

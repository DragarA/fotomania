import chokidar from 'chokidar';
import { exec } from 'child_process';
import { promisify } from 'util';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { access } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const execAsync = promisify(exec);

const openapiPath = join(__dirname, '../../apps/api/openapi.json');

console.log('👀 Watching for OpenAPI spec changes...');
console.log('   Watching:', openapiPath);
console.log('');

// Check if openapi.json exists
try {
  await access(openapiPath);
  console.log('✅ OpenAPI spec found');
} catch {
  console.log('⚠️  OpenAPI spec not found yet');
  console.log('');
  console.log('To generate it:');
  console.log('  1. Start the API: pnpm --filter @repo/api dev');
  console.log('  2. Then run: pnpm --filter @repo/api generate-openapi');
  console.log('');
  console.log('The SDK will auto-generate once the spec is available.');
}

console.log('');

const watcher = chokidar.watch(openapiPath, {
  persistent: true,
  ignoreInitial: true,
  awaitWriteFinish: {
    stabilityThreshold: 500,
    pollInterval: 100,
  },
});

let isGenerating = false;

watcher.on('change', async (path) => {
  if (isGenerating) return;

  try {
    isGenerating = true;
    console.log('\n🔄 OpenAPI spec changed, regenerating SDK...');
    await execAsync('node scripts/generate.js', {
      cwd: join(__dirname, '..'),
    });
    console.log('✅ SDK regenerated!\n');
  } catch (error) {
    console.error('❌ Error regenerating SDK:', error.message);
  } finally {
    isGenerating = false;
  }
});

watcher.on('add', async (path) => {
  if (isGenerating) return;

  try {
    isGenerating = true;
    console.log('\n🎉 OpenAPI spec found, generating SDK...');
    await execAsync('node scripts/generate.js', {
      cwd: join(__dirname, '..'),
    });
    console.log('✅ SDK generated!\n');
  } catch (error) {
    console.error('❌ Error generating SDK:', error.message);
  } finally {
    isGenerating = false;
  }
});

console.log('✅ Watcher started. Press Ctrl+C to stop.\n');

/**
 * Test setup file
 * Runs before all tests
 */

// Polyfill crypto for Node < 19
import { webcrypto } from 'crypto';

if (!globalThis.crypto) {
  (globalThis as any).crypto = webcrypto;
}

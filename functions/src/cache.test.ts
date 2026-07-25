import { sha256, makeCachePaths } from './cache';

// These values lock the cache hashing/path behavior. If they change, existing
// cached AVRO files in Cloud Storage are silently invalidated. Do NOT update
// these constants to make a refactor pass -- a change here means the cache
// break salt or hashing/path templates changed.
const LOCKED_HASH =
  '36d63bb68eee413c6de7376f7f45697adc79abbf01d005f229ed596583119825';
const LOCKED_HASH8 = '36d63bb6';

describe('cache hashing stability', () => {
  it('sha256 produces the locked hash for a known query', () => {
    expect(sha256('SELECT 1')).toBe(LOCKED_HASH);
  });

  it('makeCachePaths produces the locked cache file path and public url', () => {
    const paths = makeCachePaths('17001', 'bigsheet', 'SELECT 1');

    expect(paths.cacheFilePath).toBe(
      `cache/scratch/17001/bigsheet/${LOCKED_HASH8}__000000000000.avro`);
    expect(paths.publicUrl).toBe(
      'https://storage.googleapis.com/sps-by-the-numbers-public/' +
        `cache/scratch/17001/bigsheet/${LOCKED_HASH8}__000000000000.avro`);
  });
});

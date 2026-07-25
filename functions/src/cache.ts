import { Storage } from '@google-cloud/storage';
import crypto from 'node:crypto';

const CACHE_BUCKET = "sps-by-the-numbers-public";

export const EXPORT_FORMAT = 'AVRO';
export const EXPORT_COMPRESSION = 'DEFLATE';
const EXPORT_FORMAT_EXTENSION = 'avro';
const EXPORT_EXTRA_OPTIONS = ',use_avro_logical_types=True';

const storageClient = new Storage();

// Change this to force cache invalidaiton of results for queries.
const CACHE_BREAK_SALT = '2026-05-01';

export function sha256(str) {
  return crypto.createHash('sha256').update(str + CACHE_BREAK_SALT).digest('hex');
}

export function makeCachePaths(ccddd, dataset, query) {
  const hash = sha256(query);

  const bucket = CACHE_BUCKET;
  const relativePathRoot = `cache/scratch/${ccddd}/${dataset}/${hash.substr(0, 8)}_`;
  const gsUrlRoot = `gs://${bucket}`;
  const exportWildcardPath = `${relativePathRoot}_*.${EXPORT_FORMAT_EXTENSION}`;
  const publicUrlRoot = `https://storage.googleapis.com/${bucket}`;

  // Assume there is only 1 file output from the dump.
  const cacheFilePath = `${relativePathRoot}_000000000000.${EXPORT_FORMAT_EXTENSION}`;

  const publicUrl = `${publicUrlRoot}/${cacheFilePath}`;
  const gsExportPath = `${gsUrlRoot}/${exportWildcardPath}`;

  return {
    bucket,
    cacheFilePath,
    publicUrl,
    gsExportPath
  };
}

export function prefixWithExport(path, query) {
  return `
    EXPORT DATA OPTIONS(
    uri='${path}',
    format='${EXPORT_FORMAT}',
    compression='${EXPORT_COMPRESSION}',
    overwrite=true
    ${EXPORT_EXTRA_OPTIONS}
    ) AS
    ${query}
    LIMIT 999999999999 -- Force to one worker to create 1 file.
  `;
}

export async function cacheExists(cachePaths) {
   const [exists] = await storageClient.bucket(cachePaths.bucket).file(cachePaths.cacheFilePath).exists();
   return exists;
}

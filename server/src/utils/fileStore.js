import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { collectionMutex } from './mutex.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Target data directory: defaults to /server/data
const DATA_DIR = process.env.DATA_DIR 
  ? path.resolve(process.cwd(), process.env.DATA_DIR)
  : path.resolve(__dirname, '../../data');

// In-memory cache for fast, synchronous reads and state synchronization
const memoryCache = new Map();

/**
 * Resolves the absolute path for a collection's JSON file.
 * @param {string} collection
 * @returns {string}
 */
function getCollectionPath(collection) {
  const sanitized = path.basename(collection, '.json');
  return path.join(DATA_DIR, `${sanitized}.json`);
}

/**
 * Ensures the data directory exists.
 */
async function ensureDataDir() {
  await fs.promises.mkdir(DATA_DIR, { recursive: true });
}

/**
 * Reads all records from a collection.
 * Uses in-memory cache if available; loads from disk otherwise.
 * @param {string} collection
 * @returns {Promise<Array<any>>}
 */
export async function read(collection) {
  if (memoryCache.has(collection)) {
    // Return deep copy to prevent in-place mutations bypassing repository layer
    return JSON.parse(JSON.stringify(memoryCache.get(collection)));
  }

  return collectionMutex.runExclusive(collection, async () => {
    // Double check cache inside lock
    if (memoryCache.has(collection)) {
      return JSON.parse(JSON.stringify(memoryCache.get(collection)));
    }

    await ensureDataDir();
    const filePath = getCollectionPath(collection);

    if (!fs.existsSync(filePath)) {
      memoryCache.set(collection, []);
      return [];
    }

    try {
      const content = await fs.promises.readFile(filePath, 'utf-8');
      const parsed = content.trim() ? JSON.parse(content) : [];
      memoryCache.set(collection, parsed);
      return JSON.parse(JSON.stringify(parsed));
    } catch (err) {
      console.error(`[fileStore] Error reading collection ${collection}:`, err);
      throw err;
    }
  });
}

/**
 * Writes data array to disk atomically and updates in-memory cache.
 * Atomic write technique: write to .tmp file, then fs.rename.
 * @param {string} collection
 * @param {Array<any>} data
 * @returns {Promise<Array<any>>}
 */
export async function write(collection, data) {
  return collectionMutex.runExclusive(collection, async () => {
    await ensureDataDir();
    const filePath = getCollectionPath(collection);
    const tempPath = `${filePath}.tmp.${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const serialized = JSON.stringify(data, null, 2);

    try {
      // 1. Write to temporary file
      await fs.promises.writeFile(tempPath, serialized, 'utf-8');
      // 2. Atomically rename temporary file over target file
      await fs.promises.rename(tempPath, filePath);
      // 3. Update memory cache
      memoryCache.set(collection, JSON.parse(serialized));
      return JSON.parse(serialized);
    } catch (err) {
      // Clean up orphaned temp file if exists
      if (fs.existsSync(tempPath)) {
        try {
          await fs.promises.unlink(tempPath);
        } catch (_) {}
      }
      console.error(`[fileStore] Atomic write failed for collection ${collection}:`, err);
      throw err;
    }
  });
}

/**
 * Finds a single item by its ID.
 * @param {string} collection
 * @param {string|number} id
 * @returns {Promise<any|null>}
 */
export async function findById(collection, id) {
  const records = await read(collection);
  const found = records.find((item) => String(item.id) === String(id));
  return found ? JSON.parse(JSON.stringify(found)) : null;
}

/**
 * Finds records matching a predicate function or filter object.
 * @param {string} collection
 * @param {Function|Object} predicateOrQuery
 * @returns {Promise<Array<any>>}
 */
export async function findWhere(collection, predicateOrQuery) {
  const records = await read(collection);
  if (typeof predicateOrQuery === 'function') {
    return records.filter(predicateOrQuery);
  }
  if (typeof predicateOrQuery === 'object' && predicateOrQuery !== null) {
    return records.filter((item) => {
      return Object.entries(predicateOrQuery).every(([key, val]) => item[key] === val);
    });
  }
  return records;
}

/**
 * Inserts a new record into the collection.
 * Automatically ensures an id and timestamp if not provided.
 * @param {string} collection
 * @param {Object} item
 * @returns {Promise<Object>}
 */
export async function insert(collection, item) {
  return collectionMutex.runExclusive(collection, async () => {
    // Read current raw records from cache/disk
    await ensureDataDir();
    const filePath = getCollectionPath(collection);
    let records = [];

    if (memoryCache.has(collection)) {
      records = memoryCache.get(collection);
    } else if (fs.existsSync(filePath)) {
      const content = await fs.promises.readFile(filePath, 'utf-8');
      records = content.trim() ? JSON.parse(content) : [];
    }

    const newItem = {
      id: item.id || `rec_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      campusId: item.campusId || process.env.CAMPUS_ID || 'apex-campus-main',
      createdAt: item.createdAt || new Date().toISOString(),
      ...item,
    };

    const updated = [...records, newItem];

    // Atomic write
    const tempPath = `${filePath}.tmp.${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    await fs.promises.writeFile(tempPath, JSON.stringify(updated, null, 2), 'utf-8');
    await fs.promises.rename(tempPath, filePath);

    memoryCache.set(collection, updated);
    return JSON.parse(JSON.stringify(newItem));
  });
}

/**
 * Updates an existing record by ID.
 * @param {string} collection
 * @param {string|number} id
 * @param {Object} partialOrNewData
 * @returns {Promise<Object|null>}
 */
export async function update(collection, id, partialOrNewData) {
  return collectionMutex.runExclusive(collection, async () => {
    await ensureDataDir();
    const filePath = getCollectionPath(collection);
    let records = [];

    if (memoryCache.has(collection)) {
      records = memoryCache.get(collection);
    } else if (fs.existsSync(filePath)) {
      const content = await fs.promises.readFile(filePath, 'utf-8');
      records = content.trim() ? JSON.parse(content) : [];
    }

    const index = records.findIndex((item) => String(item.id) === String(id));
    if (index === -1) {
      return null;
    }

    const current = records[index];
    const updatedItem = {
      ...current,
      ...partialOrNewData,
      id: current.id, // preserve id
      campusId: partialOrNewData.campusId || current.campusId,
      updatedAt: new Date().toISOString(),
    };

    records[index] = updatedItem;

    const tempPath = `${filePath}.tmp.${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    await fs.promises.writeFile(tempPath, JSON.stringify(records, null, 2), 'utf-8');
    await fs.promises.rename(tempPath, filePath);

    memoryCache.set(collection, records);
    return JSON.parse(JSON.stringify(updatedItem));
  });
}

/**
 * Removes a record by ID.
 * @param {string} collection
 * @param {string|number} id
 * @returns {Promise<boolean>}
 */
export async function remove(collection, id) {
  return collectionMutex.runExclusive(collection, async () => {
    await ensureDataDir();
    const filePath = getCollectionPath(collection);
    let records = [];

    if (memoryCache.has(collection)) {
      records = memoryCache.get(collection);
    } else if (fs.existsSync(filePath)) {
      const content = await fs.promises.readFile(filePath, 'utf-8');
      records = content.trim() ? JSON.parse(content) : [];
    }

    const initialLength = records.length;
    records = records.filter((item) => String(item.id) !== String(id));

    if (records.length === initialLength) {
      return false; // nothing removed
    }

    const tempPath = `${filePath}.tmp.${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    await fs.promises.writeFile(tempPath, JSON.stringify(records, null, 2), 'utf-8');
    await fs.promises.rename(tempPath, filePath);

    memoryCache.set(collection, records);
    return true;
  });
}

/**
 * Clears the in-memory cache for a collection or all collections.
 * @param {string} [collection]
 */
export function clearCache(collection) {
  if (collection) {
    memoryCache.delete(collection);
  } else {
    memoryCache.clear();
  }
}

export default {
  read,
  write,
  findById,
  findWhere,
  insert,
  update,
  remove,
  clearCache,
};

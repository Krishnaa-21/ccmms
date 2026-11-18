/**
 * Async Keyed Mutex
 * Ensures sequential atomic file operations per collection name
 * to prevent race conditions during concurrent write operations.
 */
class KeyedMutex {
  constructor() {
    this.queues = new Map();
  }

  /**
   * Acquire a lock for a specific resource key.
   * Runs the provided async fn exclusively for this key.
   * @param {string} key
   * @param {() => Promise<any>} fn
   * @returns {Promise<any>}
   */
  async runExclusive(key, fn) {
    const previousPromise = this.queues.get(key) || Promise.resolve();

    let release;
    const currentPromise = new Promise((resolve) => {
      release = resolve;
    });

    // Append to the queue
    this.queues.set(key, previousPromise.then(() => currentPromise));

    try {
      await previousPromise;
      return await fn();
    } finally {
      release();
      // Clean up queue memory if this was the last pending task
      if (this.queues.get(key) === currentPromise) {
        this.queues.delete(key);
      }
    }
  }
}

export const collectionMutex = new KeyedMutex();

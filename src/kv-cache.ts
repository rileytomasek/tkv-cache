import type Keyv from 'keyv';
import hashObject from 'hash-obj';

export type KeyType = string | Record<string, any>;

/**
 * A simple wrapper around Keyv to support non-string keys.
 */
export class KvCache<Key extends KeyType, Val extends any = any> {
  constructor(
    public readonly keyv: Keyv<Val>,
    public readonly normalizeKey: (params: Key) => Partial<Key> = (params) =>
      params,
    public readonly errorHandler: (error: unknown) => void = console.error
  ) {}

  /** Get the string key for the given params. */
  private getStringKey(key: Key): string {
    const normalizedKey = this.normalizeKey(key);
    if (typeof normalizedKey === 'string') {
      return normalizedKey;
    } else {
      // Order the keys and hash the object to get a consistent key.
      return hashObject(normalizedKey);
    }
  }

  /** Get an entry from the cache. */
  async get(key: Key): Promise<Val | null> {
    try {
      const stringKey = this.getStringKey(key);
      const result = await this.keyv.get(stringKey);
      return result || null;
    } catch (error) {
      this.errorHandler(error);
      return null;
    }
  }

  /** Add an entry to the cache. TTL is in milliseconds. */
  async set(key: Key, val: Val, ttl?: number): Promise<boolean> {
    try {
      const stringKey = this.getStringKey(key);
      return this.keyv.set(stringKey, val, ttl);
    } catch (error) {
      this.errorHandler(error);
      return false;
    }
  }

  /**
   * Delete an entry from the cache.
   * Returns true if the key was deleted, false if it did not exist and null if
   * there was an error.
   */
  async delete(key: Key): Promise<boolean> {
    try {
      const stringKey = this.getStringKey(key);
      return this.keyv.delete(stringKey);
    } catch (error) {
      this.errorHandler(error);
      return false;
    }
  }

  /** Delete all entries in the namespace. */
  async deleteAll(): Promise<void> {
    try {
      await this.keyv.clear();
    } catch (error) {
      this.errorHandler(error);
    }
  }
}

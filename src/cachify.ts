import type Keyv from 'keyv';
import { KvCache } from './kv-cache.js';

// Define helper types to extract value and parameters types
type ReturnTypeOf<T extends (...args: any) => any> = T extends (
  ...args: any
) => infer R
  ? R
  : any;
type ParamsType<T extends (...args: any) => any> = T extends (
  ...args: infer P
) => any
  ? P
  : never;

/**
 * Wrap a function with a KeyvCache instance.
 * Note: The first parameter of the function must be the key.
 */
export function cachify<
  K extends Keyv<any>,
  T extends (...args: any[]) => Promise<any>
>(
  /** The Keyv instance used for caching. */
  keyv: K,
  /** The function to cache the results of. */
  fn: T,
  /** Normalize the key before caching. */
  normalizeKey?: (key: ParamsType<T>[0]) => Partial<ParamsType<T>[0]>
): (
  ...args: ParamsType<T>
) => Promise<ReturnTypeOf<T> extends Promise<infer U> ? U : any> {
  const cache = new KvCache(keyv, normalizeKey);
  return async (...args: ParamsType<T>) => {
    const key = args[0];
    const cached = await cache.get(key);
    if (cached) {
      return cached;
    } else {
      const result = await fn(...args);
      await cache.set(key, result);
      return result;
    }
  };
}

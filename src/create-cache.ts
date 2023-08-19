import Keyv from 'keyv';
import type { KeyType } from './kv-cache.js';
import { KvCache } from './kv-cache.js';

export function createKvCache<Key extends KeyType, Val extends any = any>(
  keyvOpts: Keyv.Options<Val>,
  normalizeKey?: KvCache<Key, Val>['normalizeKey'],
  errorHandler?: KvCache<Key, Val>['errorHandler']
): KvCache<Key, Val> {
  return new KvCache(new Keyv(keyvOpts), normalizeKey, errorHandler);
}

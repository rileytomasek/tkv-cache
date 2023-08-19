# TypeScript KvCache

[![Build Status](https://github.com/rileytomasek/kvcache/actions/workflows/main.yml/badge.svg)](https://github.com/rileytomasek/kvcache/actions/workflows/main.yml) [![npm version](https://img.shields.io/npm/v/tkv-cache.svg?color=0c0)](https://www.npmjs.com/package/tkv-cache)

Minimal [Keyv](https://github.com/jaredwray/keyv) powered caching helper with added support for:

- Objects as keys with key ordering and hashing
- Function to normalize keys to optimize cache hit rate
- Helper function for wrapping functions with caching
- Strongly typed set/get with generic types

All storage is handled by the Keyv instance passed, so you can use the in-memory default, or any of the [storage adapters](https://github.com/jaredwray/keyv#storage-adapters).

## Usage

### Install

Install `tkv-cache` with your favorite package manager: npm, yarn, pnpm, etc.

You also need to install `keyv` and any adapters like `@keyv/redis`.

### KvCache

The `KvCache` class wraps `Keyv` with support for object keys and key normalization.

```ts
import Keyv from 'keyv';
import { KvCache } from 'tkv-cache';

// Simple usage
const cache = new KvCache<string, string>(new Keyv());
await cache.set('key', 'value');
const val = await cache.get('key'); // val is: string | null

// Object as the key
type ObjKey = { name: string };
const cache2 = new KvCache<ObjKey, string>(new Keyv());
await cache2.set({ name: 'key1' }, 'value');
const val2 = await cache2.get({ name: 'key1' }); // val2 is: string | null

// With a custom normalizeKey function
const cache3 = new KvCache<string, string>(
  new Keyv(),
  (key) => key.toUpperCase()
);
await cache3.set('key', 'value');
const val3 = await cache3.get('KEY'); // val3 is: string | null
console.log(val3); // 'value' because keys were normalized to 'KEY'
```

### Easy KvCache Creation

You can create a `KVCache` instance using the `createKvCache()` function by
passing in a Keyv options object.

```ts
const cache = createKvCache<string, string>({
  ttl: 1000,
});
await cache.set('key', 'value');
const val = await cache.get('key');
type verify = Expect<Equal<typeof val, string | null>>;
assert.equal(val, 'value');
```

### Cachify

The `cachify` function wraps a function with a `KvCache` and optional key normalization function.

```ts
import Keyv from 'keyv';
import { cachify } from 'tkv-cache';

// The function to cache. Something slow/expensive like an OpenAI API call.
const func = (key: string) => Promise.resolve(`value for ${key}`);

// The cached function
const cachedFunc = cachify({}, func);

const response = await cachedFunc('key1'); // API call
const response2 = await cachedFunc('key1'); // Cache hit
const response3 = await cachedFunc('key2'); // API call

// Use key normalization to avoid cache misses
const cachedFunc2 = cachify(new Keyv(), func, (key) => key.toUpperCase());

const res = await cachedFunc('key1'); // API call
const res2 = await cachedFunc('key1'); // Cache hit
const res3 = await cachedFunc('KEY1'); // Cache hit (key normalization)
const res4 = await cachedFunc('Key1'); // Cache hit (key normalization)
const res5 = await cachedFunc('key2'); // API call
```

### Error Handling

`KvCache` defaults to handling errors by calling `console.error` to prevent caching from breaking execution. You can pass a custom error handler to the `KvCache` constructor if you want to change the behavior.

### Examples

See the [`KvCache` tests](/test/kv-cache.test.ts) and [`cachify` tests](/test/cachify.test.ts) for more example usage.

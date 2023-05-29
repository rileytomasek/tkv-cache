/* eslint-disable @typescript-eslint/no-unused-vars */

import type { Expect, Equal } from './types.js';
import assert from 'assert/strict';
import { describe, it } from 'node:test';
import Keyv from 'keyv';
import { KvCache } from '../src/index.js';

describe('KVCache', () => {
  describe('with string key', () => {
    it('and string value', async () => {
      const cache = new KvCache<string, string>(new Keyv());
      await cache.set('key', 'value');
      const val = await cache.get('key');
      type verify = Expect<Equal<typeof val, string | null>>;
      assert.equal(val, 'value');
    });
    it('and number value', async () => {
      const cache = new KvCache<string, number>(new Keyv());
      await cache.set('key', 1);
      const val = await cache.get('key');
      type verify = Expect<Equal<typeof val, number | null>>;
      assert.equal(val, 1);
    });
    it('and object value', async () => {
      const cache = new KvCache<string, { val: string }>(new Keyv());
      await cache.set('key', { val: 'value' });
      const val = await cache.get('key');
      type verify = Expect<Equal<typeof val, { val: string } | null>>;
      assert.deepEqual(val, { val: 'value' });
    });
  });

  describe('with object key', () => {
    it('and string value', async () => {
      const cache = new KvCache<{ name: string }, string>(new Keyv());
      await cache.set({ name: 'key1' }, 'value');
      const val = await cache.get({ name: 'key1' });
      type verify = Expect<Equal<typeof val, string | null>>;
      assert.equal(val, 'value');
    });
    it('and number value', async () => {
      const cache = new KvCache<{ name: string }, number>(new Keyv());
      await cache.set({ name: 'key1' }, 1);
      const val = await cache.get({ name: 'key1' });
      type verify = Expect<Equal<typeof val, number | null>>;
      assert.equal(val, 1);
    });
    it('and object value', async () => {
      const cache = new KvCache<{ name: string }, { val: string }>(new Keyv());
      await cache.set({ name: 'key1' }, { val: 'value' });
      const val = await cache.get({ name: 'key1' });
      type verify = Expect<Equal<typeof val, { val: string } | null>>;
      assert.deepEqual(val, { val: 'value' });
    });
  });
});

describe('Normalize key', () => {
  it('with string key', async () => {
    const cache = new KvCache<string, string>(new Keyv(), (key) =>
      key.toUpperCase()
    );
    await cache.set('key', 'value');
    const val = await cache.get('KEY');
    assert.equal(val, 'value');
  });
  it('with object key', async () => {
    const cache = new KvCache<{ name: string; rand: number }, string>(
      new Keyv(),
      ({ name }) => ({ name })
    );
    await cache.set({ name: 'key', rand: 10 }, 'value');
    const val = await cache.get({ name: 'key', rand: 20 });
    assert.equal(val, 'value');
  });
});

describe('Delete', () => {
  it('single value', async () => {
    const cache = new KvCache<string, string>(new Keyv());
    await cache.set('key', 'value');
    await cache.set('key2', 'value2');
    await cache.delete('key');
    const val = await cache.get('key');
    const val2 = await cache.get('key2');
    assert.equal(val, null);
    assert.equal(val2, 'value2');
  });
  it('all values', async () => {
    const cache = new KvCache<string, string>(new Keyv());
    await cache.set('key', 'value');
    await cache.set('key2', 'value2');
    await cache.deleteAll();
    const val = await cache.get('key');
    const val2 = await cache.get('key2');
    assert.equal(val, null);
    assert.equal(val2, null);
  });
});

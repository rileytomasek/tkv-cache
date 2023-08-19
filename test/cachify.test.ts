/* eslint-disable @typescript-eslint/no-unused-vars */

import type { Expect, Equal } from './types.js';
import assert from 'assert/strict';
import { describe, it, beforeEach } from 'node:test';
import { cachify } from '../src/index.js';

/**
 * These tests use the fact that set() isn't called for a cache hit instead
 * of changing the mock implementation.
 */

describe('cachify', () => {
  describe('with string key', () => {
    it('and string value', async (t) => {
      const func = (key: string) => Promise.resolve(`value for ${key}`);
      const funcMock = t.mock.fn(func);
      const cachedFunc = cachify({}, funcMock);

      // First call
      const val = await cachedFunc('key1');
      type verify = Expect<Equal<typeof val, string>>;
      assert.equal(val, 'value for key1');
      assert.equal(funcMock.mock.calls.length, 1);

      // Cached call
      const val2 = await cachedFunc('key1');
      assert.equal(val2, 'value for key1');
      assert.equal(funcMock.mock.calls.length, 1);

      // Different key
      const val3 = await cachedFunc('key2');
      assert.equal(val3, 'value for key2');
      assert.equal(funcMock.mock.calls.length, 2);
    });
    it('and normalized key', async (t) => {
      const func = (key: string) => Promise.resolve(`value for ${key}`);
      const funcMock = t.mock.fn(func);
      const normalizeKey = (key: string) => key.toUpperCase();
      const cachedFunc = cachify({}, funcMock, normalizeKey);

      // First call
      const val = await cachedFunc('key1');
      assert.equal(val, 'value for key1');
      assert.equal(funcMock.mock.calls.length, 1);

      // Cached call
      const val2 = await cachedFunc('KEY1');
      assert.equal(val2, 'value for key1');
      assert.equal(funcMock.mock.calls.length, 1);

      // Different key
      const val3 = await cachedFunc('key2');
      assert.equal(val3, 'value for key2');
      assert.equal(funcMock.mock.calls.length, 2);
    });
  });

  describe('with object key', () => {
    it('and string value', async (t) => {
      const func = (key: { key: string }) => Promise.resolve(key.key);
      const funcMock = t.mock.fn(func);
      const cachedFunc = cachify({}, funcMock);

      // First call
      const val = await cachedFunc({ key: 'key1' });
      type verify = Expect<Equal<typeof val, string>>;
      assert.equal(val, 'key1');
      assert.equal(funcMock.mock.calls.length, 1);

      // Cached call
      const val2 = await cachedFunc({ key: 'key1' });
      assert.equal(val2, 'key1');
      assert.equal(funcMock.mock.calls.length, 1);

      // Different key
      const val3 = await cachedFunc({ key: 'key2' });
      assert.equal(val3, 'key2');
      assert.equal(funcMock.mock.calls.length, 2);
    });

    it('and normalized key', async (t) => {
      const func = (key: { key: string; rand: number }) =>
        Promise.resolve(key.key);
      const funcMock = t.mock.fn(func);
      const normalizeKey = (args: { key: string; rand: number }) => ({
        key: args.key,
      });
      const cachedFunc = cachify({}, funcMock, normalizeKey);

      // First call
      const val = await cachedFunc({ key: 'key1', rand: 1 });
      type verify = Expect<Equal<typeof val, string>>;
      assert.equal(val, 'key1');
      assert.equal(funcMock.mock.calls.length, 1);

      // Cached call because rand is ignored
      const val2 = await cachedFunc({ key: 'key1', rand: 2 });
      type verify2 = Expect<Equal<typeof val2, string>>;
      assert.equal(val2, 'key1');
      assert.equal(funcMock.mock.calls.length, 1);
    });
  });

  describe('type checks', () => {
    it('string + string', async () => {
      const func = (key: string) => Promise.resolve(key);
      const cachedFunc = cachify({}, func);
      const val = await cachedFunc('key');
      type verify = Expect<Equal<typeof val, string>>;
      assert.equal(val, 'key');
    });
    it('string + number', async () => {
      const func = (_key: string) => Promise.resolve(3);
      const cachedFunc = cachify({}, func);
      const val = await cachedFunc('key');
      type verify = Expect<Equal<typeof val, number>>;
      assert.equal(val, 3);
    });
    it('string + object', async () => {
      const func = (key: string) => Promise.resolve({ key });
      const cachedFunc = cachify({}, func);
      const val = await cachedFunc('key');
      type verify = Expect<Equal<typeof val, { key: string }>>;
      assert.deepEqual(val, { key: 'key' });
    });
    it('object + string', async () => {
      const func = (key: { key: string }) => Promise.resolve(key.key);
      const cachedFunc = cachify({}, func);
      const val = await cachedFunc({ key: 'key' });
      type verify = Expect<Equal<typeof val, string>>;
      assert.equal(val, 'key');
    });
    it('object + number', async () => {
      const func = (_key: { key: string }) => Promise.resolve(42);
      const cachedFunc = cachify({}, func);
      const val = await cachedFunc({ key: 'key' });
      type verify = Expect<Equal<typeof val, number>>;
      assert.equal(val, 42);
    });
    it('object + object', async () => {
      const func = (key: { key: string }) => Promise.resolve(key);
      const cachedFunc = cachify({}, func);
      const val = await cachedFunc({ key: 'key' });
      type verify = Expect<Equal<typeof val, { key: string }>>;
      assert.deepEqual(val, { key: 'key' });
    });
  });
});

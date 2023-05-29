// Ensure inferred generic types are correct. Thanks Matt!
// https://github.com/total-typescript/zod-tutorial/blob/main/src/helpers/type-utils.ts
export type Expect<T extends true> = T;
export type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends <
  T
>() => T extends Y ? 1 : 2
  ? true
  : false;

type Equals<X, Y, A = X, B = never> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y
  ? 1
  : 2
  ? A
  : B;

export type WritableKeys<T> = NonNullable<{
  [P in keyof T]-?: Equals<{ [Q in P]: T[P] }, { -readonly [Q in P]: T[P] }, P>;
}>[keyof T];

export type PickWritable<T> = Pick<T, WritableKeys<T>>;

export type PickReadonly<T> = Omit<T, WritableKeys<T>>;

export function defineContext<T>(initialValue: T): AbstractContext<T> {
  return { id: Symbol(), initialValue };
}

export type AbstractContext<T> = {
  id: any;
  initialValue: T;
};

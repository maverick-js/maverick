import { getCustomElementInstance } from '../element/internal';

export function useHostConnected(): () => boolean {
  const instance = getCustomElementInstance();

  if (!instance) {
    throw Error(
      __DEV__ ? '[maverick] called `useHostConnected` outside of root or setup function' : '',
    );
  }

  return () => instance.host.$connected;
}

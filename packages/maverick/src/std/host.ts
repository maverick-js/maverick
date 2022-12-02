import { getElementInstance } from '../element/internal';

export function useHostConnected(): () => boolean {
  const instance = getElementInstance();

  if (!instance) {
    throw Error(
      __DEV__ ? '[maverick] called `useHostConnected` outside of root or setup function' : '',
    );
  }

  return () => instance.host.$connected;
}

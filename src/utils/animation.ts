export function raf(callback: () => void | Promise<void>) {
  if (__NODE__) {
    callback();
    return;
  }

  return new Promise(async (resolve) => {
    await callback();
    resolve(void 0);
  });
}

export function raf(callback: () => void | Promise<void>) {
  if (__SERVER__) {
    callback();
    return;
  }

  return new Promise((resolve) => {
    window.requestAnimationFrame(async () => {
      await callback();
      resolve(void 0);
    });
  });
}

if (!window.PointerEvent) {
  window.PointerEvent = window.MouseEvent as unknown as typeof PointerEvent;
}

if (!globalThis.PointerEvent) {
  globalThis.PointerEvent = window.PointerEvent;
}

export function setRef(ref: React.Ref<unknown>, value: Element | null) {
  if (typeof ref === 'function') {
    (ref as (e: Element | null) => void)(value);
  } else {
    (ref as { current: Element | null }).current = value;
  }
}

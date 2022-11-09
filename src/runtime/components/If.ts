import { computed, peek } from '@maverick-js/observables';

import { unwrapDeep } from '../../utils/obs';
import { isFunction } from '../../utils/unit';
import type { JSX } from '../jsx';

export type IfCondition<T = unknown> = JSX.Value<T | boolean | null | undefined>;

/**
 * This component enables conditionally rendering part of the view. It renders children when the
 * given `condition` is truthy, otherwise it renders the `else` prop.
 *
 * @example
 * ```tsx
 * <If condition={condition()} else={<div>Falsy</div>}>
 *   <div>Truthy</div>
 * </If>
 * ```
 * @example
 * ```tsx
 * const item = observable<{ id: string } | null>(null);
 * <If condition={item()}>
 *   {(item) => <div>item.id</div>}
 * </If>
 * ```
 */
export function If<T>(props: {
  condition: IfCondition<T>;
  else?: JSX.Element;
  $children: JSX.Element | ((item: T) => JSX.Element);
}): JSX.Element {
  return computed(() => {
    let value = unwrapDeep(props.condition);
    return value
      ? isFunction(props.$children)
        ? peek(() => (props.$children as (item: T) => JSX.Element)(value as T))
        : props.$children
      : props.else;
  });
}

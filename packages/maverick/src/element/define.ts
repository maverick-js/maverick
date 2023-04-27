import type { IfAny } from 'type-fest';

import type { StoreFactory } from '../runtime/store';
import { isArray } from '../std/unit';
import type { AnyComponentAPI, ComponentAPI } from './component';
import type { CSS } from './css';
import {
  type AttributeType,
  PROP_DEF,
  type PropDeclarations,
  type PropDefinition,
  type PropDefinitions,
} from './props';

export function defineElement<API extends ComponentAPI = AnyComponentAPI>(
  declaration: CustomElementDeclaration<API>,
) {
  if ('props' in declaration) {
    const props = declaration.props as any;
    for (const name of Object.keys(props)) {
      const def = (
        props[name]?.[PROP_DEF] ? props[name] : { [PROP_DEF]: true, value: props[name] }
      ) as PropDefinition<any>;
      if (def.attribute !== false && !def.type) def.type = inferAttributeType(def.value);
      props[name] = def;
    }
  }

  return declaration as CustomElementDefinition<API>;
}

export interface CustomElementDefinition<API extends ComponentAPI = AnyComponentAPI> {
  /** @internal type only */
  readonly ts__api?: API;
  /**
   * The tag name of the custom element. Note that custom element names must contain a hypen (e.g.,
   * `foo-bar`).
   */
  readonly tagName: `${string}-${string}`;
  /**
   * Whether this custom element should contain a shadow root. Optionally, shadow root init options
   * can be provided. If `true`, simply the `mode` is set to `open`.
   */
  readonly shadowRoot?: true | ShadowRootInit;
  /**
   * Component properties. Do note that these props are also exposed on the custom element as
   * getter/setter pairs.
   */
  readonly props: PropDefinitions<API['props']>;
  /**
   * The store that will be exposed to the component and children.
   */
  readonly store: API['store'];
  /**
   * CSS styles that should be adopted by the shadow root. Note that these styles are only applied
   * if the `shadowRoot` option is truthy.
   */
  readonly css?: CSS[];
}

/** Ensuring props/store is only required when declared. */
export type CustomElementDeclaration<
  API extends ComponentAPI,
  Definition = Omit<CustomElementDefinition<API>, 'props'>,
> = IfAny<
  API['props'],
  IfAny<
    API['store'],
    Omit<Definition, 'props' | 'store'> & {
      props?: PropDeclarations<any>;
      store?: StoreFactory<any>;
    },
    Omit<Definition, 'props'> & { props?: PropDeclarations<any> }
  >,
  IfAny<
    API['store'],
    Omit<Definition, 'store'> & { store?: StoreFactory<any> },
    keyof API['props'] extends never
      ? keyof API['store'] extends never
        ? Omit<Definition, 'props' | 'store'>
        : Omit<Definition, 'props'>
      : (keyof API['store'] extends never ? Omit<Definition, 'store'> : Definition) & {
          props: PropDeclarations<API['props']>;
        }
  >
>;

export const STRING: AttributeType<string | null> = {
  from: (v) => (v === null ? '' : v + ''),
};

export const NUMBER: AttributeType<number | null> = {
  from: (v) => (v === null ? 0 : Number(v)),
};

export const BOOLEAN: AttributeType<boolean | null> = {
  from: (v) => v !== null,
  to: (v) => (v ? '' : null),
};

export const FUNCTION: AttributeType<(() => void) | null> = {
  from: false,
  to: () => null,
};

export const ARRAY: AttributeType<unknown[] | null> = {
  from: (v) => (v === null ? [] : JSON.parse(v)),
  to: (v) => JSON.stringify(v),
};

export const OBJECT: AttributeType<object | null> = {
  from: (v) => (v === null ? {} : JSON.parse(v)),
  to: (v) => JSON.stringify(v),
};

export function inferAttributeType(value: unknown): AttributeType<any> {
  switch (typeof value) {
    case 'undefined':
      return STRING;
    case 'string':
      return STRING;
    case 'boolean':
      return BOOLEAN;
    case 'number':
      return NUMBER;
    case 'function':
      return FUNCTION;
    case 'object':
      return isArray(value) ? ARRAY : OBJECT;
    default:
      return STRING;
  }
}

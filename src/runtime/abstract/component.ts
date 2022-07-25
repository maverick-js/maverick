import { isFunction, run, runAll } from '../../utils';
import { setCurrentInstance, type InternalInstance } from './instance';
import type {
  AbstractComponent,
  AbstractComponentSetup,
  ComponentEvents,
  ComponentLifecycleHook,
  ComponentMembers,
  ComponentProps,
  ComponentSlots,
} from './types';

const ABSTRACT_COMPONENT_KEY = Symbol(__DEV__ ? 'ABSTRACT_COMPONENT' : '');

export function defineComponent<
  Props extends ComponentProps = ComponentProps,
  Events extends ComponentEvents = ComponentEvents,
  Slots extends ComponentSlots = ComponentSlots,
  Members extends ComponentMembers = ComponentMembers,
  InitialProps extends ComponentProps = ComponentProps,
>(definition: {
  name: string;
  initialProps?: InitialProps;
  setup: AbstractComponentSetup<Props & InitialProps, Events, Slots, Members>;
}): AbstractComponent<Props, Events, Slots, Members, InitialProps> {
  const createInstance = (bridge) => {
    let mounted = false;

    const instance: InternalInstance = {
      $c: [],
      $bu: [],
      $m: [],
      $au: [],
      $d: [],
      $dy: [],
    };

    setCurrentInstance(instance);
    const $r = definition.setup(bridge);
    setCurrentInstance(null);

    return {
      $c() {
        const disconnectHooks = instance.$c.map(run).filter(isFunction) as ComponentLifecycleHook[];
        if (!mounted) for (const hook of disconnectHooks) instance.$d.push(hook);
      },
      $bu() {
        if (mounted) runAll(instance.$bu);
      },
      $m() {
        if (!mounted) {
          const destroyHooks = instance.$m.map(run).filter(isFunction) as ComponentLifecycleHook[];
          for (const hook of destroyHooks) instance.$dy.push(hook);
          mounted = true;
          instance.$m = [];
        }
      },
      $au() {
        if (mounted) runAll(instance.$au);
      },
      $d() {
        runAll(instance.$d);
      },
      $dy() {
        runAll(instance.$dy);
        instance.$bu = [];
        instance.$au = [];
        instance.$d = [];
        instance.$dy = [];
      },
      $r: isFunction($r) ? $r : $r.$render!,
      members: isFunction($r) ? undefined : $r,
    };
  };

  return {
    ...definition,
    createInstance,
    // @ts-expect-error - .
    [ABSTRACT_COMPONENT_KEY]: true,
  };
}

export function isAbstractComponent(value: any): value is AbstractComponent {
  return value?.[ABSTRACT_COMPONENT_KEY] === true;
}

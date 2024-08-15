export type InferEvents<Target> = Target extends Component<any, any, infer Events>
  ? Events
  : Target extends ViewController<any, any, infer Events>
    ? Events
    : Target extends EventsTarget<infer Events>
      ? Events extends {}
        ? Events
        : HTMLElementEventMap
      : Target extends { $ts__events?: infer Events }
        ? Events extends {}
          ? Events
          : HTMLElementEventMap
        : HTMLElementEventMap;

/**
 * Adds an event listener for the given `type` and returns a function which can be invoked to
 * remove the event listener.
 *
 * - The listener is removed if the current scope is disposed.
 * - This function is safe to use on the server (noop).
 */
export function listenEvent<
  Target extends EventTarget,
  Events = InferEvents<Target>,
  Type extends keyof Events = keyof Events,
>(
  target: Target,
  type: Type & string,
  handler: TargetedEventHandler<Target, Events[Type] extends Event ? Events[Type] : Event>,
  options?: AddEventListenerOptions | boolean,
): Dispose {
  if (__SERVER__) return noop;
  target.addEventListener(type, handler as any, options);
  return onDispose(() => target.removeEventListener(type, handler as any, options));
}

export class EventsController<Target extends EventTarget, Events = InferEvents<Target>> {
  #target: Target;
  #controller: AbortController;

  get signal(): AbortSignal {
    return this.#controller.signal;
  }

  constructor(target: Target) {
    this.#target = target;
    this.#controller = new AbortController();
    onDispose(this.abort.bind(this));
  }

  add<Type extends keyof Events>(
    type: Type,
    handler: TargetedEventHandler<Target, Events[Type] extends Event ? Events[Type] : Event>,
    options?: AddEventListenerOptions,
  ) {
    if (this.signal.aborted) throw Error('aborted');

    this.#target.addEventListener(type as any, handler as any, {
      ...options,
      signal: options?.signal ? anySignal(this.signal, options.signal) : this.signal,
    });

    return this;
  }

  remove<Type extends keyof Events>(
    type: Type,
    handler: TargetedEventHandler<Target, Events[Type] extends Event ? Events[Type] : Event>,
  ) {
    this.#target.removeEventListener(type as any, handler as any);
    return this;
  }

  abort(reason?: string) {
    this.#controller.abort(reason);
  }
}

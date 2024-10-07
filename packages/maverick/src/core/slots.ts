import type { IsNever } from 'type-fest';

import type { JSX } from '../jsx/jsx';

// ---------------------------------------------------------------------------------------------
// createSlot
// ---------------------------------------------------------------------------------------------

export type Slot<Props = never> =
  IsNever<Props> extends true ? { (): JSX.Element } : { (props: Props): JSX.Element };

export type SlotChildren<Component> =
  Component extends Slot<infer Props>
    ? Props extends {}
      ? (props: Props) => JSX.Element
      : JSX.Element
    : never;

export type SlotProps<Name, Component> = Name extends 'default'
  ? { children: SlotChildren<Component> }
  : { name: Name; children: SlotChildren<Component> };

export type SlotComponent<Slots> = {
  <Name extends keyof Slots>(props: SlotProps<Name, Slots[Name]>): JSX.Element;
};

export function createSlot<Slots = { default: Slot }>(): SlotComponent<Slots> {
  return {} as any; // component is compiled out, return value is not used.
}

// ---------------------------------------------------------------------------------------------
// getSlots
// ---------------------------------------------------------------------------------------------

export interface DefaultSlots {
  default?: Slot;
}

export interface SlotRecord extends Record<string, Slot> {}

export type InferSlots<T> = T extends SlotComponent<infer Slots> ? Slots : T;

/** @internal */
export let $$_current_slots: SlotRecord = {};

export function getSlots<Slots = DefaultSlots>(slots?: Slots) {
  return $$_current_slots as InferSlots<Slots>;
}

/** @internal */
export function $$_set_current_slots(slots: SlotRecord) {
  $$_current_slots = slots;
}

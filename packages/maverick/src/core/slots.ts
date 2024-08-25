import type { JSX } from '../jsx/jsx';
import type { ComponentSlot } from './component';

export type SlotChild<Component> =
  Component extends ComponentSlot<infer Props>
    ? Props extends {}
      ? (props: Props) => JSX.Element
      : JSX.Element
    : never;

export type SlotProps<Name, Component> = Name extends 'default'
  ? { children: SlotChild<Component> }
  : { name: Name; children: SlotChild<Component> };

export type SlotComponents<Slots> = {
  <Name extends keyof Slots>(props: SlotProps<Name, Slots[Name]>): JSX.Element;
};

export function slots<Slots>(): SlotComponents<Slots> {
  return {} as any;
}

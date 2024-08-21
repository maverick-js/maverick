import type { JSX } from '../jsx/jsx';

export interface FragmentProps {
  slot?: string;
  children: JSX.Element;
}

export function Fragment(props: FragmentProps): JSX.Element {
  return null;
}

export interface PortalProps {
  to: string | Node | null;
  children: JSX.Element;
}

export function Portal(props: PortalProps): JSX.Element {
  return null;
}

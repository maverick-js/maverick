import * as React from 'react';

import { Component } from '../../../../maverick/src/core';
import type { ReactElementProps } from '../../../../maverick/src/react';
import type { DOMEvent } from '../../../../maverick/src/std';

/* -------------------------------------------------------------------------------------------------
 * Foo
 * -----------------------------------------------------------------------------------------------*/

interface FooProps extends React.SVGAttributes<SVGElement> {
  a: number;
  b: string;
  onFoo(): void;
  onBar(detail: string): void;
  /**
   * This is the onBaz callback.
   *
   * @deprecated
   */
  onBaz: (detail: number, nativeEvent: MouseEvent) => void;
}

/**
 * This is the Foo component docs.
 *
 * @internal
 */
function Foo(props: FooProps) {
  return <div>0</div>;
}

Foo.displayName = 'FooComponent';

/* -------------------------------------------------------------------------------------------------
 * Bar
 * -----------------------------------------------------------------------------------------------*/

interface BarComponentProps {
  foo: number;
  bar: string;
  /** This is the baz prop docs. */
  baz?: boolean;
}

interface BarComponentEvents {
  /**
   * This is the foo event docs.
   *
   * @bubbles
   */
  foo: DOMEvent<number>;
  bar: DOMEvent<void>;
}

class BarComponent extends Component<BarComponentProps, {}, BarComponentEvents> {}

interface BarProps extends ReactElementProps<BarComponent, HTMLButtonElement> {
  asChild?: boolean;
  children?: React.ReactNode;
  ref?: React.Ref<HTMLButtonElement>;
}

const Bar = React.forwardRef<HTMLButtonElement, BarProps>((props) => {
  return null;
});

Bar.displayName = 'BarComponent';

export { Foo, Bar };

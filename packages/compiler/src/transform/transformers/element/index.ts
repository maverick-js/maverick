import ts from 'typescript';

import type { Transformer } from '../transformer';

export const ElementTransformer: Transformer = {
  name: '@maverick-js/element',
  transform({ code, sourceFile, jsx, ctx }) {},
};

// Example
// class Foo extends Component {
//   static tagName = 'mk-foo';
//   override render(): JSX.Element {
//     return <host as="div"></host>;
//   }
// }

// class FooElement extends Host(HTMLElement, Foo) {
//   static tagName = 'mk-foo';
//   override onConnect(el: HTMLElement) {
//     // rendering here??
//   }
// }

import { CustomElement, HostElement, renderToString } from 'maverick.js';

import { defineCustomElement } from 'maverick.js/element';

it('should render attributes', () => {
  const element = defineCustomElement({
    tagName: 'mk-foo',
    setup: () => () => <HostElement foo="..." $class:foo={true} $style:display={'none'} />,
  });

  const result = renderToString(() => <CustomElement $element={element} />).code;

  expect(result).toMatchInlineSnapshot(
    '"<!$><mk-foo mk-h=\\"\\" mk-d=\\"\\" foo=\\"...\\" class=\\"foo\\" style=\\"display: none;\\"><shadow-root></shadow-root></mk-foo>"',
  );
});

it('should render with children', () => {
  const element = defineCustomElement({
    tagName: 'mk-foo',
    setup: () => () =>
      (
        <HostElement>
          <div>Foo</div>
          <div>Bar</div>
        </HostElement>
      ),
  });

  const result = renderToString(() => <CustomElement $element={element} />).code;

  expect(result).toMatchInlineSnapshot(
    '"<!$><mk-foo mk-h=\\"\\" mk-d=\\"\\"><shadow-root><!$><div>Foo</div><!$><div>Bar</div><!/[]></shadow-root></mk-foo>"',
  );
});

it('should render with attributes and children', () => {
  const element = defineCustomElement({
    tagName: 'mk-foo',
    setup: () => () =>
      (
        <HostElement foo="...">
          <div>{2 > 1 && 'Text'}</div>
          <div>Bar</div>
        </HostElement>
      ),
  });

  const result = renderToString(() => <CustomElement $element={element} />).code;

  expect(result).toMatchInlineSnapshot(
    '"<!$><mk-foo mk-h=\\"\\" mk-d=\\"\\" foo=\\"...\\"><shadow-root><!$><div><!$>Text</div><!$><div>Bar</div><!/[]></shadow-root></mk-foo>"',
  );
});

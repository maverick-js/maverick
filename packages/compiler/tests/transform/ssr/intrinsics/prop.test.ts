import { ssr } from '../../transform';

test('static', () => {
  expect(ssr(`<svg prop:width={1920}/>`)).toMatchInlineSnapshot(`
    ""<svg></svg>";
    "
  `);
});

test('dynamic', () => {
  expect(ssr(`<svg prop:width={calcWidth} />`)).toMatchInlineSnapshot(`
    ""<!$><svg></svg>";
    "
  `);
});

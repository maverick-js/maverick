import { ssr } from '../../transform';

test('on', () => {
  expect(ssr('<div on:click={onClick} />')).toMatchInlineSnapshot(`
    ""<div></div>";
    "
  `);
});

test('capture', () => {
  expect(ssr('<div on_capture:click={onClick} />')).toMatchInlineSnapshot(`
    ""<div></div>";
    "
  `);
});

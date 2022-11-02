import { css, injectCSS } from 'maverick.js/element';

it('should create css text', () => {
  const sheet = css`
    div {
      display: inline-block;
    }
  `;

  expect(sheet.text).toMatchInlineSnapshot(`
    "
        div {
          display: inline-block;
        }
      "
  `);
});

it('should inject css', () => {
  const sheet = css`
    div {
      display: ${injectCSS('inline-block')};
    }
  `;

  expect(sheet.text).toMatchInlineSnapshot(`
    "
        div {
          display: inline-block;
        }
      "
  `);
});

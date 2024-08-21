import { transform } from '@maverick-js/compiler';

const t = (code: string) => transform(code, { target: 'ssr' }).code;

it('should return sourcemap', () => {
  const result = transform(`<div></div>`, { filename: 'foo.tsx', sourcemap: true });
  expect(result.map).toBeDefined();
  expect(result.map!.sources[0]).toBe('foo.tsx');
});

it('should compile single JSX node', () => {
  const result = t(`<div></div>`);
  expect(result).toMatchInlineSnapshot();
});

// it('should compile single self-closing JSX node', () => {
//   const result = t(`<div />`);
//   expect(result).toMatchInlineSnapshot();
// });

// it('should compile multiple JSX nodes', () => {
//   const result = t(`<div><span id="a"></span><span id="b"></span></div>`);
//   expect(result).toMatchInlineSnapshot();
// });

// it('shoud merge duplicate templates', () => {
//   const result = t(`
// <>
// <div></div>
// <div></div>
// <div>Foo</div>
// <div>Foo</div>
// <div>Bar</div>
// <span></span>
// <span>Foo</span>
// <span>Foo</span>
// <span>Foo</span>
// <span>Bar</span>
// </>
// `);
//   expect(result).toMatchInlineSnapshot();
// });

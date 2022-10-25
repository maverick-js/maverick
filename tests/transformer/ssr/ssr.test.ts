import { transform } from 'maverick.js/transformer';

const t = (code: string) => transform(code, { generate: 'ssr' }).code;

it('should return sourcemap', () => {
  const result = transform(`<div></div>`, { filename: 'foo.tsx', sourcemap: true });
  expect(result.map).toBeDefined();
  expect(result.map!.sources[0]).toBe('foo.tsx');
});

it('should compile single JSX node', () => {
  const result = t(`<div></div>`);
  expect(result).toMatchSnapshot();
});

it('should compile single self-closing JSX node', () => {
  const result = t(`<div />`);
  expect(result).toMatchSnapshot();
});

it('should compile multiple JSX nodes', () => {
  const result = t(`<div><span id="a"></span><span id="b"></span></div>`);
  expect(result).toMatchSnapshot();
});

it('should compile fragment', () => {
  const result = t(`<><div id="a"></div><div id="b"></div></>`);
  expect(result).toMatchSnapshot();
});

it('should compile nested fragment', () => {
  const result = t(`<div id="root"><><div id="a"></div><div id="b"></div></></div>`);
  expect(result).toMatchSnapshot();
});

it('should compile shorthand boolean attribute', () => {
  const result = t(`<button disabled />`);
  expect(result).toMatchSnapshot();
});

it('should compile static attributes', () => {
  const result = t(`<div class="foo bar" style="baz daz"></div>`);
  expect(result).toMatchSnapshot();
});

it('should compile static attribute (number)', () => {
  const result = t(`<div foo={10}></div>`);
  expect(result).toMatchSnapshot();
});

it('should compile static attribute (boolean)', () => {
  const result = t(`<div foo={true} bar={false}></div>`);
  expect(result).toMatchSnapshot();
});

it('should compile static attribute (template string)', () => {
  const result = t(`<div foo={\`bar-baz\`} ></div>`);
  expect(result).toMatchSnapshot();
});

it('should compile spread', () => {
  const result = t(`<div {...props} ></div>`);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_spread, $$_ssr } from \\"maverick.js/ssr\\";

    const $$_templ = /* #__PURE__ */ [\\"<!$><div\\", \\"></div>\\"];
    $$_ssr($$_templ, $$_spread([props]))"
  `);
});

it('should compile spread with attributes', () => {
  const result = t(`<div a="0" b="1" c={id} {...props} d={true} e={10} {...propsTwo}></div>`);
  expect(result).toMatchSnapshot();
});

it('should merge classes between spreads', () => {
  const result = t(
    `<div $class:a={id} $class:b={false} class="foo bar" {...props} $class:c={0} {...propsTwo}></div>`,
  );
  expect(result).toMatchSnapshot();
});

it('should merge classes after spread', () => {
  const result = t(`<div {...props} $class:a={id} $class:b={false} class="foo bar"></div>`);
  expect(result).toMatchSnapshot();
});

it('should merge styles between spreads', () => {
  const result = t(
    `<div $style:a={id} $style:b={false} style="foo bar" {...props} $style:c={0} {...propsTwo}></div>`,
  );
  expect(result).toMatchSnapshot();
});

it('should merge styles after spread', () => {
  const result = t(
    `<div {...props} $style:a={id} $style:b={false} style="foo bar"  $style:c={0}></div>`,
  );
  expect(result).toMatchSnapshot();
});

it('should merge spreads', () => {
  const result = t(`<div {...props} {...propsTwo} {...propsThree} ></div>`);
  expect(result).toMatchSnapshot();
});

it('should compile dynamic attribute', () => {
  const result = t(`<div foo={id}></div>`);
  expect(result).toMatchSnapshot();
});

it('should compile observable attribute', () => {
  const result = t(`<div foo={id()}></div>`);
  expect(result).toMatchSnapshot();
});

it('should _not_ compile innerHTML expression', () => {
  const result = t(`<div $prop:innerHTML="baz"></div>`);
  expect(result).toMatchSnapshot();
});

it('should _not_ compile $prop expression', () => {
  const result = t(`<div $prop:fooBar="baz"></div>`);
  expect(result).toMatchSnapshot();
});

it('should compile static class attribute', () => {
  const result = t(`<div class="foo bar"></div>`);
  expect(result).toMatchSnapshot();
});

it('should compile dynamic class attribute', () => {
  const result = t(`<div class={id()}></div>`);
  expect(result).toMatchSnapshot();
});

it('should compile $class expression', () => {
  const result = t(`<div $class:foo={true}></div>`);
  expect(result).toMatchSnapshot();
});

it('should compile multiple $class expressions', () => {
  const result = t(
    `<div class="foo bar" $class:foo={true} $class:bar={false} $class:baz={true}></div>`,
  );
  expect(result).toMatchSnapshot();
});

it('should compile observable $class expression', () => {
  const result = t(`<div $class:foo={id()}></div>`);
  expect(result).toMatchSnapshot();
});

it('should compile static style attribute', () => {
  const result = t(`<div style="foo: 1; bar: 2;"></div>`);
  expect(result).toMatchSnapshot();
});

it('should compile dynamic style attribute', () => {
  const result = t(`<div style={id()}></div>`);
  expect(result).toMatchSnapshot();
});

it('should compile $style expression', () => {
  const result = t(`<div $style:foo="bar"></div>`);
  expect(result).toMatchSnapshot();
});

it('should compile dynamic $style expression', () => {
  const result = t(`<div $style:foo={id}></div>`);
  expect(result).toMatchSnapshot();
});

it('should group multiple static $style expressions', () => {
  const result = t(
    `<div style="foo: a;" $style:foo={"b"} $style:bar={true} $style:baz={id}></div>`,
  );
  expect(result).toMatchSnapshot();
});

it('should compile observable $style expression', () => {
  const result = t(`<div style={id()} $style:foo={id()}></div>`);
  expect(result).toMatchSnapshot();
});

it('should compile $cssvar expression', () => {
  const result = t(`<div $cssvar:foo={10}></div>`);
  expect(result).toMatchSnapshot();
});

it('should group multiple static $cssvar expressions', () => {
  const result = t(
    `<div style="pre: 10" $cssvar:foo={10} $cssvar:bar={'align-content'} $cssvar:baz={id}></div>`,
  );
  expect(result).toMatchSnapshot();
});

it('should group multiple static $style and $cssvar expressions', () => {
  const result = t(
    `<div style="pre: 10" $style:baz={\`content\`} $style:boo={20} $cssvar:foo={10} $cssvar:bar={'align-content'}></div>`,
  );
  expect(result).toMatchSnapshot();
});

it('should compile dynamic $cssvar expression', () => {
  const result = t(`<div $cssvar:foo={id}></div>`);
  expect(result).toMatchSnapshot();
});

it('should compile observable $cssvar expression', () => {
  const result = t(`<div $cssvar:foo-bar={id()}></div>`);
  expect(result).toMatchSnapshot();
});

it('should _not_ compile $use expression', () => {
  const result = t(`<div $use:directive={[1, 2, 3]}></div>`);
  expect(result).toMatchSnapshot();
});

it('should _not_ compile $ref expression', () => {
  const result = t(`<div $ref={(el) => {}}></div>`);
  expect(result).toMatchSnapshot();
});

it('should _not_ compile $on expression', () => {
  const result = t(`<div $on:foo={(e) => {}} />`);
  expect(result).toMatchSnapshot();
});

it('should _not_ compile $oncapture expression', () => {
  const result = t(`<div $oncapture:foo={(e) => {}} />`);
  expect(result).toMatchSnapshot();
});

it('should compile child expression', () => {
  const result = t(`<div>{id}</div>`);
  expect(result).toMatchSnapshot();
});

it('should compile observable child expression', () => {
  const result = t(`<div>{id() + 10}</div>`);
  expect(result).toMatchSnapshot();
});

it('should compile conditional element expression ', () => {
  const result = t(`<div id="a">{id > 10 && <div id="b"></div>}</div>`);
  expect(result).toMatchSnapshot();
});

it('should compile observable conditional element expression ', () => {
  const result = t(`<div id="a">{id() > 10 && <div id="b" $on:click={id()}></div>}</div>`);
  expect(result).toMatchSnapshot();
});

it('shoud merge duplicate templates', () => {
  const result = t(`
<div></div>
<div></div>
<div>Foo</div>
<div>Foo</div>
<div>Bar</div>
<span></span>
<span>Foo</span>
<span>Foo</span>
<span>Foo</span>
<span>Bar</span>
`);
  expect(result).toMatchSnapshot();
});

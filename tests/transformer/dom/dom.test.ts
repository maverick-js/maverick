import { transform } from 'src/transformer';

const t = (code: string) => transform(code).code;

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
  expect(result).toMatchSnapshot();
});

it('should compile SVG spread', () => {
  const result = t(`<svg {...props}></svg>`);
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

it('should compile innerHTML expression', () => {
  const result = t(`<div $prop:innerHTML="baz"></div>`);
  expect(result).toMatchSnapshot();
});

it('should compile $prop expression', () => {
  const result = t(`<div $prop:fooBar="baz"></div>`);
  expect(result).toMatchSnapshot();
});

it('should compile shorthand $prop boolean', () => {
  const result = t(`<button $prop:disabled />`);
  expect(result).toMatchSnapshot();
});

it('should compile dynamic $prop expression', () => {
  const result = t(`<div $prop:foo={id}></div>`);
  expect(result).toMatchSnapshot();
});

it('should compile observable $prop expression', () => {
  const result = t(`<div $prop:foo={id()}></div>`);
  expect(result).toMatchSnapshot();
});

it('should compile $class expression', () => {
  const result = t(`<div $class:foo={true}></div>`);
  expect(result).toMatchSnapshot();
});

it('should compile observable $class expression', () => {
  const result = t(`<div $class:foo={id()}></div>`);
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
    `<div style="foo: a; " $style:foo={"b"} $style:bar={true} $style:baz={id}></div>`,
  );
  expect(result).toMatchSnapshot();
});

it('should compile observable $style expression', () => {
  const result = t(`<div $style:foo={id()}></div>`);
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

it('should compile $use expression', () => {
  const result = t(`<div $use:directive={[1, 2, 3]}></div>`);
  expect(result).toMatchSnapshot();
});

it('should compile $ref expression', () => {
  const result = t(`<div $ref={(el) => {}}></div>`);
  expect(result).toMatchSnapshot();
});

it('should compile $ref expression that uses array', () => {
  const result = t(`<div $ref={[(el) => {}, (el) => {}]}></div>`);
  expect(result).toMatchSnapshot();
});

it('should compile $on expression', () => {
  const result = t(`<div $on:foo={(e) => {}} />`);
  expect(result).toMatchSnapshot();
});

it('should compile multiple $on expression', () => {
  const result = t(`<div $on:foo={(e) => {}} $on:foo={(e) =>{}} />`);
  expect(result).toMatchSnapshot();
});

it('should compile $on_capture expression', () => {
  const result = t(`<div $on_capture:foo={(e) => {}} />`);
  expect(result).toMatchSnapshot();
});

it('should compile native $on expression', () => {
  const result = t(`<div $on:click={(e) => {}} />`);
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

import { transform } from 'maverick.js/transformer';

const t = (code: string) => transform(code, { hydratable: true }).code;

it('should compile root component', () => {
  const result = t(`<Component />`);
  expect(result).toMatchSnapshot();
});

it('should compile child component', () => {
  const result = t(`<div><Component /></div>`);
  expect(result).toMatchSnapshot();
});

it('should compile root expression ', () => {
  const result = t(`
function Component() {
  return id > 10 ? <div>{id}</div> : 20;
}
  `);
  expect(result).toMatchSnapshot();
});

it('should compile nested components', () => {
  const result = t(`
<Component>
  Text
  <Foo>
    <div>{id()}</div>
  </Foo>
  <Bar />
</Component>
  `);
  expect(result).toMatchSnapshot();
});

it('should compile component with props', () => {
  const result = t(`<Component foo="a" bar={id()} />`);
  expect(result).toMatchSnapshot();
});

it('should compile component with spread', () => {
  const result = t(`<Component {...props} />`);
  expect(result).toMatchSnapshot();
});

it('should compile component with multiple spreads', () => {
  const result = t(`<Component {...props} {...propsTwo} {...propsThree} />`);
  expect(result).toMatchSnapshot();
});

it('should compile component with props and spread', () => {
  const result = t(`<Component foo="..." bar={id() + 10} {...props} />`);
  expect(result).toMatchSnapshot();
});

it('should compile component with text children', () => {
  const result = t('<Component>foo 10 bar 20 baz</Component>');
  expect(result).toMatchSnapshot();
});

it('should compile component with element children', () => {
  const result = t(`<Component><div>Foo{id()}</div></Component>`);
  expect(result).toMatchSnapshot();
});

it('should compile component with props and children', () => {
  const result = t(`<Component foo={id}><div></div></Component>`);
  expect(result).toMatchSnapshot();
});

it('should forward single call expression', () => {
  const result = t(`<Component>{() => <div>{id()}</div>}</Component>`);
  expect(result).toMatchSnapshot();
});

it('should forward multiple call expressions', () => {
  const result = t(`
<Component>
  {() => <div>{id()}</div>}
  {() => <div>{id()}</div>}
</Component>
`);
  expect(result).toMatchSnapshot();
});

it('should compile component child fragment', () => {
  const result = t(
    `
<Component>
  <>
  <div id="foo">{id()}</div>
  <div id="bar">{id()}</div>
  </>
</Component>
`,
  );
  expect(result).toMatchSnapshot();
});

it('should insert multiple child components', () => {
  const result = t(`
<div>
  <Component />
  <Component />
  <div>Foo</div>
  <Component />
</div>`);
  expect(result).toMatchSnapshot();
});

it('should insert fragmented child components', () => {
  const result = t(`
<div>
  <>
    <Component />
    <Component />
    <div>Foo</div>
    <Component />
  </>
</div>`);
  expect(result).toMatchSnapshot();
});

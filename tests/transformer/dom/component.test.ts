import { transform } from 'src/transformer';

const t = (code: string) => transform(code).code;

it('should compile root expression ', () => {
  const result = t(`
function Component() {
  return id > 10 ? <div>{id}</div> : 20;
}
  `);
  expect(result).toMatchSnapshot();
});

it('should compile root component', () => {
  const result = t(`<Component />`);
  expect(result).toMatchSnapshot();
});

it('should compile child component', () => {
  const result = t(`<div><Component /></div>`);
  expect(result).toMatchSnapshot();
});

it('should compile child component with props', () => {
  const result = t(`<div><Component foo="a" bar={id()} /></div>`);
  expect(result).toMatchSnapshot();
});

it('should compile child component with spread', () => {
  const result = t(`<div><Component {...props} /></div>`);
  expect(result).toMatchSnapshot();
});

it('should compile child component with multiple spreads', () => {
  const result = t(`<div><Component {...props} {...propsTwo} {...propsThree} /></div>`);
  expect(result).toMatchSnapshot();
});

it('should compile child component with props and spread', () => {
  const result = t(`<div><Component foo="..." bar={id() + 10} {...props} /></div>`);
  expect(result).toMatchSnapshot();
});

it('should compile child component with text children', () => {
  const result = t('<Component>foo 10 bar 20 baz</Component>');
  expect(result).toMatchSnapshot();
});

it('should compile child component with element children', () => {
  const result = t(`<div><Component><div></div></Component></div>`);
  expect(result).toMatchSnapshot();
});

it('should compile child component with props and children', () => {
  const result = t(`<div><Component foo={id}><div></div></Component></div>`);
  expect(result).toMatchSnapshot();
});

it('should compile child component containing expression', () => {
  const result = t(`<div><Component>{() => <div>{id()}</div>}</Component></div>`);
  expect(result).toMatchSnapshot();
});

it('should forward single call expression', () => {
  const result = t(`<div><Component>{() => <div></div>}</Component></div>`);
  expect(result).toMatchSnapshot();
});

it('should compile child component with fragment children', () => {
  const result = t(
    `<div><Component><><div id="foo"></div><div id="bar"></div></></Component></div>`,
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

it('should insert multiple fragmented child components', () => {
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

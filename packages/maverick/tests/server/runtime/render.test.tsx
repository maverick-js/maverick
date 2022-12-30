import { renderToString } from 'maverick.js/ssr';

function Component() {
  const fn = () => 0;
  const inject = '<script></script>';
  return (
    <div data-foo="hux" data-baz={fn()}>
      <span>Foo</span>
      <ChildComponent>
        <span>Bar</span>
        {'<script></script>'}
      </ChildComponent>
      <span>Baz - {10}</span>
      {() => <div>Woo</div>}
      {true && false}
      {true && null}
      {true && undefined}
      {inject}
    </div>
  );
}

function ChildComponent(props) {
  return props.$children();
}

it('should render to string', () => {
  const result = renderToString(() => <Component />);
  expect(result.code).toMatchInlineSnapshot(
    '"<!$><div data-foo=\\"hux\\" data-baz=\\"0\\"><span>Foo</span><!$><!$><span>Bar</span>&lt;script>&lt;/script><!/[]><span>Baz - 10</span><!$><!$><div>Woo</div><!$><!$><!$><!$>&lt;script>&lt;/script></div>"',
  );
});

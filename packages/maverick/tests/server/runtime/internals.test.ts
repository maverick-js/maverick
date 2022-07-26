import { $$_attr, $$_classes, $$_spread, $$_ssr, $$_styles, SSR_TEMPLATE } from 'maverick.js/ssr';

it('should concat template and parts', () => {
  const template = ['<div><span', '>', '</span>', '</div>'];
  const parts = [' foo="value"', 10];
  const result = $$_ssr(template, ...parts);
  expect(result[SSR_TEMPLATE]).toMatchInlineSnapshot(
    '"<div><span foo=\\"value\\">10</span></div>"',
  );
});

it('should add dynamic attributes', () => {
  const template = ['<div', '', '', '', '', '', '', '', '', '', '', '></div>'];
  const parts = [
    $$_attr('foo', 10),
    $$_attr('bar', true),
    $$_attr('waldo', false),
    $$_attr('qux', 'value'),
    $$_attr('who', 0),
    $$_attr('wha', ''),
    $$_attr('hux', () => 20),
    $$_attr('roo', () => () => '30'),
    $$_attr('baz', null),
    $$_attr('boo', undefined),
  ];
  const result = $$_ssr(template, ...parts);
  expect(result[SSR_TEMPLATE]).toMatchInlineSnapshot(
    '"<div foo=\\"10\\" bar=\\"true\\" qux=\\"value\\" who=\\"0\\" wha=\\"\\" hux=\\"20\\" roo=\\"30\\"></div>"',
  );
});

it('should merge classes', () => {
  const result = $$_classes('foo baz bar hux', {
    baz: false,
    boo: () => true,
    hux: () => false,
  });
  expect(result).toMatchInlineSnapshot('" class=\\"foo bar boo\\""');
});

it('should merge styles', () => {
  const result = $$_styles(' foo: 10;  hux: center;qux:left;', {
    bar: 'items-center',
    boo: () => null,
    hux: false,
    qux: undefined,
    '--wha': 100,
    '--woo': 0,
    '--fox': '',
  });
  expect(result).toMatchInlineSnapshot(
    '" style=\\"foo: 10;bar: items-center;--wha: 100;--woo: 0;\\""',
  );
});

it('should spread attributes', () => {
  const result = $$_spread([
    {
      foo: 0,
      bar: 'apples',
      propA: 100,
      propB: '100',
      bax: () => null,
      wha: () => 'ano',
    },
    {
      hux: true,
      qux: null,
    },
  ]);

  expect(result).toMatchInlineSnapshot(
    '"foo=\\"0\\" bar=\\"apples\\" wha=\\"ano\\" hux=\\"true\\""',
  );
});

it('should merge classes on spread', () => {
  const result = $$_spread([
    { class: 'foo bar box ' },
    {
      class: ' lo fox wha',
      $$class: {
        foo: false,
        bar: true,
        baz: true,
        bax: () => true,
        wha: () => false,
      },
    },
  ]);

  expect(result).toMatchInlineSnapshot('"class=\\"bar box lo fox baz bax\\""');
});

it('should clear classes on spread', () => {
  const result = $$_spread([
    { class: 'foo bar box ' },
    {
      class: null,
      $$class: {
        bar: true,
        baz: () => true,
      },
    },
  ]);

  expect(result).toMatchInlineSnapshot('"class=\\"bar baz\\""');
});

it('should merge styles on spread', () => {
  const result = $$_spread([
    { style: ' foo: 10;  hux: center;qux:left;' },
    {
      style: '--wha:   50;',
      $$style: {
        bar: 'items-center',
        boo: () => null,
        hux: false,
        qux: undefined,
        '--wha': 100,
        '--woo': 0,
        '--fox': '',
      },
    },
  ]);

  expect(result).toMatchInlineSnapshot(
    '"style=\\"foo: 10;--wha: 100;bar: items-center;--woo: 0;\\""',
  );
});

it('should clear styles on spread', () => {
  const result = $$_spread([
    { style: ' foo: 10;  hux: center;qux:left;' },
    {
      style: null,
      $$style: {
        boo: () => null,
        hux: true,
        qux: () => true,
        '--wha': 100,
        '--woo': 0,
      },
    },
  ]);

  expect(result).toMatchInlineSnapshot('"style=\\"hux: true;qux: true;--wha: 100;--woo: 0;\\""');
});

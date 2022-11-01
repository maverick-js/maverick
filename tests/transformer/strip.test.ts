import { transform } from 'maverick.js/transformer';

const t = (code: string) => transform(code, { filename: 'test.tsx' }).code;

it('should remove defineCSSVar calls', () => {
  const result = t(`
import { defineCSSVar } from "maverick.js/element";
defineElement({
  cssvars: {
    foo: defineCSSVar<number>(0),
    bar: defineCSSVar(),
    bax: defineCSSVar('none')
  }
})
  `);
  expect(result).toMatchInlineSnapshot(`
    "
    import { defineCSSVar } from \\"maverick.js/element\\";
    defineElement({
      cssvars: {
        foo: 0,
        
        bax: 'none'
      }
    })
      "
  `);
});

it('should remove defineCSSVars calls', () => {
  const result = t(`
import { defineCSSVars } from "maverick.js/element";
defineElement({
  cssvars: defineCSSVars<{
    foo: number;
    bar: string;
  }>(),
})
  `);
  expect(result).toMatchInlineSnapshot(`
    "
    import { defineCSSVars } from \\"maverick.js/element\\";
    defineElement({
      
    })
      "
  `);
});

it('should remove defineEvent calls', () => {
  const result = t(`
import { defineEvent } from "maverick.js/element";
defineElement({
  events: {
    foo: defineEvent<FooEvent>(),
    bar: defineEvent({ bubbles: true }),
    bax: defineEvent()
  }
})
  `);
  expect(result).toMatchInlineSnapshot(`
    "
    import { defineEvent } from \\"maverick.js/element\\";
    defineElement({
      events: {
        
        bar: { bubbles: true },
        
      }
    })
      "
  `);
});

it('should remove defineEvents calls', () => {
  const result = t(`
import { defineEvents } from "maverick.js/element";
defineElement({
  cssvars: defineEvents<{
    foo: FooEvent;
    bar: BarEvent;
  }>(),
})
  `);
  expect(result).toMatchInlineSnapshot(`
    "
    import { defineEvents } from \\"maverick.js/element\\";
    defineElement({
      
    })
      "
  `);
});

it('should not remove if not imported from maverick package', () => {
  const result = t(`
defineCSSVar<number>(0)
  `);
  expect(result).toMatchInlineSnapshot(`
    "
    defineCSSVar<number>(0)
      "
  `);
});

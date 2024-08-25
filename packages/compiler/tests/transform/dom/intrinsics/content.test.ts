import { t } from '../../transform';

test('innerHTML', () => {
  expect(t(`<div innerHTML="<div></div>"><span /></div>`)).toMatchInlineSnapshot(`
    "import { $$_create_template, $$_clone } from "@maverick-js/dom";
    let $_t_1 = $$_create_template("<div></div>");
    function $$_render_1({ $1 }) {
        let $_r_1 = $$_clone($_t_1);
        $_r_1.innerHTML = $1;
        return $_r_1;
    }
    $$_render_1({ $1: "<div></div>" });
    "
  `);
});

test('$innerHTML', () => {
  expect(t(`<div $innerHTML={content}><span /></div>`)).toMatchInlineSnapshot(`
    "import { $$_create_template, $$_clone, $$_prop } from "@maverick-js/dom";
    let $_t_1 = $$_create_template("<div></div>");
    function $$_render_1({ $1 }) {
        let $_r_1 = $$_clone($_t_1);
        $$_prop($_r_1, "innerHTML", $1);
        return $_r_1;
    }
    $$_render_1({ $1: content });
    "
  `);
});

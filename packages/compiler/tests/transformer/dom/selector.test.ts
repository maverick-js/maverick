import { transform } from 'maverick.js/transformer';

const t = (code: string) => transform(code).code;

it('should insert component correctly', () => {
  const result = t(`
  <div>
    <div>
      <div>
        <div>
          <h1>Maverick</h1>
        </div>
        <div>
          <div>
            <Button />
          </div>
        </div>
      </div>
    </div>
  </div>
  `);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_insert, $$_create_component, $$_create_template } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<div><div><div><div><h1>Maverick</h1></div><div><div></div></div></div></div></div>\`);

      (() => {
      const $$_root = $$_clone($$_templ),
        $$_el = $$_root.firstChild,
        $$_el_2 = $$_el.firstChild,
        $$_el_3 = $$_el_2.firstChild,
        $$_el_4 = $$_el_3.nextSibling,
        $$_el_5 = $$_el_4.firstChild;

      $$_insert($$_el_5, $$_create_component(Button));

      return $$_root;
    })()
      "
  `);
});

it('should insert component correctly', () => {
  const result = t(`
<table>
  <div>
    <div>
      <a $prop:textContent="apples" />
    </div>
  </div>
  <tbody>
    <ForKeyed each={$data}>
      {(row) => {
        return (
          <tr class={row.id === $selected() ? 'danger' : ''}>
            <td $prop:textContent={row.id} />
            <td>
              <a $on:click={() => select(row.id)} $prop:textContent={row.label()} />
            </td>
            <td>
              <a $on:click={() => remove(row.id)}>
                <span />
              </a>
            </td>
            <td />
          </tr>
        );
      }}
    </ForKeyed>
    <div></div>
  </tbody>
</table>;
  `);
  expect(result).toMatchInlineSnapshot(`
    "import { $$_clone, $$_effect, $$_attr, $$_listen, $$_create_template, $$_children, $$_insert, $$_create_component } from \\"maverick.js/dom\\";

    const $$_templ = /* #__PURE__ */ $$_create_template(\`<table><div><div><a></a></div></div><tbody><div></div></tbody></table>\`),
      $$_templ_2 = /* #__PURE__ */ $$_create_template(\`<tr><td></td><td><a></a></td><td><a><span></span></a></td><td></td></tr>\`);

    (() => {
      const $$_root = $$_clone($$_templ),
        $$_el = $$_root.firstChild,
        $$_el_2 = $$_el.firstChild,
        $$_el_3 = $$_el_2.firstChild,
        $$_el_4 = $$_el.nextSibling,
        $$_el_5 = $$_el_4.firstChild;

      $$_el_3.textContent = \\"apples\\";
      $$_insert(
        $$_el_4,
        $$_create_component(ForKeyed, {
          each: $data,
          $children: $$_children(() => {
            return (row) => {
              const $$_root = $$_clone($$_templ_2),
                $$_el = $$_root.firstChild,
                $$_el_2 = $$_el.nextSibling,
                $$_el_3 = $$_el_2.firstChild,
                $$_el_4 = $$_el_2.nextSibling,
                $$_el_5 = $$_el_4.firstChild;

              $$_effect(() => $$_attr($$_root, \\"class\\", row.id === $selected() ? \\"danger\\" : \\"\\"));
              $$_el.textContent = row.id;
              $$_listen($$_el_3, \\"click\\", () => select(row.id));
              $$_effect(() => void ($$_el_3.textContent = row.label()));
              $$_listen($$_el_5, \\"click\\", () => remove(row.id));

              return $$_root;
            };
          }),
        }),
        $$_el_5,
      );

      return $$_root;
    })();
      "
  `);
});

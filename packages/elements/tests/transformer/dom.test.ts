import { transform } from '../../src/transformer';
import prettier from 'prettier';

const pretty = (result) => prettier.format(result.code, { parser: 'acorn' });

it('should compile', async () => {
  const result = transform(`
function Component() {
  const props = {};
  const count = 10;
  const fn = () => {}

  return () => (
    <div>
      {props.children}
    </div>
  );
}
`);

  console.log(pretty(result));
});

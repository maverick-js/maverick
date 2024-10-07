import { render } from '@maverick-js/dom';

const target = document.body;

afterEach(() => {
  target.textContent = '';
});

test('children', () => {
  const value = 'foo';

  render(
    () => (
      <div>
        <span data-test={value} />
        <span data-test={value} />
        <span data-test={value} />
      </div>
    ),
    { target },
  );

  expect(target).toMatchSnapshot();
});

test('grandchildren', () => {
  const value = 'foo';

  render(
    () => (
      <div>
        <div>
          <span data-test={value} />
          <span data-test={value} />
          <span data-test={value} />
        </div>
      </div>
    ),
    { target },
  );

  expect(target).toMatchSnapshot();
});

test('insert before', () => {
  const value = 'foo';

  render(
    () => (
      <div>
        {value}
        <span />
      </div>
    ),
    { target },
  );

  expect(target).toMatchSnapshot();
});

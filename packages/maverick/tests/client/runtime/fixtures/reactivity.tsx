import { signal } from 'maverick.js';

type InputFieldProps = {
  next(trigger: () => void): void;
};

export function InputField(props: InputFieldProps) {
  const $value = signal(1);

  const next = () => {
    $value.next((n) => n + 1);
  };

  props.next(next);

  return (
    <div>
      <span>Count is {$value()}</span>
      <input type="number" $prop:value={$value} $on:next={next} />
    </div>
  );
}

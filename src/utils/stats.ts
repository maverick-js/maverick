export type StatsTiming = {
  label: string;
  start: number;
  end: number;
  children: StatsTiming[];
};

export type RenderedStats = { total: number } & Record<string, { total: number }>;

const now =
  typeof process !== 'undefined' && process.hrtime
    ? () => {
        const t = process.hrtime();
        return t[0] * 1e3 + t[1] / 1e6;
      }
    : () => self.performance.now();

function collapse(timings: StatsTiming[]) {
  const result = {};

  timings.forEach((timing) => {
    result[timing.label] = Object.assign(
      { total: timing.end - timing.start },
      timing.children && collapse(timing.children),
    );
  });

  return result;
}

export class Stats {
  protected _start: number = now();

  protected _all: StatsTiming[] = [];
  protected _current!: StatsTiming;
  protected _children: StatsTiming[] = [];
  protected _stack: StatsTiming[] = [];

  start(label: string) {
    const timing: StatsTiming = {
      label,
      start: now(),
      end: 0,
      children: [],
    };

    this._children.push(timing);
    this._stack.push(timing);

    this._current = timing;
    this._children = timing.children;
  }

  stop(label: string) {
    if (label !== this._current.label) {
      throw new Error(`Mismatched timing labels (expected ${this._current.label}, got ${label})`);
    }

    this._current.end = now();
    this._stack.pop();
    this._current = this._stack[this._stack.length - 1];
    this._children = this._current ? this._current.children : this._all;
  }

  render() {
    const timings = Object.assign(
      { total: now() - this._start },
      collapse(this._all),
    ) as RenderedStats;

    return { timings };
  }
}

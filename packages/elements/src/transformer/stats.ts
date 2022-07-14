export type StatsTiming = {
  label: string;
  start: number;
  end: number;
  children: StatsTiming[];
};

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
      {
        total: timing.end - timing.start,
      },
      timing.children && collapse(timing.children),
    );
  });

  return result;
}

export default class Stats {
  timings: StatsTiming[];
  stack: StatsTiming[];
  startTime: number;
  currentTiming!: StatsTiming;
  currentChildren: StatsTiming[];

  constructor() {
    this.startTime = now();
    this.stack = [];
    this.currentChildren = this.timings = [];
  }

  start(label) {
    const timing: StatsTiming = {
      label,
      start: now(),
      end: 0,
      children: [],
    };

    this.currentChildren.push(timing);
    this.stack.push(timing);

    this.currentTiming = timing;
    this.currentChildren = timing.children;
  }

  stop(label: string) {
    if (label !== this.currentTiming.label) {
      throw new Error(
        `Mismatched timing labels (expected ${this.currentTiming.label}, got ${label})`,
      );
    }

    this.currentTiming.end = now();
    this.stack.pop();
    this.currentTiming = this.stack[this.stack.length - 1];
    this.currentChildren = this.currentTiming ? this.currentTiming.children : this.timings;
  }

  render() {
    const timings = Object.assign({ total: now() - this.startTime }, collapse(this.timings));
    return { timings };
  }
}

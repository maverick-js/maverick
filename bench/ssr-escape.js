import fetch from 'node-fetch';
import Benchmark from 'benchmark';

const ATTR_REGEX = /[&"]/g;
const CONTENT_REGEX = /[&<]/g;

// Random long Wiki articles.
const pages = [
  ['2022_in_video_games', ''],
  ['2022_in_sports', ''],
  ['List_of_common_misconceptions', ''],
  ['Firefox_version_history', ''],
];

await Promise.all(
  pages.map(async (page, i) => {
    pages[i] = [page[0], await (await fetch(`https://en.wikipedia.org/wiki/${page[0]}`)).text()];
  }),
);

for (const [path, content] of pages) {
  console.log(path);

  new Benchmark.Suite()
    .add('SVELTE', () => svelteEscape(content))
    .add('SOLID', () => solidEscape(content))
    .on('cycle', function (event) {
      console.log(String(event.target));
    })
    .on('complete', function () {
      console.log('Fastest is ' + this.filter('fastest').map('name'));
    })
    .run();

  console.log('\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n');
}

function svelteEscape(value, isAttr = false) {
  const str = String(value);

  const pattern = isAttr ? ATTR_REGEX : CONTENT_REGEX;
  pattern.lastIndex = 0;

  let escaped = '';
  let last = 0;

  while (pattern.test(str)) {
    const i = pattern.lastIndex - 1;
    const ch = str[i];
    escaped += str.substring(last, i) + (ch === '&' ? '&amp;' : ch === '"' ? '&quot;' : '&lt;');
    last = i + 1;
  }

  return escaped + str.substring(last);
}

function solidEscape(value, isAttr = false) {
  const type = typeof value;

  if (type !== 'string') {
    if (!isAttr && type === 'function') return solidEscape(value());
    if (isAttr && type === 'boolean') return value + '';
    return value;
  }

  const delimeter = isAttr ? '"' : '<',
    escapeDelimeter = isAttr ? '&quot;' : '&lt;';

  let iDelimeter = value.indexOf(delimeter),
    isAmpersand = value.indexOf('&');

  if (iDelimeter < 0 && isAmpersand < 0) return value;

  let left = 0,
    out = '';

  while (iDelimeter >= 0 && isAmpersand >= 0) {
    if (iDelimeter < isAmpersand) {
      if (left < iDelimeter) out += value.substring(left, iDelimeter);
      out += escapeDelimeter;
      left = iDelimeter + 1;
      iDelimeter = value.indexOf(delimeter, left);
    } else {
      if (left < isAmpersand) out += value.substring(left, isAmpersand);
      out += '&amp;';
      left = isAmpersand + 1;
      isAmpersand = value.indexOf('&', left);
    }
  }

  if (iDelimeter >= 0) {
    do {
      if (left < iDelimeter) out += value.substring(left, iDelimeter);
      out += escapeDelimeter;
      left = iDelimeter + 1;
      iDelimeter = value.indexOf(delimeter, left);
    } while (iDelimeter >= 0);
  } else
    while (isAmpersand >= 0) {
      if (left < isAmpersand) out += value.substring(left, isAmpersand);
      out += '&amp;';
      left = isAmpersand + 1;
      isAmpersand = value.indexOf('&', left);
    }

  return left < value.length ? out + value.substring(left) : out;
}

export {};

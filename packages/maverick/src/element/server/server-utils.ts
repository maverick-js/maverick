const classSplitRE = /\s+/;
export function parseClassAttr(tokens: Set<string>, attrValue: string) {
  const classes = attrValue.trim().split(classSplitRE);
  for (const token of classes) tokens.add(token);
}

const styleSplitRE = /\s*:\s*/;
const stylesDelimeterRE = /\s*;\s*/;
export function parseStyleAttr(tokens: Map<string, string>, attrValue: string) {
  const styles = attrValue.trim().split(stylesDelimeterRE);
  for (let i = 0; i < styles.length; i++) {
    if (styles[i] === '') continue;
    const [name, value] = styles[i].split(styleSplitRE);
    tokens.set(name, value);
  }
}

export function escapeHTML(value: any, isAttr = false) {
  const type = typeof value;

  if (type !== 'string') {
    if (!isAttr && type === 'function') return escapeHTML(value());
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

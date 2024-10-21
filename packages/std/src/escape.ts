export function escapeHTML(value: any, isAttr = false) {
  const type = typeof value;

  if (type !== 'string') {
    if (!isAttr && type === 'function') return escapeHTML(value());
    if (isAttr && type === 'boolean') return value + '';
    return value;
  }

  const delimiter = isAttr ? '"' : '<',
    escapeDelimiter = isAttr ? '&quot;' : '&lt;';

  let iDelimiter = value.indexOf(delimiter),
    isAmpersand = value.indexOf('&');

  if (iDelimiter < 0 && isAmpersand < 0) return value;

  let left = 0,
    out = '';

  while (iDelimiter >= 0 && isAmpersand >= 0) {
    if (iDelimiter < isAmpersand) {
      if (left < iDelimiter) out += value.substring(left, iDelimiter);
      out += escapeDelimiter;
      left = iDelimiter + 1;
      iDelimiter = value.indexOf(delimiter, left);
    } else {
      if (left < isAmpersand) out += value.substring(left, isAmpersand);
      out += '&amp;';
      left = isAmpersand + 1;
      isAmpersand = value.indexOf('&', left);
    }
  }

  if (iDelimiter >= 0) {
    do {
      if (left < iDelimiter) out += value.substring(left, iDelimiter);
      out += escapeDelimiter;
      left = iDelimiter + 1;
      iDelimiter = value.indexOf(delimiter, left);
    } while (iDelimiter >= 0);
  } else
    while (isAmpersand >= 0) {
      if (left < isAmpersand) out += value.substring(left, isAmpersand);
      out += '&amp;';
      left = isAmpersand + 1;
      isAmpersand = value.indexOf('&', left);
    }

  return left < value.length ? out + value.substring(left) : out;
}

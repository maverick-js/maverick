export function escapeHTML(value: string, isAttribute = false) {
  if (typeof value !== 'string') return value;

  const delimeter = isAttribute ? '"' : '<';
  const escDelimeter = isAttribute ? '&quot;' : '&lt;';

  let delimeterIndex = value.indexOf(delimeter);
  let ampersandIndex = value.indexOf('&');

  if (delimeterIndex < 0 && ampersandIndex < 0) return value;

  let left = 0,
    out = '';

  while (delimeterIndex >= 0 && ampersandIndex >= 0) {
    if (delimeterIndex < ampersandIndex) {
      if (left < delimeterIndex) out += value.substring(left, delimeterIndex);
      out += escDelimeter;
      left = delimeterIndex + 1;
      delimeterIndex = value.indexOf(delimeter, left);
    } else {
      if (left < ampersandIndex) out += value.substring(left, ampersandIndex);
      out += '&amp;';
      left = ampersandIndex + 1;
      ampersandIndex = value.indexOf('&', left);
    }
  }

  if (delimeterIndex >= 0) {
    do {
      if (left < delimeterIndex) out += value.substring(left, delimeterIndex);
      out += escDelimeter;
      left = delimeterIndex + 1;
      delimeterIndex = value.indexOf(delimeter, left);
    } while (delimeterIndex >= 0);
  } else {
    while (ampersandIndex >= 0) {
      if (left < ampersandIndex) out += value.substring(left, ampersandIndex);
      out += '&amp;';
      left = ampersandIndex + 1;
      ampersandIndex = value.indexOf('&', left);
    }
  }

  return left < value.length ? out + value.substring(left) : out;
}

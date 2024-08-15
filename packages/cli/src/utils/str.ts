export function escapeQuotes(str: string): string {
  return str.replace(/^"+|"+$/g, '').replace(/^'+|'+$/g, '');
}

export function normalizeLineBreaks(str: string): string {
  return str.replace(/\\r/g, '\n');
}

export function splitLineBreaks(str: string): string[] {
  if (typeof str !== 'string') return [];
  return normalizeLineBreaks(str).split('\n');
}

export function round(num: number, decimalPlaces = 2): number {
  return Number(num.toFixed(decimalPlaces));
}

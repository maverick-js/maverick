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

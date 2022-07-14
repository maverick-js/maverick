const KEY = Symbol(__DEV__ ? 'HTML_TAGGED_TEMPLATE' : '');

export function html(statics: TemplateStringsArray, ...values: any[]): HTMLTaggedTemplate {
  return { statics, values: arguments as any, [KEY]: true };
}

export type HTMLTaggedTemplate = {
  statics: TemplateStringsArray;
  values: any[];
  /** @internal */
  [KEY]?: true;
};

export function isHTMLTaggedTemplate(value: any): value is HTMLTaggedTemplate {
  return value?.[KEY] === true;
}

export type JsxAttrNamespace =
  | 'class'
  | '$class'
  | 'prop'
  | '$prop'
  | 'style'
  | '$style'
  | 'var'
  | '$var';

export type JsxEventNamespace = 'on' | 'on_capture';

export type JsxNamespace = JsxAttrNamespace | JsxEventNamespace;

export type JsxChildContentAttrName =
  | 'innerHTML'
  | '$innerHTML'
  | 'textContent'
  | '$textContent'
  | 'innerText'
  | '$innerText';

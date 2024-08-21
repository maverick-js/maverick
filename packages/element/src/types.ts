import type {
  KebabCaseRecord,
  LowercaseRecord,
  NullableSignalOrValueRecord,
  SignalOrValue,
} from 'maverick.js';
import type { ConditionalPick } from 'type-fest';

export type AttrValue = string | number | boolean | null | undefined;

export interface AttrsRecord {
  [attrName: string]: AttrValue;
}

export interface HTMLAttrs extends HTMLAttrsRecord<HTMLProperties> {}

export type HTMLAttrsRecord<Props> = LowercaseRecord<ConditionalPick<Props, AttrValue>>;

export type HTMLDataAttributes = {
  [id: `data-${string}`]: AttrValue;
};

export interface HTMLProperties {
  // Standard HTML Attributes
  accept?: string;
  acceptCharset?: string;
  accessKey?: string;
  action?: string;
  allow?: string;
  allowFullScreen?: boolean;
  allowTransparency?: boolean;
  alt?: string;
  as?: string;
  async?: boolean;
  autocomplete?: string;
  autoComplete?: string;
  autocorrect?: string;
  autoCorrect?: string;
  autofocus?: boolean;
  autoFocus?: boolean;
  autoPlay?: boolean;
  capture?: boolean | string;
  cellPadding?: number | string;
  cellSpacing?: number | string;
  charSet?: string;
  challenge?: string;
  checked?: boolean;
  cite?: string;
  class?: string;
  className?: string;
  cols?: number;
  colSpan?: number;
  content?: string;
  contentEditable?: boolean;
  contextMenu?: string;
  controls?: boolean;
  controlsList?: string;
  coords?: string;
  crossOrigin?: string;
  data?: string;
  dateTime?: string;
  default?: boolean;
  defaultChecked?: boolean;
  defaultValue?: string;
  defer?: boolean;
  dir?: 'auto' | 'rtl' | 'ltr';
  disabled?: boolean;
  disableRemotePlayback?: boolean;
  download?: any;
  decoding?: 'sync' | 'async' | 'auto';
  draggable?: boolean;
  encType?: string;
  enterkeyhint?: 'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send';
  form?: string;
  formAction?: string;
  formEncType?: string;
  formMethod?: string;
  formNoValidate?: boolean;
  formTarget?: string;
  frameBorder?: number | string;
  headers?: string;
  height?: number | string;
  hidden?: boolean;
  high?: number;
  href?: string;
  hrefLang?: string;
  for?: string;
  htmlFor?: string;
  httpEquiv?: string;
  icon?: string;
  id?: string;
  inputMode?: string;
  integrity?: string;
  is?: string;
  keyParams?: string;
  keyType?: string;
  kind?: string;
  label?: string;
  lang?: string;
  list?: string;
  loading?: 'eager' | 'lazy';
  loop?: boolean;
  low?: number;
  manifest?: string;
  marginHeight?: number;
  marginWidth?: number;
  max?: number | string;
  maxLength?: number;
  media?: string;
  mediaGroup?: string;
  method?: string;
  min?: number | string;
  minLength?: number;
  multiple?: boolean;
  muted?: boolean;
  name?: string;
  nomodule?: boolean;
  nonce?: string;
  noValidate?: boolean;
  open?: boolean;
  optimum?: number;
  part?: string;
  pattern?: string;
  ping?: string;
  placeholder?: string;
  playsInline?: boolean;
  poster?: string;
  preload?: string;
  radioGroup?: string;
  readonly?: boolean;
  readOnly?: boolean;
  referrerpolicy?:
    | 'no-referrer'
    | 'no-referrer-when-downgrade'
    | 'origin'
    | 'origin-when-cross-origin'
    | 'same-origin'
    | 'strict-origin'
    | 'strict-origin-when-cross-origin'
    | 'unsafe-url';
  rel?: string;
  required?: boolean;
  reversed?: boolean;
  role?: string;
  rows?: number;
  rowSpan?: number;
  sandbox?: string;
  scope?: string;
  scoped?: boolean;
  scrolling?: string;
  seamless?: boolean;
  selected?: boolean;
  shape?: string;
  size?: number;
  sizes?: string;
  slot?: string;
  span?: number;
  spellcheck?: boolean;
  spellCheck?: boolean;
  src?: string;
  srcset?: string;
  srcDoc?: string;
  srcLang?: string;
  srcSet?: string;
  start?: number;
  step?: number | string;
  style?: string;
  summary?: string;
  tabIndex?: number;
  target?: string;
  title?: string;
  type?: string;
  useMap?: string;
  value?: string | string[] | number;
  volume?: string | number;
  width?: number | string;
  wmode?: string;
  wrap?: string;

  // Non-standard Attributes
  autocapitalize?: 'off' | 'none' | 'on' | 'sentences' | 'words' | 'characters';
  autoCapitalize?: 'off' | 'none' | 'on' | 'sentences' | 'words' | 'characters';
  disablePictureInPicture?: boolean;
  results?: number;
  translate?: 'yes' | 'no';

  // RDFa Attributes
  about?: string;
  datatype?: string;
  inlist?: any;
  prefix?: string;
  property?: string;
  resource?: string;
  typeof?: string;
  vocab?: string;

  // Microdata Attributes
  itemProp?: string;
  itemScope?: boolean;
  itemType?: string;
  itemID?: string;
  itemRef?: string;
}

export interface ARIAAttributes {
  'aria-autocomplete'?: 'none' | 'inline' | 'list' | 'both';
  'aria-checked'?: 'true' | 'false' | 'mixed';
  'aria-disabled'?: 'true' | 'false';
  'aria-errormessage'?: string;
  'aria-expanded'?: 'true' | 'false';
  'aria-haspopup'?: 'true' | 'false' | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';
  'aria-hidden'?: 'true' | 'false';
  'aria-invalid'?: 'grammar' | 'false' | 'spelling' | 'true';
  'aria-label'?: string;
  'aria-level'?: number;
  'aria-modal'?: 'true' | 'false';
  'aria-multiline'?: 'true' | 'false';
  'aria-multiselectable'?: 'true' | 'false';
  'aria-orientation'?: 'horizontal' | 'vertical';
  'aria-placeholder'?: string;
  'aria-pressed'?: 'true' | 'false' | 'mixed';
  'aria-readonly'?: 'true' | 'false';
  'aria-required'?: 'true' | 'false';
  'aria-selected'?: 'true' | 'false';
  'aria-sort'?: 'ascending' | 'descending' | 'none' | 'other';
  'aria-valuemin'?: number;
  'aria-valuemax'?: number;
  'aria-valuenow'?: number;
  'aria-valuetext'?: string;
  'aria-busy'?: 'true' | 'false';
  'aria-live'?: 'assertive' | 'polite' | 'off';
  'aria-relevant'?: 'all' | 'additions' | 'removals' | 'text' | 'additions text';
  'aria-atomic'?: 'true' | 'false';
  'aria-dropeffect'?: 'copy' | 'execute' | 'link' | 'move' | 'none' | 'popup';
  'aria-grabbed'?: 'true' | 'false';
  'aria-activedescendant'?: string;
  'aria-colcount'?: number;
  'aria-colindex'?: number;
  'aria-colspan'?: number;
  'aria-controls'?: string;
  'aria-describedby'?: string;
  'aria-description'?: string;
  'aria-details'?: string;
  'aria-flowto'?: string;
  'aria-labelledby'?: string;
  'aria-owns'?: string;
  'aria-posinet'?: number;
  'aria-rowcount'?: number;
  'aria-rowindex'?: number;
  'aria-rowspan'?: number;
  'aria-setsize'?: number;
  'aria-current'?: 'page' | 'step' | 'location' | 'date' | 'time' | 'true' | 'false';
  'aria-keyshortcuts'?: string;
  'aria-roledescription'?: string;
}

export type CSSValue = string | number | false | null | undefined;

export type CSSRecord = Record<string, CSSValue>;

export type AnyCSSVarAttribute = {
  [id: `$cssvar:${string}`]: CSSValue;
};

export type AnyCSSProperty = {
  [key: string]: CSSValue;
};

export type CSSProperties = AnyCSSProperty & {
  [P in keyof Omit<
    CSSStyleDeclaration,
    'item' | 'setProperty' | 'removeProperty' | 'getPropertyValue' | 'getPropertyPriority'
  >]?: CSSValue;
} & {
  cssText?: string | null;
};

export interface CSSStyles extends KebabCaseRecord<CSSProperties> {}

export interface ElementAttributesRecord
  extends NullableSignalOrValueRecord<HTMLAttrs>,
    NullableSignalOrValueRecord<ARIAAttributes>,
    NullableSignalOrValueRecord<AttrsRecord> {}

export interface ElementStylesRecord extends NullableSignalOrValueRecord<CSSStyles> {}

export type ElementCSSVarsRecord<CSSVars> = {
  [Var in keyof CSSVars as `--${Var & string}`]: SignalOrValue<CSSVars[Var]>;
};

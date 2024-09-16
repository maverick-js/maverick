/// <reference lib="dom" />
import type { ConditionalPick, HasRequiredKeys, IsAny, IsEmptyObject, IsNever } from 'type-fest';

import type { AnyComponent, ComponentRenderProps, NullableRecord, ReadSignal } from '../core';

type DOMNode = Node;
type DOMElement = Element;
type DOMEvent = Event;

declare global {
  /**
   * Store all global css variables in this interface so `var` and `$var` types can be inferred.
   *
   * @example
   * ```ts
   * declare global {
   *   interface MaverickCSSVarAttributes {
   *     foo: string;
   *   }
   * }
   * ```
   */
  interface MaverickCSSVarAttributes extends JSX.CSSRecord {}

  /**
   * Store all global events in this interface so `on` and `on_capture` types can be inferred.
   *
   * @example
   * ```ts
   * declare global {
   *   interface MaverickOnAttributes {
   *     foo: DOMEvent<number>;
   *   }
   * }
   * ```
   */
  interface MaverickOnAttributes extends HTMLElementEventMap {
    attached: Event;
  }

  /**
   * Store all custom element types in this interface so they can be used in JSX. This will also
   * include elements in the global `HTMLElementTagNameMap` interface so DOM API's such as
   * `querySelector` will be typed correctly.
   *
   * @example
   * ```ts
   * declare global {
   *   interface MaverickElements {
   *     'v-foo': FooElement
   *   }
   * }
   * ```
   */
  interface MaverickElements {}

  interface HTMLElementTagNameMap extends MaverickElements {}
}

export namespace JSX {
  /**
   * -------------------------------------------------------------------------------------------
   * Primitives
   * -------------------------------------------------------------------------------------------
   */

  export type SignalOrValue<T> = T | ReadSignal<T>;
  export type Stringify<P> = P extends string ? P : never;
  export type AttrValue = string | number | boolean | null | undefined;

  export interface AttrsRecord {
    [attrName: string]: AttrValue;
  }

  export type LowercaseRecord<T> = {
    [P in keyof T as Lowercase<Stringify<P>>]?: T[P] | null;
  };

  export interface IntrinsicAttributes {
    key?: any;
  }

  export type Node =
    | AnyComponent
    | DOMNode
    | DOMElement
    | DocumentFragment
    | string
    | number
    | boolean
    | null
    | undefined
    | Nodes
    | NodeFactory;

  export type Nodes = Node[];

  export interface NodeFactory {
    (): Node;
  }

  export type Element = Node | ReadSignal<Node>;

  export interface ElementAttributesProperty {
    jsxProps;
  }

  export interface ElementChildrenAttribute {
    children?: Element;
  }

  export interface ElementClass extends AnyComponent {
    render(props: ComponentRenderProps<any>): Node;
  }

  /**
   * -------------------------------------------------------------------------------------------
   * Props (prop)
   * -------------------------------------------------------------------------------------------
   */

  export type PropRecord = Record<string, any>;

  /**
   * Creates `prop:{name}` type definitions given a prop record.
   *
   * @example
   * ```ts
   * // { 'prop:foo': string, ... }
   * type Props = PropAttributes<{
   *   foo: string; // prop:foo
   *   bar: number; // prop:bar
   * }>
   * ```
   */
  export type PropAttributes<Props> = {
    [Prop in keyof Props as `prop:${Stringify<Prop>}`]?: Props[Prop];
  };

  /**
   * Creates `${name}` type definitions given a prop record.
   *
   * @example
   * ```ts
   * // { $foo: string | ReadSignal<string>; $bar: number | ReadSignal<number>; }
   * SignalAttributes<{
   *   foo: string; // $foo
   *   bar: number; // $bar
   * }>
   * ```
   */
  export type SignalOrValueAttributes<Props> = {
    [Prop in keyof Props as `$${Stringify<Prop>}`]?: SignalOrValue<Props[Prop]>;
  };

  /**
   * Creates `${name}` type definitions given a prop record.
   *
   * @example
   * ```ts
   * // { $foo: ReadSignal<string>; $bar: ReadSignal<number>; }
   * SignalAttributes<{
   *   foo: string; // $foo
   *   bar: number; // $bar
   * }>
   * ```
   */
  export type SignalAttributes<Props> = {
    [Prop in keyof Props as `$${Stringify<Prop>}`]?: ReadSignal<Props[Prop]>;
  };

  export interface InnerContentAttributes {
    innerHTML?: AttrValue;
    innerText?: AttrValue;
    textContent?: AttrValue;
  }

  export interface SignalInnerContentAttributes
    extends SignalOrValueAttributes<InnerContentAttributes> {}

  /**
   * -------------------------------------------------------------------------------------------
   * Ref (ref)
   * -------------------------------------------------------------------------------------------
   */

  export interface Ref<Element> {
    (ref: Element): void;
  }

  export type RefArray<Element> = ReadonlyArray<Ref<Element>>;

  export interface RefAttributes<Element> {
    ref?: Ref<Element> | RefArray<Element>;
  }

  /**
   * -------------------------------------------------------------------------------------------
   * Events (on)
   * -------------------------------------------------------------------------------------------
   */

  export type EventRecord = Record<string, Event>;

  export type TargetedEvent<Target extends EventTarget = EventTarget, EventType = Event> = Omit<
    EventType,
    'currentTarget'
  > & {
    readonly currentTarget: Target;
  };

  export type EventHandler<Event = DOMEvent> = {
    (this: never, event: Event): void;
  };

  export type TargetedEventHandler<Target extends EventTarget, Event> = JSX.EventHandler<
    JSX.TargetedEvent<Target, Event>
  >;

  /**
   * All global events with the event `currentTarget` set to the given generic `Target`.
   */
  export type TargetedGlobalEvents<Target extends EventTarget> = {
    [EventType in keyof MaverickOnAttributes]: TargetedEventHandler<
      Target,
      MaverickOnAttributes[EventType]
    >;
  };

  /**
   * Creates `on:{type}` and `on_capture:{type}` type definitions given an event record.
   *
   * @example
   * ```ts
   * // { 'on:foo': (event: CustomEvent<string>) => void; 'on_capture:foo', ... }
   * type Events = OnAttributes<{
   *   'foo': CustomEvent<string>;
   *   'baz-he': CustomEvent<number>;
   * }>
   * ```
   */
  export type OnAttributes<Target extends EventTarget = EventTarget, Events = EventRecord> = {
    [EventType in keyof Events as `on:${Stringify<EventType>}`]?:
      | TargetedEventHandler<Target, Events[EventType]>
      | true;
  };

  export type OnCaptureAttributes<
    Target extends EventTarget = EventTarget,
    Events = EventRecord,
  > = {
    [EventType in keyof Events as `on_capture:${Stringify<EventType>}`]?:
      | TargetedEventHandler<Target, Events[EventType]>
      | true;
  };

  /**
   * -------------------------------------------------------------------------------------------
   * Class (class)
   * -------------------------------------------------------------------------------------------
   */

  export type ClassValue = any;

  export type ClassAttributes = Record<`class:${string}`, boolean>;

  export interface SignalClassAttributes
    extends Record<`$class:${string}`, boolean | ReadSignal<boolean>> {}

  /**
   * -------------------------------------------------------------------------------------------
   * CSS (style and var)
   * -------------------------------------------------------------------------------------------
   */

  export type CSSValue = string | number | false | null | undefined;

  export type CSSRecord = Record<string, CSSValue>;

  export type AnyCSSVarAttribute = {
    [id: `var:${string}`]: CSSValue;
  };

  export type StyleAttributes = {
    [Prop in keyof CSSProperties as `style:${Stringify<Prop>}`]: CSSProperties[Prop];
  };

  export interface SignalStyleAttributes extends SignalOrValueAttributes<StyleAttributes> {}

  export type AnyCSSProperty = {
    [key: string]: CSSValue;
  };

  export type CSSProperties = AnyCSSProperty &
    HTMLCSSProperties & {
      cssText?: string | null;
    };

  /**
   * Creates `var:{name}` type definitions given CSS variable record.
   *
   * @example
   * ```ts
   * // { 'var:foo': string | ReadSignal<string>, 'var:baz-he': ... }
   * type Vars = CSSVarAttributes<{
   *   foo: string; // foo
   *   bazHe: number; // baz-he
   * }>
   * ```
   */
  export type CSSVarAttributes<Variables> = {
    [Var in keyof Variables as `var:${Stringify<Var>}`]?: Variables[Var] | null;
  } & AnyCSSVarAttribute;

  export type SignalCSSVarAttributes<Variables> = SignalOrValueAttributes<
    CSSVarAttributes<Variables>
  >;

  export interface GlobalCSSVarAttributes
    extends CSSVarAttributes<MaverickCSSVarAttributes>,
      SignalCSSVarAttributes<MaverickCSSVarAttributes> {}

  /**
   * -------------------------------------------------------------------------------------------
   * HTML
   * -------------------------------------------------------------------------------------------
   */

  export type HTMLPropAttributes<Props extends PropRecord> = PropAttributes<NullableRecord<Props>> &
    SignalOrValueAttributes<PropAttributes<NullableRecord<Props>>> &
    HTMLAttrsRecord<Props> &
    SignalOrValueAttributes<HTMLAttrsRecord<Props>>;

  export type HTMLAttrsRecord<Props> = LowercaseRecord<ConditionalPick<Props, AttrValue>>;

  export interface HTMLAttrs extends HTMLAttrsRecord<HTMLProperties> {}

  export interface HTMLAttributes extends HTMLPropAttributes<HTMLProperties> {
    children?: Element;
  }

  export type HTMLCSSProperties = {
    [P in keyof Omit<
      CSSStyleDeclaration,
      'item' | 'setProperty' | 'removeProperty' | 'getPropertyValue' | 'getPropertyPriority'
    >]?: CSSValue;
  };

  export type DataAttributes = {
    [attr: `data-${string}`]: AttrValue;
  };

  export type SignalDataAttributes = {
    [attr: `$data-${string}`]: AttrValue | ReadSignal<AttrValue>;
  };

  export interface HTMLElementAttributes
    extends HTMLAttributes,
      ClassAttributes,
      SignalClassAttributes,
      StyleAttributes,
      SignalStyleAttributes,
      ARIAAttributes,
      SignalARIAAttributes,
      DataAttributes,
      SignalDataAttributes,
      InnerContentAttributes,
      SignalInnerContentAttributes,
      GlobalCSSVarAttributes {}

  export type ComponentAttributes<
    Props = {},
    Events = {},
    CSSVars = {},
    Slots = {},
  > = Partial<Props> &
    ClassAttributes &
    SignalClassAttributes &
    CSSVarAttributes<CSSVars> &
    SignalCSSVarAttributes<CSSVars> &
    GlobalCSSVarAttributes &
    OnAttributes<EventTarget, Events> & {
      class?: string;
    } & ComponentChildrenProp<Slots>;

  export type ComponentChildrenProp<Slots> =
    IsEmptyObject<Slots> extends true
      ? {}
      : IsNever<Slots> extends true
        ? {}
        : IsAny<Slots> extends true
          ? { children?: JSX.Element }
          : HasRequiredKeys<Slots & {}> extends true
            ? { children: JSX.Element }
            : { children?: JSX.Element };

  export interface HTMLMarqueeElement extends HTMLElement, HTMLMarqueeElementProperties {}

  export interface HTMLMarqueeElementProperties {
    behavior?: 'scroll' | 'slide' | 'alternate';
    bgColor?: string;
    direction?: 'left' | 'right' | 'up' | 'down';
    height?: number | string;
    hspace?: number | string;
    loop?: number | string;
    scrollAmount?: number | string;
    scrollDelay?: number | string;
    trueSpeed?: boolean;
    vspace?: number | string;
    width?: number | string;
  }

  export interface HTMLMarqueeElementAttributes
    extends HTMLPropAttributes<HTMLMarqueeElementProperties> {}

  export interface HTMLInputElementAttributes extends IntrinsicElementAttributes<HTMLInputElement> {
    defaultValue?: string;
  }

  export interface HTMLProperties {
    // Standard HTML Attributes
    accept?: string;
    acceptCharset?: string;
    accessKey?: string;
    action?: string;
    allow?: string;
    allowFullScreen?: boolean;
    allowTransparency?: boolean;
    as?: string;
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

  /**
   * -------------------------------------------------------------------------------------------
   * SVG
   * -------------------------------------------------------------------------------------------
   */

  export interface SVGAttributes extends Pick<SVGProperties, CamelCaseSVGProperties> {}

  export interface SVGElementAttributes<Element extends DOMElement = SVGElement>
    extends IntrinsicElementAttributes<Element>,
      SVGAttributes {}

  export interface PathAttributes {
    d: string;
  }

  export type KebabCaseSVGProperties =
    | 'accentHeight'
    | 'alignmentBaseline'
    | 'arabicForm'
    | 'baselineShift'
    | 'capHeight'
    | 'clipPath'
    | 'clipRule'
    | 'colorInterpolation'
    | 'colorInterpolationFilters'
    | 'colorProfile'
    | 'dominantBaseline'
    | 'enableBackground'
    | 'fillOpacity'
    | 'fillRule'
    | 'floodColor'
    | 'floodOpacity'
    | 'fontFamily'
    | 'fontSize'
    | 'fontSizeAdjust'
    | 'fontStretch'
    | 'fontStyle'
    | 'fontVariant'
    | 'fontWeight'
    | 'glyphName'
    | 'glyphOrientationHorizontal'
    | 'glyphOrientationVertical'
    | 'horizAdvX'
    | 'horizOriginX'
    | 'imageRendering'
    | 'letterSpacing'
    | 'lightingColor'
    | 'markerEnd'
    | 'markerMid'
    | 'markerStart'
    | 'overlinePosition'
    | 'overlineThickness'
    | 'panose1'
    | 'paintOrder'
    | 'pointerEvents'
    | 'shapeRendering'
    | 'stopColor'
    | 'stopOpacity'
    | 'strikethroughPosition'
    | 'strikethroughThickness'
    | 'strokeDasharray'
    | 'strokeDashoffset'
    | 'strokeLinecap'
    | 'strokeLinejoin'
    | 'strokeMiterlimit'
    | 'strokeOpacity'
    | 'strokeWidth'
    | 'textAnchor'
    | 'textDecoration'
    | 'textRendering'
    | 'transformOrigin'
    | 'underlinePosition'
    | 'underlineThickness'
    | 'unicodeBidi'
    | 'unicodeRange'
    | 'unitsPerEm'
    | 'vAlphabetic'
    | 'vHanging'
    | 'vIdeographic'
    | 'vMathematical'
    | 'vectorEffect'
    | 'vertAdvY'
    | 'vertOriginX'
    | 'vertOriginY'
    | 'wordSpacing'
    | 'writingMode'
    | 'xHeight';

  export type CamelCaseSVGProperties =
    | 'attributeName'
    | 'attributeType'
    | 'baseFrequency'
    | 'baseProfile'
    | 'calcMode'
    | 'clipPathUnits'
    | 'contentScriptType'
    | 'contentStyleType'
    | 'diffuseConstant'
    | 'edgeMode'
    | 'filterRes'
    | 'filterUnits'
    | 'glyphRef'
    | 'gradientTransform'
    | 'gradientUnits'
    | 'kernelMatrix'
    | 'kernelUnitLength'
    | 'keyPoints'
    | 'keySplines'
    | 'keyTimes'
    | 'lengthAdjust'
    | 'limitingConeAngle'
    | 'markerHeight'
    | 'markerUnits'
    | 'markerWidth'
    | 'maskContentUnits'
    | 'maskUnits'
    | 'numOctaves'
    | 'pathLength'
    | 'patternContentUnits'
    | 'patternTransform'
    | 'patternUnits'
    | 'pointsAtX'
    | 'pointsAtY'
    | 'pointsAtZ'
    | 'preserveAlpha'
    | 'preserveAspectRatio'
    | 'primitiveUnits'
    | 'repeatCount'
    | 'repeatDur'
    | 'requiredFeatures'
    | 'specularConstant'
    | 'specularExponent'
    | 'spreadMethod'
    | 'startOffset'
    | 'stdDeviation'
    | 'stitchTiles'
    | 'surfaceScale'
    | 'systemLanguage'
    | 'tableValues'
    | 'textLength'
    | 'viewBox'
    | 'viewTarget'
    | 'xChannelSelector'
    | 'yChannelSelector'
    | 'zoomAndPan';

  export interface SVGProperties {
    accentHeight?: number | string;
    accumulate?: 'none' | 'sum';
    additive?: 'replace' | 'sum';
    alignmentBaseline?:
      | 'auto'
      | 'baseline'
      | 'before-edge'
      | 'text-before-edge'
      | 'middle'
      | 'central'
      | 'after-edge'
      | 'text-after-edge'
      | 'ideographic'
      | 'alphabetic'
      | 'hanging'
      | 'mathematical'
      | 'inherit';
    allowReorder?: 'no' | 'yes';
    alphabetic?: number | string;
    amplitude?: number | string;
    arabicForm?: 'initial' | 'medial' | 'terminal' | 'isolated';
    ascent?: number | string;
    attributeName?: string;
    attributeType?: string;
    autoReverse?: number | string;
    azimuth?: number | string;
    baseFrequency?: number | string;
    baselineShift?: number | string;
    baseProfile?: number | string;
    bbox?: number | string;
    begin?: number | string;
    bias?: number | string;
    by?: number | string;
    calcMode?: number | string;
    capHeight?: number | string;
    clip?: number | string;
    clipPath?: string;
    clipPathUnits?: number | string;
    clipRule?: number | string;
    colorInterpolation?: number | string;
    colorInterpolationFilters?: 'auto' | 'sRGB' | 'linearRGB' | 'inherit';
    colorProfile?: number | string;
    colorRendering?: number | string;
    contentScriptType?: number | string;
    contentStyleType?: number | string;
    cursor?: number | string;
    cx?: number | string;
    cy?: number | string;
    d?: string;
    decelerate?: number | string;
    descent?: number | string;
    diffuseConstant?: number | string;
    direction?: number | string;
    display?: number | string;
    divisor?: number | string;
    dominantBaseline?: number | string;
    dur?: number | string;
    dx?: number | string;
    dy?: number | string;
    edgeMode?: number | string;
    elevation?: number | string;
    enableBackground?: number | string;
    end?: number | string;
    exponent?: number | string;
    externalResourcesRequired?: number | string;
    fill?: string;
    fillOpacity?: number | string;
    fillRule?: 'nonzero' | 'evenodd' | 'inherit';
    filter?: string;
    filterRes?: number | string;
    filterUnits?: number | string;
    floodColor?: number | string;
    floodOpacity?: number | string;
    focusable?: number | string;
    fontFamily?: string;
    fontSize?: number | string;
    fontSizeAdjust?: number | string;
    fontStretch?: number | string;
    fontStyle?: number | string;
    fontVariant?: number | string;
    fontWeight?: number | string;
    format?: number | string;
    from?: number | string;
    fx?: number | string;
    fy?: number | string;
    g1?: number | string;
    g2?: number | string;
    glyphName?: number | string;
    glyphOrientationHorizontal?: number | string;
    glyphOrientationVertical?: number | string;
    glyphRef?: number | string;
    gradientTransform?: string;
    gradientUnits?: string;
    hanging?: number | string;
    horizAdvX?: number | string;
    horizOriginX?: number | string;
    ideographic?: number | string;
    imageRendering?: number | string;
    in2?: number | string;
    in?: string;
    intercept?: number | string;
    k1?: number | string;
    k2?: number | string;
    k3?: number | string;
    k4?: number | string;
    k?: number | string;
    kernelMatrix?: number | string;
    kernelUnitLength?: number | string;
    kerning?: number | string;
    keyPoints?: number | string;
    keySplines?: number | string;
    keyTimes?: number | string;
    lengthAdjust?: number | string;
    letterSpacing?: number | string;
    lightingColor?: number | string;
    limitingConeAngle?: number | string;
    local?: number | string;
    markerEnd?: string;
    markerHeight?: number | string;
    markerMid?: string;
    markerStart?: string;
    markerUnits?: number | string;
    markerWidth?: number | string;
    mask?: string;
    maskContentUnits?: number | string;
    maskUnits?: number | string;
    mathematical?: number | string;
    mode?: number | string;
    numOctaves?: number | string;
    offset?: number | string;
    opacity?: number | string;
    operator?: number | string;
    order?: number | string;
    orient?: number | string;
    orientation?: number | string;
    origin?: number | string;
    overflow?: number | string;
    overlinePosition?: number | string;
    overlineThickness?: number | string;
    paintOrder?: number | string;
    panose1?: number | string;
    pathLength?: number | string;
    patternContentUnits?: string;
    patternTransform?: number | string;
    patternUnits?: string;
    pointerEvents?: number | string;
    points?: string;
    pointsAtX?: number | string;
    pointsAtY?: number | string;
    pointsAtZ?: number | string;
    preserveAlpha?: number | string;
    preserveAspectRatio?: string;
    primitiveUnits?: number | string;
    r?: number | string;
    radius?: number | string;
    refX?: number | string;
    refY?: number | string;
    renderingIntent?: number | string;
    repeatCount?: number | string;
    repeatDur?: number | string;
    requiredExtensions?: number | string;
    requiredFeatures?: number | string;
    restart?: number | string;
    result?: string;
    rotate?: number | string;
    rx?: number | string;
    ry?: number | string;
    scale?: number | string;
    seed?: number | string;
    shapeRendering?: number | string;
    slope?: number | string;
    spacing?: number | string;
    specularConstant?: number | string;
    specularExponent?: number | string;
    speed?: number | string;
    spreadMethod?: string;
    startOffset?: number | string;
    stdDeviation?: number | string;
    stemh?: number | string;
    stemv?: number | string;
    stitchTiles?: number | string;
    stopColor?: string;
    stopOpacity?: number | string;
    strikethroughPosition?: number | string;
    strikethroughThickness?: number | string;
    string?: number | string;
    stroke?: string;
    strokeDasharray?: string | number;
    strokeDashoffset?: string | number;
    strokeLinecap?: 'butt' | 'round' | 'square' | 'inherit';
    strokeLinejoin?: 'miter' | 'round' | 'bevel' | 'inherit';
    strokeMiterlimit?: string | number;
    strokeOpacity?: number | string;
    strokeWidth?: number | string;
    surfaceScale?: number | string;
    systemLanguage?: number | string;
    tableValues?: number | string;
    targetX?: number | string;
    targetY?: number | string;
    textAnchor?: string;
    textDecoration?: number | string;
    textLength?: number | string;
    textRendering?: number | string;
    to?: number | string;
    transform?: string;
    transformOrigin?: string;
    u1?: number | string;
    u2?: number | string;
    underlinePosition?: number | string;
    underlineThickness?: number | string;
    unicode?: number | string;
    unicodeBidi?: number | string;
    unicodeRange?: number | string;
    unitsPerEm?: number | string;
    vAlphabetic?: number | string;
    values?: string;
    vectorEffect?: number | string;
    version?: string;
    vertAdvY?: number | string;
    vertOriginX?: number | string;
    vertOriginY?: number | string;
    vHanging?: number | string;
    vIdeographic?: number | string;
    viewBox?: string;
    viewTarget?: number | string;
    visibility?: number | string;
    vMathematical?: number | string;
    widths?: number | string;
    wordSpacing?: number | string;
    writingMode?: number | string;
    x1?: number | string;
    x2?: number | string;
    x?: number | string;
    xChannelSelector?: string;
    xHeight?: number | string;
    xlinkActuate?: string;
    xlinkArcrole?: string;
    xlinkHref?: string;
    xlinkRole?: string;
    xlinkShow?: string;
    xlinkTitle?: string;
    xlinkType?: string;
    xmlBase?: string;
    xmlLang?: string;
    xmlns?: string;
    xmlnsXlink?: string;
    xmlSpace?: string;
    y1?: number | string;
    y2?: number | string;
    y?: number | string;
    yChannelSelector?: string;
    z?: number | string;
    zoomAndPan?: string;
  }

  /**
   * -------------------------------------------------------------------------------------------
   * Intrinsics
   * -------------------------------------------------------------------------------------------
   */

  export interface IntrinsicClassAttributes<T> extends RefAttributes<T> {}

  export interface IntrinsicElementAttributes<Element extends DOMElement>
    extends HTMLElementAttributes,
      RefAttributes<Element>,
      OnAttributes<Element, MaverickOnAttributes>,
      OnCaptureAttributes<Element, MaverickOnAttributes> {}

  export interface IntrinsicElements {
    // HTML
    a: IntrinsicElementAttributes<HTMLAnchorElement>;
    abbr: IntrinsicElementAttributes<HTMLElement>;
    address: IntrinsicElementAttributes<HTMLElement>;
    area: IntrinsicElementAttributes<HTMLAreaElement>;
    article: IntrinsicElementAttributes<HTMLElement>;
    aside: IntrinsicElementAttributes<HTMLElement>;
    audio: IntrinsicElementAttributes<HTMLAudioElement>;
    b: IntrinsicElementAttributes<HTMLElement>;
    base: IntrinsicElementAttributes<HTMLBaseElement>;
    bdi: IntrinsicElementAttributes<HTMLElement>;
    bdo: IntrinsicElementAttributes<HTMLElement>;
    big: IntrinsicElementAttributes<HTMLElement>;
    blockquote: IntrinsicElementAttributes<HTMLQuoteElement>;
    body: IntrinsicElementAttributes<HTMLBodyElement>;
    br: IntrinsicElementAttributes<HTMLBRElement>;
    button: IntrinsicElementAttributes<HTMLButtonElement>;
    canvas: IntrinsicElementAttributes<HTMLCanvasElement>;
    caption: IntrinsicElementAttributes<HTMLTableCaptionElement>;
    cite: IntrinsicElementAttributes<HTMLElement>;
    code: IntrinsicElementAttributes<HTMLElement>;
    col: IntrinsicElementAttributes<HTMLTableColElement>;
    colgroup: IntrinsicElementAttributes<HTMLTableColElement>;
    data: IntrinsicElementAttributes<HTMLDataElement>;
    datalist: IntrinsicElementAttributes<HTMLDataListElement>;
    dd: IntrinsicElementAttributes<HTMLElement>;
    del: IntrinsicElementAttributes<HTMLModElement>;
    details: IntrinsicElementAttributes<HTMLDetailsElement>;
    dfn: IntrinsicElementAttributes<HTMLElement>;
    dialog: IntrinsicElementAttributes<HTMLDialogElement>;
    div: IntrinsicElementAttributes<HTMLDivElement>;
    dl: IntrinsicElementAttributes<HTMLDListElement>;
    dt: IntrinsicElementAttributes<HTMLElement>;
    em: IntrinsicElementAttributes<HTMLElement>;
    embed: IntrinsicElementAttributes<HTMLEmbedElement>;
    fieldset: IntrinsicElementAttributes<HTMLFieldSetElement>;
    figcaption: IntrinsicElementAttributes<HTMLElement>;
    figure: IntrinsicElementAttributes<HTMLElement>;
    footer: IntrinsicElementAttributes<HTMLElement>;
    form: IntrinsicElementAttributes<HTMLFormElement>;
    h1: IntrinsicElementAttributes<HTMLHeadingElement>;
    h2: IntrinsicElementAttributes<HTMLHeadingElement>;
    h3: IntrinsicElementAttributes<HTMLHeadingElement>;
    h4: IntrinsicElementAttributes<HTMLHeadingElement>;
    h5: IntrinsicElementAttributes<HTMLHeadingElement>;
    h6: IntrinsicElementAttributes<HTMLHeadingElement>;
    head: IntrinsicElementAttributes<HTMLHeadElement>;
    header: IntrinsicElementAttributes<HTMLElement>;
    hgroup: IntrinsicElementAttributes<HTMLElement>;
    hr: IntrinsicElementAttributes<HTMLHRElement>;
    html: IntrinsicElementAttributes<HTMLHtmlElement>;
    i: IntrinsicElementAttributes<HTMLElement>;
    iframe: IntrinsicElementAttributes<HTMLIFrameElement>;
    img: IntrinsicElementAttributes<HTMLImageElement>;
    input: HTMLInputElementAttributes;
    ins: IntrinsicElementAttributes<HTMLModElement>;
    kbd: IntrinsicElementAttributes<HTMLElement>;
    keygen: IntrinsicElementAttributes<HTMLUnknownElement>;
    label: IntrinsicElementAttributes<HTMLLabelElement>;
    legend: IntrinsicElementAttributes<HTMLLegendElement>;
    li: IntrinsicElementAttributes<HTMLLIElement>;
    link: IntrinsicElementAttributes<HTMLLinkElement>;
    main: IntrinsicElementAttributes<HTMLElement>;
    map: IntrinsicElementAttributes<HTMLMapElement>;
    mark: IntrinsicElementAttributes<HTMLElement>;
    marquee: IntrinsicElementAttributes<HTMLMarqueeElement> & HTMLMarqueeElementAttributes;
    menu: IntrinsicElementAttributes<HTMLMenuElement>;
    menuitem: IntrinsicElementAttributes<HTMLUnknownElement>;
    meta: IntrinsicElementAttributes<HTMLMetaElement>;
    meter: IntrinsicElementAttributes<HTMLMeterElement>;
    nav: IntrinsicElementAttributes<HTMLElement>;
    noscript: IntrinsicElementAttributes<HTMLElement>;
    object: IntrinsicElementAttributes<HTMLObjectElement>;
    ol: IntrinsicElementAttributes<HTMLOListElement>;
    optgroup: IntrinsicElementAttributes<HTMLOptGroupElement>;
    option: IntrinsicElementAttributes<HTMLOptionElement>;
    output: IntrinsicElementAttributes<HTMLOutputElement>;
    p: IntrinsicElementAttributes<HTMLParagraphElement>;
    param: IntrinsicElementAttributes<HTMLParamElement>;
    picture: IntrinsicElementAttributes<HTMLPictureElement>;
    pre: IntrinsicElementAttributes<HTMLPreElement>;
    progress: IntrinsicElementAttributes<HTMLProgressElement>;
    q: IntrinsicElementAttributes<HTMLQuoteElement>;
    rp: IntrinsicElementAttributes<HTMLElement>;
    rt: IntrinsicElementAttributes<HTMLElement>;
    ruby: IntrinsicElementAttributes<HTMLElement>;
    s: IntrinsicElementAttributes<HTMLElement>;
    samp: IntrinsicElementAttributes<HTMLElement>;
    script: IntrinsicElementAttributes<HTMLScriptElement>;
    section: IntrinsicElementAttributes<HTMLElement>;
    select: IntrinsicElementAttributes<HTMLSelectElement>;
    slot: IntrinsicElementAttributes<HTMLSlotElement>;
    small: IntrinsicElementAttributes<HTMLElement>;
    source: IntrinsicElementAttributes<HTMLSourceElement>;
    span: IntrinsicElementAttributes<HTMLSpanElement>;
    strong: IntrinsicElementAttributes<HTMLElement>;
    style: IntrinsicElementAttributes<HTMLStyleElement>;
    sub: IntrinsicElementAttributes<HTMLElement>;
    summary: IntrinsicElementAttributes<HTMLElement>;
    sup: IntrinsicElementAttributes<HTMLElement>;
    table: IntrinsicElementAttributes<HTMLTableElement>;
    tbody: IntrinsicElementAttributes<HTMLTableSectionElement>;
    td: IntrinsicElementAttributes<HTMLTableCellElement>;
    textarea: IntrinsicElementAttributes<HTMLTextAreaElement>;
    tfoot: IntrinsicElementAttributes<HTMLTableSectionElement>;
    th: IntrinsicElementAttributes<HTMLTableCellElement>;
    thead: IntrinsicElementAttributes<HTMLTableSectionElement>;
    time: IntrinsicElementAttributes<HTMLTimeElement>;
    title: IntrinsicElementAttributes<HTMLTitleElement>;
    tr: IntrinsicElementAttributes<HTMLTableRowElement>;
    track: IntrinsicElementAttributes<HTMLTrackElement>;
    u: IntrinsicElementAttributes<HTMLElement>;
    ul: IntrinsicElementAttributes<HTMLUListElement>;
    var: IntrinsicElementAttributes<HTMLElement>;
    video: IntrinsicElementAttributes<HTMLVideoElement>;
    wbr: IntrinsicElementAttributes<HTMLElement>;

    //SVG
    svg: SVGElementAttributes<SVGSVGElement>;
    animate: SVGElementAttributes<SVGAnimateElement>;
    circle: SVGElementAttributes<SVGCircleElement>;
    animateTransform: SVGElementAttributes<SVGAnimateElement>;
    clipPath: SVGElementAttributes<SVGClipPathElement>;
    defs: SVGElementAttributes<SVGDefsElement>;
    desc: SVGElementAttributes<SVGDescElement>;
    ellipse: SVGElementAttributes<SVGEllipseElement>;
    feBlend: SVGElementAttributes<SVGFEBlendElement>;
    feColorMatrix: SVGElementAttributes<SVGFEColorMatrixElement>;
    feComponentTransfer: SVGElementAttributes<SVGFEComponentTransferElement>;
    feComposite: SVGElementAttributes<SVGFECompositeElement>;
    feConvolveMatrix: SVGElementAttributes<SVGFEConvolveMatrixElement>;
    feDiffuseLighting: SVGElementAttributes<SVGFEDiffuseLightingElement>;
    feDisplacementMap: SVGElementAttributes<SVGFEDisplacementMapElement>;
    feDropShadow: SVGElementAttributes<SVGFEDropShadowElement>;
    feFlood: SVGElementAttributes<SVGFEFloodElement>;
    feFuncA: SVGElementAttributes<SVGFEFuncAElement>;
    feFuncB: SVGElementAttributes<SVGFEFuncBElement>;
    feFuncG: SVGElementAttributes<SVGFEFuncGElement>;
    feFuncR: SVGElementAttributes<SVGFEFuncRElement>;
    feGaussianBlur: SVGElementAttributes<SVGFEGaussianBlurElement>;
    feImage: SVGElementAttributes<SVGFEImageElement>;
    feMerge: SVGElementAttributes<SVGFEMergeElement>;
    feMergeNode: SVGElementAttributes<SVGFEMergeNodeElement>;
    feMorphology: SVGElementAttributes<SVGFEMorphologyElement>;
    feOffset: SVGElementAttributes<SVGFEOffsetElement>;
    feSpecularLighting: SVGElementAttributes<SVGFESpecularLightingElement>;
    feTile: SVGElementAttributes<SVGFETileElement>;
    feTurbulence: SVGElementAttributes<SVGFETurbulenceElement>;
    filter: SVGElementAttributes<SVGFilterElement>;
    foreignObject: SVGElementAttributes<SVGForeignObjectElement>;
    g: SVGElementAttributes<SVGGElement>;
    image: SVGElementAttributes<SVGImageElement>;
    line: SVGElementAttributes<SVGLineElement>;
    linearGradient: SVGElementAttributes<SVGLinearGradientElement>;
    marker: SVGElementAttributes<SVGMarkerElement>;
    mask: SVGElementAttributes<SVGMaskElement>;
    path: SVGElementAttributes<SVGPathElement>;
    pattern: SVGElementAttributes<SVGPatternElement>;
    polygon: SVGElementAttributes<SVGPolygonElement>;
    polyline: SVGElementAttributes<SVGPolylineElement>;
    radialGradient: SVGElementAttributes<SVGRadialGradientElement>;
    rect: SVGElementAttributes<SVGRectElement>;
    stop: SVGElementAttributes<SVGStopElement>;
    symbol: SVGElementAttributes<SVGSymbolElement>;
    text: SVGElementAttributes<SVGTextElement>;
    textPath: SVGElementAttributes<SVGTextPathElement>;
    tspan: SVGElementAttributes<SVGTSpanElement>;
    use: SVGElementAttributes<SVGUseElement>;
  }

  /**
   * -------------------------------------------------------------------------------------------
   * ARIA
   * -------------------------------------------------------------------------------------------
   */

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

  export interface SignalARIAAttributes extends SignalOrValueAttributes<ARIAAttributes> {}
}

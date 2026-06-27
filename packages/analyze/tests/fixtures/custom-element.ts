import { createElementClass } from "@maverick-js/element";

import { TestComponent } from "./component";

/**
 * Something about this element.
 *
 * @tag foo
 * @slot This is the default slot.
 * @slot foo - This is the foo slot.
 * @csspart foo - This is the foo CSS Part.
 * @csspart bar - This is the bar CSS Part.
 */
export class TestElement extends createElementClass(TestComponent) {}

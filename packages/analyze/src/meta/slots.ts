import kleur from 'kleur';

import { filterArrayUnique } from '../../utils/array';
import { LogLevel, reportDiagnosticByNode } from '../../utils/logger';
import type { DocTagMeta } from './component';
import type { SlotMeta } from './custom-element';
import { splitJsDocTagText } from './doctags';
import { TS_NODE_SYMBOL } from './symbols';

export function buildSlotsMeta(doctags?: DocTagMeta[]): SlotMeta[] | undefined {
  if (!doctags) return undefined;

  let defaultSlots = 0;
  let hasSeenDefaultSlot = false;

  const slots = doctags.filter((tag) => tag.name === 'slot').map((tag) => splitJsDocTagText(tag));

  const filtered = filterArrayUnique(slots, 'title', {
    onDuplicateFound: (slot) => {
      reportDiagnosticByNode(
        `Found duplicate \`@slot\` tags with the name \`${slot.title}\`.`,
        slot[TS_NODE_SYMBOL],
        LogLevel.Warn,
      );
    },
  }).map((slot) => {
    const isDefaultSlot = !slot.title;

    if (isDefaultSlot && hasSeenDefaultSlot) {
      reportDiagnosticByNode(
        [
          'Non default `@slot` tag is missing a title.',
          `\n${kleur.bold('EXAMPLE')}\n\n@slot body - Used to pass in the body of this component.`,
        ].join('\n'),
        slot[TS_NODE_SYMBOL],
        LogLevel.Warn,
      );
    }

    if (isDefaultSlot) {
      defaultSlots += 1;
      hasSeenDefaultSlot = true;
    }

    return {
      [TS_NODE_SYMBOL]: slot[TS_NODE_SYMBOL],
      name: isDefaultSlot && defaultSlots === 1 ? undefined : (slot.title ?? ''),
      docs: slot.description.replace(/^-\s/, '') ?? '',
    };
  });

  return filtered.length > 0 ? filtered : undefined;
}

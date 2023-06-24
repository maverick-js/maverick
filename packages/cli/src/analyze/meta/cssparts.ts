import type { DocTagMeta } from './component';
import { buildMetaFromDocTags } from './doctags';
import type { CSSPartMeta } from './element';

export function buildCSSPartsMeta(doctags?: DocTagMeta[]): CSSPartMeta[] | undefined {
  if (!doctags) return undefined;

  const cssParts = buildMetaFromDocTags(
    doctags,
    'csspart',
    '@csspart container - The root container of this component.',
  );

  return cssParts.length > 0 ? cssParts : undefined;
}

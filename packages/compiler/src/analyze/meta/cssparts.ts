import { type CSSPartMeta, type DocTagMeta } from './component';
import { buildMetaFromDocTags } from './doctags';

export function buildCSSPartsMeta(doctags?: DocTagMeta[]): CSSPartMeta[] | undefined {
  return doctags
    ? buildMetaFromDocTags(
        doctags,
        'csspart',
        '@csspart container - The root container of this component.',
      )
    : undefined;
}

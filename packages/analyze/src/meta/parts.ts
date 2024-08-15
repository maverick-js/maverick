import type { DocTagMeta, PartMeta } from './component';
import { buildMetaFromDocTags } from './doctags';

export function buildPartsMeta(doctags?: DocTagMeta[]): PartMeta[] | undefined {
  if (!doctags) return undefined;

  const parts = buildMetaFromDocTags(
    doctags,
    'part',
    '@part container - The root container of this component.',
  );

  return parts.length > 0 ? parts : undefined;
}

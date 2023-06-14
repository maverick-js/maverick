import kleur from 'kleur';
import { dirname, normalize, resolve } from 'pathe';
import type ts from 'typescript';

import { filterArrayUnique } from '../../utils/array';
import { LogLevel, reportDiagnosticByNode } from '../../utils/logger';
import { escapeQuotes } from '../../utils/str';
import { type DocTagMeta, TS_NODE } from './component';

export function splitJsDocTagText(tag: DocTagMeta) {
  const [title, description] = (tag.text?.split(' - ') ?? []).map((s) => s.trim());
  return {
    [TS_NODE]: tag[TS_NODE],
    title: !description ? undefined : title,
    description: !description ? title : description,
  };
}

export function resolveDocTagText(node: ts.Node, text?: string | ts.Node[]) {
  // This resolves the case where a doc tag is nested (e.g., `@see {@link ...}`)
  if (typeof text === 'object') {
    // @ts-expect-error - .
    text = text.find((text) => !!text.name).text as string;
    return text?.startsWith('://') ? `https${text}` : text;
  }

  if (!text || !/^('|")?(\.\/|\.\.\/)/.test(text ?? '')) return text;

  const filePath = normalize(node.getSourceFile().fileName);
  const textPath = escapeQuotes(text);

  return resolve(dirname(filePath), textPath);
}

export const getDocTags = (node?: ts.Node): DocTagMeta[] | undefined => {
  if (!node) return undefined;
  const tags = (node as any).jsDoc?.[0]?.tags;
  return tags?.map((docTagNode: any) => ({
    [TS_NODE]: docTagNode,
    name: docTagNode.tagName.escapedText,
    text: resolveDocTagText(node, docTagNode.comment),
  }));
};

export const findDocTag = (tags: DocTagMeta[], name: string): DocTagMeta | undefined =>
  tags.find((tag) => tag.name === name);

export const hasDocTag = (tags: DocTagMeta[], name: string): boolean =>
  tags.some((tag) => tag.name === name);

export function buildMetaFromDocTags(doctags: DocTagMeta[], tagName: string, example: string) {
  const tags = doctags.filter((tag) => tag.name === tagName).map((tag) => splitJsDocTagText(tag));

  return filterArrayUnique(tags, 'title', {
    onDuplicateFound: (tag) => {
      reportDiagnosticByNode(
        `Found duplicate \`@${tagName}\` tags with the name \`${tag.title}\`.`,
        tag[TS_NODE],
        LogLevel.Warn,
      );
    },
  }).map((tag) => {
    if (!tag.title) {
      reportDiagnosticByNode(
        [
          `Tag \`@${tagName}\` is missing a title.`,
          `\n${kleur.bold('EXAMPLE')}\n\n${example}`,
        ].join('\n'),
        tag[TS_NODE],
        LogLevel.Warn,
      );
    }

    if (tag.title && !tag.description) {
      reportDiagnosticByNode(
        [
          `Tag \`@${tagName}\` is missing a description.`,
          `\n${kleur.bold('EXAMPLE')}\n\n${example}`,
        ].join('\n'),
        tag[TS_NODE],
        LogLevel.Warn,
      );
    }

    return {
      [TS_NODE]: tag[TS_NODE],
      name: tag.title ?? '',
      description: tag.description ?? '',
    };
  });
}

export function mergeDocTags(tagsA: DocTagMeta[], tagsB: DocTagMeta[]) {
  const keysA = new Set(tagsA.map((tag) => tag.name + tag.text));
  for (const tagB of tagsB) {
    if (!keysA.has(tagB.name + tagB.text)) {
      tagsA.push(tagB);
    }
  }
}

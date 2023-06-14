import kleur from 'kleur';
import { createHash } from 'node:crypto';
import type ts from 'typescript';

import { formatPluginName, log, LogLevel, logTime } from '../../utils/logger';
import { isUndefined } from '../../utils/unit';
import type { ComponentMeta } from '../meta/component';
import type { ElementMeta } from '../meta/element';
import { resolvePath } from '../utils/path';
import type { AnalyzePlugin, ComponentNode, ElementNode } from './analyze-plugin';

export async function runPluginsInit(program: ts.Program, plugins: AnalyzePlugin[]): Promise<void> {
  for (const plugin of plugins) {
    if (isUndefined(plugin.init)) continue;
    const startTime = process.hrtime();
    await plugin.init(program);
    logTime(`${formatPluginName(plugin.name)} \`init\``, startTime, LogLevel.Verbose);
  }
}

let prevHash: string;

export async function runPlugins(
  program: ts.Program,
  plugins: AnalyzePlugin[],
  paths: string[],
  watching = false,
) {
  const validFilePaths = new Set(paths);

  const sourceFiles = program
    .getSourceFiles()
    .filter((sf) => validFilePaths.has(resolvePath(sf.fileName)))
    .sort((sfA, sfB) => (sfA.fileName > sfB.fileName ? 1 : -1));

  if (watching) {
    const hashSum = createHash('sha256');
    for (const file of sourceFiles) hashSum.update(file.text);
    const newHash = hashSum.digest('hex');

    if (prevHash !== newHash) {
      prevHash = newHash;
    } else {
      return;
    }
  }

  await runPluginsInit(program, plugins);

  const elements: ElementMeta[] = [],
    components: ComponentMeta[] = [],
    sources = new Map<ComponentMeta | ElementMeta, ts.SourceFile>();

  for (const sourceFile of sourceFiles) {
    const nodes = await runPluginsDiscover(plugins, sourceFile);

    for (const node of nodes.components) {
      const component = await runPluginsBuildComponent(plugins, node);
      if (!component) continue;
      sources.set(component, sourceFile);
      components.push(component);
    }

    for (const node of nodes.elements) {
      const element = await runPluginsBuildElement(plugins, node);
      if (!element) continue;
      sources.set(element, sourceFile);
      elements.push(element);
    }
  }

  await runPluginsTransform(plugins, components, elements, sources);
  await runPluginsDestroy(plugins);

  return { sourceFiles };
}

export async function runPluginsDiscover(
  plugins: AnalyzePlugin[],
  sourceFile: ts.SourceFile,
): Promise<{
  elements: ElementNode[];
  components: ComponentNode[];
}> {
  for (const plugin of plugins) {
    if (isUndefined(plugin.discoverComponents) && isUndefined(plugin.discoverElements)) continue;

    const startTime = process.hrtime(),
      components = await plugin.discoverComponents?.(sourceFile),
      elements = await plugin.discoverElements?.(sourceFile);

    logTime(`${formatPluginName(plugin.name)} \`discover\``, startTime, LogLevel.Verbose);

    if (components) {
      log(
        `${formatPluginName(plugin.name)} discovered components in ${kleur.blue(
          sourceFile.fileName,
        )}`,
        LogLevel.Verbose,
      );
    }

    if (elements) {
      log(
        `${formatPluginName(plugin.name)} discovered elements in ${kleur.blue(
          sourceFile.fileName,
        )}`,
        LogLevel.Verbose,
      );
    }

    if (components || elements) {
      return {
        components: components || [],
        elements: elements || [],
      };
    }
  }

  return {
    components: [],
    elements: [],
  };
}

export async function runPluginsBuildComponent(
  plugins: AnalyzePlugin[],
  node?: ComponentNode,
): Promise<ComponentMeta | null> {
  for (const plugin of plugins) {
    if (isUndefined(plugin.buildComponent)) continue;

    const startTime = process.hrtime(),
      component = node && (await plugin.buildComponent(node));

    logTime(`${formatPluginName(plugin.name)} \`build\``, startTime, LogLevel.Verbose);

    if (component) {
      log(
        `${formatPluginName(plugin.name)} built component meta for ${kleur.blue(component.name)}`,
        LogLevel.Verbose,
      );
    }

    if (component) {
      return component;
    }
  }

  return null;
}

export async function runPluginsBuildElement(
  plugins: AnalyzePlugin[],
  node?: ElementNode,
): Promise<ElementMeta | null> {
  for (const plugin of plugins) {
    if (isUndefined(plugin.buildElement)) continue;

    const startTime = process.hrtime(),
      element = node && (await plugin.buildElement(node));

    logTime(`${formatPluginName(plugin.name)} \`build\``, startTime, LogLevel.Verbose);

    if (element) {
      log(
        `${formatPluginName(plugin.name)} built element meta for ${kleur.blue(element.tag.name)}`,
        LogLevel.Verbose,
      );
    }

    if (element) {
      return element;
    }
  }

  return null;
}

export async function runPluginsTransform(
  plugins: AnalyzePlugin[],
  components: ComponentMeta[],
  elements: ElementMeta[],
  sourceFiles: Map<ComponentMeta | ElementMeta, ts.SourceFile>,
): Promise<void> {
  for (const plugin of plugins) {
    if (isUndefined(plugin.transform)) continue;
    const startTime = process.hrtime();
    await plugin.transform({ components, elements }, sourceFiles);
    logTime(`${formatPluginName(plugin.name)} \`transform\``, startTime, LogLevel.Verbose);
  }
}

export async function runPluginsDestroy(plugins: AnalyzePlugin[]): Promise<void> {
  for (const plugin of plugins) {
    if (isUndefined(plugin.destroy)) continue;
    const startTime = process.hrtime();
    await plugin.destroy();
    logTime(`${formatPluginName(plugin.name)} \`destroy\``, startTime, LogLevel.Verbose);
  }
}

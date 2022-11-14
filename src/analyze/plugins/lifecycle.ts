import { createHash } from 'crypto';
import kleur from 'kleur';
import LRUCache from 'lru-cache';
import ts from 'typescript';

import { formatPluginName, log, LogLevel, logTime } from '../../utils/logger';
import { isUndefined } from '../../utils/unit';
import { type ComponentMeta } from '../meta/component';
import { resolvePath } from '../utils/path';
import type { AnalyzePlugin, ElementDefintionNode } from './AnalyzePlugin';

export async function runPluginsInit(program: ts.Program, plugins: AnalyzePlugin[]): Promise<void> {
  for (const plugin of plugins) {
    if (isUndefined(plugin.init)) continue;
    const startTime = process.hrtime();
    await plugin.init(program);
    logTime(`${formatPluginName(plugin.name)} \`init\``, startTime, LogLevel.Verbose);
  }
}

let prevHash: string;
const cache = new LRUCache<string, ComponentMeta>({ max: 1024 });

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

  const components: ComponentMeta[] = [];
  const sources = new Map<ComponentMeta, ts.SourceFile>();

  for (const sourceFile of sourceFiles) {
    const cacheKey = createHash('sha256').update(sourceFile.text).digest('hex');

    if (cache.has(cacheKey)) {
      log(`plugins cache hit: ${sourceFile.fileName}`, LogLevel.Verbose);
      const component = cache.get(cacheKey)!;
      sources.set(component, sourceFile);
      components.push(component);
      continue;
    }

    const definitions = await runPluginsDiscover(plugins, sourceFile);
    if (!definitions) continue;

    for (const definition of definitions) {
      const component = await runPluginsBuild(plugins, definition);
      if (!component) continue;
      cache.set(cacheKey, component);
      sources.set(component, sourceFile);
      components.push(component);
    }
  }

  await runPluginsTransform(plugins, components, sources);
  await runPluginsDestroy(plugins);

  return { sourceFiles };
}

export async function runPluginsDiscover(plugins: AnalyzePlugin[], sourceFile: ts.SourceFile) {
  for (const plugin of plugins) {
    if (isUndefined(plugin.discover)) continue;

    const startTime = process.hrtime();
    const discoveredNode = await plugin.discover(sourceFile);

    logTime(`${formatPluginName(plugin.name)} \`discover\``, startTime, LogLevel.Verbose);

    if (discoveredNode) {
      log(
        `${formatPluginName(plugin.name)} discovered component in ${kleur.blue(
          sourceFile.fileName,
        )}`,
        LogLevel.Verbose,
      );

      return discoveredNode;
    }
  }

  return null;
}

export async function runPluginsBuild(plugins: AnalyzePlugin[], definition: ElementDefintionNode) {
  for (const plugin of plugins) {
    if (isUndefined(plugin.build)) continue;

    const startTime = process.hrtime();
    const component = await plugin.build?.(definition);

    logTime(`${formatPluginName(plugin.name)} \`build\``, startTime, LogLevel.Verbose);

    if (component) {
      log(
        `${formatPluginName(plugin.name)} built meta for ${kleur.blue(
          component.tagname.name ?? '',
        )}`,
        LogLevel.Verbose,
      );

      return component;
    }
  }

  return null;
}

export async function runPluginsTransform(
  plugins: AnalyzePlugin[],
  components: ComponentMeta[],
  sourceFiles: Map<ComponentMeta, ts.SourceFile>,
): Promise<void> {
  for (const plugin of plugins) {
    if (isUndefined(plugin.transform)) continue;
    const startTime = process.hrtime();
    await plugin.transform(components, sourceFiles);
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

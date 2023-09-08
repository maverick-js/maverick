import kleur from 'kleur';
import { createHash } from 'node:crypto';
import type ts from 'typescript';

import { formatPluginName, log, LogLevel, logTime } from '../../utils/logger';
import { isUndefined } from '../../utils/unit';
import type { ComponentMeta } from '../meta/component';
import type { CustomElementMeta } from '../meta/custom-element';
import type { ReactComponentMeta } from '../meta/react';
import { resolvePath } from '../utils/path';
import type {
  AnalyzeFramework,
  AnalyzePlugin,
  ComponentNode,
  CustomElementNode,
  ReactComponentNode,
  TransformData,
  TransformSourceFiles,
} from './analyze-plugin';

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
  framework: AnalyzeFramework = 'default',
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

  const components: ComponentMeta[] = [],
    customElements: CustomElementMeta[] = [],
    reactComponents: ReactComponentMeta[] = [],
    transformSourceFiles: TransformSourceFiles = new Map();

  for (const sourceFile of sourceFiles) {
    const nodes = await runPluginsDiscover(plugins, sourceFile, framework);

    if (framework === 'default') {
      for (const node of nodes.components) {
        const component = await runPluginsBuildComponent(plugins, node);
        if (!component) continue;
        transformSourceFiles.set(component, sourceFile);
        components.push(component);
      }

      for (const node of nodes.customElements) {
        const element = await runPluginsBuildCustomElement(plugins, node);
        if (!element) continue;
        transformSourceFiles.set(element, sourceFile);
        customElements.push(element);
      }
    } else if (framework === 'react') {
      for (const node of nodes.reactComponents) {
        const component = await runPluginsBuildReactComponent(plugins, node);
        if (!component) continue;
        transformSourceFiles.set(component, sourceFile);
        reactComponents.push(component);
      }
    }
  }

  await runPluginsTransform(
    plugins,
    { components, customElements, reactComponents },
    transformSourceFiles,
  );

  await runPluginsDestroy(plugins);

  return { sourceFiles };
}

export async function runPluginsDiscover(
  plugins: AnalyzePlugin[],
  sourceFile: ts.SourceFile,
  framework: AnalyzeFramework,
): Promise<{
  components: ComponentNode[];
  customElements: CustomElementNode[];
  reactComponents: ReactComponentNode[];
}> {
  for (const plugin of plugins) {
    if (
      isUndefined(plugin.discoverComponents) &&
      isUndefined(plugin.discoverCustomElements) &&
      isUndefined(plugin.discoverReactComponents)
    ) {
      continue;
    }

    const startTime = process.hrtime(),
      components =
        framework === 'default' ? await plugin.discoverComponents?.(sourceFile) : undefined,
      customElements =
        framework === 'default' ? await plugin.discoverCustomElements?.(sourceFile) : undefined,
      reactComponents =
        framework === 'react' ? await plugin.discoverReactComponents?.(sourceFile) : undefined;

    logTime(`${formatPluginName(plugin.name)} \`discover\``, startTime, LogLevel.Verbose);

    if (components) {
      log(
        `${formatPluginName(plugin.name)} discovered components in ${kleur.blue(
          sourceFile.fileName,
        )}`,
        LogLevel.Verbose,
      );
    }

    if (customElements) {
      log(
        `${formatPluginName(plugin.name)} discovered elements in ${kleur.blue(
          sourceFile.fileName,
        )}`,
        LogLevel.Verbose,
      );
    }

    if (reactComponents) {
      log(
        `${formatPluginName(plugin.name)} discovered react components in ${kleur.blue(
          sourceFile.fileName,
        )}`,
        LogLevel.Verbose,
      );
    }

    if (components || customElements || reactComponents) {
      return {
        components: components || [],
        customElements: customElements || [],
        reactComponents: reactComponents || [],
      };
    }
  }

  return {
    components: [],
    customElements: [],
    reactComponents: [],
  };
}

export async function runPluginsBuildComponent(
  plugins: AnalyzePlugin[],
  node?: ComponentNode,
): Promise<ComponentMeta | null> {
  for (const plugin of plugins) {
    if (isUndefined(plugin.buildComponentMeta)) continue;

    const startTime = process.hrtime(),
      component = node && (await plugin.buildComponentMeta(node));

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

export async function runPluginsBuildCustomElement(
  plugins: AnalyzePlugin[],
  node?: CustomElementNode,
): Promise<CustomElementMeta | null> {
  for (const plugin of plugins) {
    if (isUndefined(plugin.buildCustomElementMeta)) continue;

    const startTime = process.hrtime(),
      element = node && (await plugin.buildCustomElementMeta(node));

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

export async function runPluginsBuildReactComponent(
  plugins: AnalyzePlugin[],
  node?: ReactComponentNode,
): Promise<ReactComponentMeta | null> {
  for (const plugin of plugins) {
    if (isUndefined(plugin.buildReactComponentMeta)) continue;

    const startTime = process.hrtime(),
      component = node && (await plugin.buildReactComponentMeta(node));

    logTime(`${formatPluginName(plugin.name)} \`build\``, startTime, LogLevel.Verbose);

    if (component) {
      log(
        `${formatPluginName(plugin.name)} built react component meta for ${kleur.blue(
          component.name,
        )}`,
        LogLevel.Verbose,
      );
    }

    if (component) {
      return component;
    }
  }

  return null;
}

export async function runPluginsTransform(
  plugins: AnalyzePlugin[],
  data: TransformData,
  sourceFiles: TransformSourceFiles,
): Promise<void> {
  for (const plugin of plugins) {
    if (isUndefined(plugin.transform)) continue;
    const startTime = process.hrtime();
    await plugin.transform(data, sourceFiles);
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

import kleur from 'kleur';
import type ts from 'typescript';

import type { AnalyzeFramework, AnalyzePlugin } from '../../analyze/plugins/analyze-plugin';
import { createBuildPlugin } from '../../analyze/plugins/build-plugin';
import { createDiscoverPlugin } from '../../analyze/plugins/discover-plugin';
import { runPlugins } from '../../analyze/plugins/lifecycle';
import { parseGlobs } from '../../analyze/utils/globs';
import { resolveConfigPaths } from '../../analyze/utils/resolve';
import { clearTerminal, log, LogLevel, logTime } from '../../utils/logger';
import { isArray, isUndefined } from '../../utils/unit';
import { compileAndWatch, compileOnce, transpileModuleOnce } from '../compile';

export interface AnalyzeCommandConfig extends Record<string, unknown> {
  logLevel: string;
  glob?: string[];
  globs?: string[];
  cwd: string;
  configFile: string;
  watch: boolean;
  framework?: AnalyzeFramework;
  project: string | null;
}

async function normalizeConfig(config: AnalyzeCommandConfig) {
  const cwd = isUndefined(config.cwd) ? process.cwd() : config.cwd;
  return resolveConfigPaths(cwd, config);
}

export async function runAnalyzeCommand(analyzeConfig: AnalyzeCommandConfig): Promise<void> {
  clearTerminal();

  const config = await normalizeConfig(analyzeConfig);
  const glob: string[] = config.glob ?? [];

  log(config, LogLevel.Verbose);

  let plugins: AnalyzePlugin[] = [];

  const { existsSync } = await import('node:fs');

  if (!existsSync(config.configFile)) {
    log(
      `no configuration file could be found at ${kleur.cyan(config.configFile)}`,
      LogLevel.Verbose,
    );
  } else {
    plugins = (await transpileModuleOnce(config.configFile)) as AnalyzePlugin[];
  }

  if (!isArray(plugins)) {
    log(
      `configuration file must default export an array of plugins, found ${kleur.red(
        typeof plugins,
      )}`,
      LogLevel.Error,
    );
    return;
  }

  plugins.push(createDiscoverPlugin(), createBuildPlugin());

  if (config.watch) {
    log('watching files for changes...');
    compileAndWatch(config.project ?? 'tsconfig.json', async (program) => {
      const filePaths = await parseGlobs(glob);
      await run(program, plugins, filePaths, config.framework, true);
    });
  } else {
    const startCompileTime = process.hrtime();
    const filePaths = await parseGlobs(glob);
    const program = compileOnce(filePaths, {
      project: config.project ?? 'tsconfig.json',
    });
    logTime(`compiled program`, startCompileTime);
    await run(program, plugins, filePaths, config.framework);
  }
}

async function run(
  program: ts.Program,
  plugins: AnalyzePlugin[],
  filePaths: string[],
  framework: AnalyzeFramework | undefined = undefined,
  watching = false,
) {
  const startAnalyzeTime = process.hrtime();

  const result = await runPlugins(program, plugins, filePaths, framework, watching);

  if (result) {
    const { sourceFiles } = result;
    const noOfFiles = sourceFiles.length;
    const noOfFilesText = kleur.green(`${noOfFiles} ${noOfFiles === 1 ? 'file' : 'files'}`);
    logTime(`analyzed ${noOfFilesText}`, startAnalyzeTime);
  }
}

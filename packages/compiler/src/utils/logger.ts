import { isFunction, isObject } from '@maverick-js/std';
import kleur from 'kleur';
import { normalize } from 'pathe';
import type { Node, SourceFile } from 'typescript';

import { ms } from './ms';
import { splitLineBreaks } from './print';

export const enum LogLevel {
  Silent = 0,
  Error = 1,
  Warn = 2,
  Info = 3,
  Verbose = 4,
}

export const LogLevelColor = Object.freeze({
  [LogLevel.Silent]: kleur.bgWhite,
  [LogLevel.Error]: kleur.bgRed,
  [LogLevel.Warn]: kleur.bgYellow,
  [LogLevel.Info]: kleur.bgCyan,
  [LogLevel.Verbose]: kleur.bgMagenta,
});

let currentLogLevel = LogLevel.Info;

export type LogLevelName = 'silent' | 'error' | 'warn' | 'info' | 'verbose';

export function mapLogLevelStringToNumber(level: LogLevelName): LogLevel {
  switch (level) {
    case 'silent':
      return LogLevel.Silent;
    case 'error':
      return LogLevel.Error;
    case 'warn':
      return LogLevel.Warn;
    case 'info':
      return LogLevel.Info;
    case 'verbose':
      return LogLevel.Verbose;
    default:
      return LogLevel.Info;
  }
}

export function mapLogLevelToString(level: LogLevel): string {
  switch (level) {
    case LogLevel.Error:
      return 'error';
    case LogLevel.Warn:
      return 'warn';
    case LogLevel.Info:
      return 'info';
    case LogLevel.Verbose:
      return 'verbose';
    case LogLevel.Silent:
      return 'silent';
    default:
      return 'info';
  }
}

export const clearTerminal = (): void => {
  console.clear();
};

export function setGlobalLogLevel(level: LogLevel): void {
  currentLogLevel = level;
}

export type Logger = (text: unknown | (() => string), level?: LogLevel) => void;

export const log: Logger = (text, level = LogLevel.Info) => {
  if (__TEST__ && level > LogLevel.Warn) return;

  if (currentLogLevel < level) return;

  if (isFunction(text)) {
    text = text();
  }

  if (isObject(text)) {
    console.dir(text, { depth: 10 });
  } else {
    const currentColor = LogLevelColor[level];
    console.log(
      kleur.dim(
        `${formatPluginName('maverick')} ${currentColor(
          kleur.bold(kleur.black(` ${mapLogLevelToString(level).toUpperCase()} `)),
        )}`,
      ),
      `${text}\n`,
    );
  }
};

export interface TimedLogInfo {
  message: string;
  startTime: [number, number];
}

export function logTime({ message, startTime }: TimedLogInfo, level = LogLevel.Info) {
  const totalTime = process.hrtime(startTime);
  const totalTimeText = kleur.green(ms(totalTime[0] * 1000 + totalTime[1] / 1000000));
  log(() => `${message} in ${totalTimeText}.`, level);
}

export function formatPluginName(name: string) {
  return `[${name.startsWith('maverick') ? kleur.dim(name) : kleur.yellow(name)}]`;
}

export function getDefaultPluginName() {
  return formatPluginName('maverick');
}

export interface StackTraceInfo {
  message: string;
  stack: string;
}

export function logStackTrace({ message, stack }: StackTraceInfo, level = LogLevel.Error) {
  log(
    `\n\n${kleur.bold('MESSAGE')}\n\n${message}\n\n${kleur.bold('STACK TRACE')}\n\n${stack}`,
    level,
  );
}

export interface PrintDiagnosticInfo {
  message: string;
  fix: string | undefined;
  sourceFilePath: string;
  sourceText: string;
  startLineNumber: number;
  endLineNumber: number;
}

function printDiagnostic(info: PrintDiagnosticInfo, level: LogLevel) {
  log(printDiagnosticOutput(info), level);
}

function printDiagnosticOutput({
  message,
  fix,
  sourceFilePath,
  sourceText,
  startLineNumber,
  endLineNumber,
}: PrintDiagnosticInfo) {
  const isMultiLine = endLineNumber - startLineNumber > 0;
  const codeFrame = buildCodeFrame(sourceText, startLineNumber, endLineNumber);

  const print = [`\n\n${kleur.bold('MESSAGE')}`, `\n${message}`];

  if (fix) {
    print.push(`\n${kleur.bold('FIX')}`, `\n${fix}`);
  }

  print.push(
    `\n${kleur.bold('CODE')}\n`,
    `${kleur.dim(sourceFilePath)} ${kleur.dim('L:')}${kleur.dim(
      isMultiLine ? `${startLineNumber}-${endLineNumber}` : startLineNumber,
    )}\n`,
    prettifyCodeFrame(codeFrame),
  );

  return print.join('\n');
}

export interface LineDiagnosticInfo {
  message: string;
  fix?: string;
  file: SourceFile;
  line: number;
}

export let testDiagnostics: {
  message: string;
  print: string;
  level: LogLevel;
}[] = [];

export function reportDiagnosticByLine(info: LineDiagnosticInfo, level = LogLevel.Info) {
  const sourceFilePath = normalize(info.file.fileName),
    sourceText = info.file.text,
    printInfo: PrintDiagnosticInfo = {
      message: info.message,
      fix: info.fix,
      sourceFilePath,
      sourceText,
      startLineNumber: info.line,
      endLineNumber: info.line,
    };

  if (__TEST__) {
    testDiagnostics.push({
      message: info.message,
      print: printDiagnosticOutput(printInfo),
      level,
    });
  } else {
    printDiagnostic(printInfo, level);
  }
}

export interface NodeDiagnosticInfo {
  message: string;
  fix?: string;
  node: Node;
}

export function reportDiagnosticByNode(
  { message, fix, node }: NodeDiagnosticInfo,
  level = LogLevel.Info,
) {
  const sourceFile = node.getSourceFile(),
    sourceFilePath = normalize(sourceFile.fileName),
    sourceText = sourceFile.text,
    posStart = sourceFile.getLineAndCharacterOfPosition(node.getStart()),
    posEnd = sourceFile.getLineAndCharacterOfPosition(node.getEnd()),
    startLineNumber = posStart.line + 1,
    endLineNumber = posEnd.line + 1,
    printInfo: PrintDiagnosticInfo = {
      message,
      fix,
      sourceFilePath,
      sourceText,
      startLineNumber,
      endLineNumber,
    };

  if (__TEST__) {
    testDiagnostics.push({
      message,
      print: printDiagnosticOutput(printInfo),
      level,
    });
  } else {
    printDiagnostic(printInfo, level);
  }
}

interface CodeFrame {
  firstLineNumber: number;
  totalLines: number;
  linesBefore: string[];
  relevantLines: string[];
  linesAfter: string[];
}

function prettifyCodeFrame(codeFrame: CodeFrame): string {
  const { firstLineNumber, linesBefore, relevantLines, linesAfter } = codeFrame;

  const printLines: string[] = [];

  const maxNoOfDigits = (firstLineNumber + codeFrame.totalLines).toString().length;
  const formatLineNumber = (lineNumber: number) => {
    const missingDigits = maxNoOfDigits - lineNumber.toString().length;
    return missingDigits > 0 ? `${' '.repeat(missingDigits)}${lineNumber}` : `${lineNumber}`;
  };

  const printLine = (line: string, lineNumber: number, isRelevant = false) =>
    (isRelevant ? kleur.white : kleur.dim)(
      `${isRelevant ? '> ' : '  '}${kleur.bold(formatLineNumber(lineNumber))} |  ${line}`,
    );

  linesBefore.forEach((line, i) => {
    printLines.push(printLine(line, firstLineNumber + i));
  });

  relevantLines.forEach((line, i) => {
    printLines.push(printLine(line, firstLineNumber + linesBefore.length + i, true));
  });

  linesAfter.forEach((line, i) => {
    printLines.push(
      printLine(line, firstLineNumber + linesBefore.length + relevantLines.length + i),
    );
  });

  return printLines.join('\n');
}

function buildCodeFrame(
  sourceText: string,
  startLineNumber: number,
  endLineNumber: number,
  frameSize = 5,
): CodeFrame {
  const startLineNumberMinusOne: number = startLineNumber - 1;
  const lines = splitLineBreaks(sourceText);

  const startAt = startLineNumberMinusOne - frameSize < 0 ? 0 : startLineNumberMinusOne - frameSize;

  const endAt = endLineNumber + frameSize > lines.length ? lines.length : endLineNumber + frameSize;

  const codeFrame: CodeFrame = {
    firstLineNumber: startAt + 1,
    linesBefore: [],
    relevantLines: [],
    linesAfter: [],
    totalLines: 0,
  };

  let lineCounter = 0;
  const MAX_LINES = 15;

  function buildLines(start: number, end: number) {
    if (lineCounter > MAX_LINES - 1) return [];

    const newLines: string[] = [];

    for (let i = start; i < end; i++) {
      if (lines[i] != null) {
        newLines.push(lines[i]);
        lineCounter += 1;
      }

      if (lineCounter > MAX_LINES - 1) {
        return newLines;
      }
    }

    return newLines;
  }

  codeFrame.linesBefore = buildLines(startAt, startLineNumberMinusOne);
  codeFrame.relevantLines = buildLines(startLineNumberMinusOne, endLineNumber);
  codeFrame.linesAfter = buildLines(endLineNumber, endAt + 1);

  const linesHidden = endAt - startAt - lineCounter;
  if (linesHidden > 0) {
    codeFrame.linesAfter.push(
      kleur.dim(`${linesHidden} ${linesHidden === 1 ? 'line' : 'lines'} hidden...`),
    );
  }

  codeFrame.totalLines = lineCounter;
  return codeFrame;
}

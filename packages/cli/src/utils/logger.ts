import kleur from 'kleur';
import { normalize } from 'pathe';
import type { Node, SourceFile } from 'typescript';

import { ms } from './ms';
import { splitLineBreaks } from './str';
import { isFunction, isObject } from './unit';

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

export type TimedLogger = (message: string, startTime: [number, number], level?: LogLevel) => void;

export const logTime: TimedLogger = (
  message: string,
  startTime: [number, number],
  level = LogLevel.Info,
) => {
  const totalTime = process.hrtime(startTime);
  const totalTimeText = kleur.green(ms(totalTime[0] * 1000 + totalTime[1] / 1000000));
  log(() => `${message} in ${totalTimeText}.`, level);
};

export function formatPluginName(name: string) {
  return `[${name.startsWith('maverick') ? kleur.dim(name) : kleur.yellow(name)}]`;
}

export function getDefaultPluginName() {
  return formatPluginName('maverick');
}

export type StackTraceLogger = (message: string, stack: string, level?: LogLevel) => void;

export const logStackTrace: StackTraceLogger = (
  message: string,
  stack: string,
  level = LogLevel.Error,
) => {
  log(
    `\n\n${kleur.bold('MESSAGE')}\n\n${message}\n\n${kleur.bold('STACK TRACE')}\n\n${stack}`,
    level,
  );
};

const printDiagnostic = (
  message: string,
  sourceFilePath: string,
  sourceText: string,
  startLineNumber: number,
  endLineNumber: number,
  level: LogLevel,
) => {
  log(
    printDiagnosticOutput(message, sourceFilePath, sourceText, startLineNumber, endLineNumber),
    level,
  );
};

function printDiagnosticOutput(
  message: string,
  sourceFilePath: string,
  sourceText: string,
  startLineNumber: number,
  endLineNumber: number,
) {
  const isMultiLine = endLineNumber - startLineNumber > 0;
  const codeFrame = buildCodeFrame(sourceText, startLineNumber, endLineNumber);
  return [
    `\n\n${kleur.bold('MESSAGE')}`,
    `\n${message}`,
    `\n${kleur.bold('CODE')}\n`,
    `${kleur.dim(sourceFilePath)} ${kleur.dim('L:')}${kleur.dim(
      isMultiLine ? `${startLineNumber}-${endLineNumber}` : startLineNumber,
    )}\n`,
    prettifyCodeFrame(codeFrame),
  ].join('\n');
}

export type DiagnosticReporterByLine = (
  message: string,
  file: SourceFile,
  line: number,
  level?: LogLevel,
) => void;

export let testDiagnostics: { message: string; print: string; level: LogLevel }[] = [];

export const reportDiagnosticByLine: DiagnosticReporterByLine = (
  message: string,
  sourceFile: SourceFile,
  line: number,
  level = LogLevel.Info,
) => {
  const sourceFilePath = normalize(sourceFile.fileName);
  const sourceText = sourceFile.text;
  if (__TEST__) {
    testDiagnostics.push({
      message,
      print: printDiagnosticOutput(message, sourceFilePath, sourceText, line, line),
      level,
    });
  } else {
    printDiagnostic(message, sourceFilePath, sourceText, line, line, level);
  }
};

export type DiagnosticReporterByNode = (
  message: string,
  node: Node | undefined,
  level?: LogLevel,
) => void;

export const reportDiagnosticByNode: DiagnosticReporterByNode = (
  message: string,
  node: Node | undefined,
  level = LogLevel.Info,
) => {
  if (!node) return;
  const sourceFile = node.getSourceFile();
  const sourceFilePath = normalize(sourceFile.fileName);
  const sourceText = sourceFile.text;
  const posStart = sourceFile.getLineAndCharacterOfPosition(node.getStart());
  const posEnd = sourceFile.getLineAndCharacterOfPosition(node.getEnd());
  const startLineNumber = posStart.line + 1;
  const endLineNumber = posEnd.line + 1;
  if (__TEST__) {
    testDiagnostics.push({
      message,
      print: printDiagnosticOutput(
        message,
        sourceFilePath,
        sourceText,
        startLineNumber,
        endLineNumber,
      ),
      level,
    });
  } else {
    printDiagnostic(message, sourceFilePath, sourceText, startLineNumber, endLineNumber, level);
  }
};

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

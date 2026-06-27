import {
  LogLevel,
  logTime as logTimeInternal,
  reportDiagnosticByNode as reportDiagnosticByNodeInternal,
} from '@maverick-js/logger';
import type * as ts from 'typescript';

export * from '@maverick-js/logger';

export function reportDiagnosticByNode(
  message: string,
  node: ts.Node | undefined,
  level = LogLevel.Info,
) {
  if (node) reportDiagnosticByNodeInternal({ message, node }, level);
}

export function logTime(message: string, startTime: [number, number], level = LogLevel.Info) {
  logTimeInternal({ message, startTime }, level);
}

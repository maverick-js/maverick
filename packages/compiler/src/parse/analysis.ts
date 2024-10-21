import type ts from 'typescript';

export interface ParseAnalysis {
  /** Whether the following components have been imported from "@maverick-js/core". */
  components: {
    Fragment?: ts.ImportSpecifier;
    Portal?: ts.ImportSpecifier;
    For?: ts.ImportSpecifier;
    ForKeyed?: ts.ImportSpecifier;
    Host?: ts.ImportSpecifier;
  };
}

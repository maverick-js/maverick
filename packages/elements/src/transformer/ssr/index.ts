import type { ASTSerializer } from '../transform';

export const ssr: ASTSerializer = {
  serialize(ast, ctx) {
    return '';
  },
};

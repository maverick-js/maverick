export type MarkerWalker = TreeWalker;

export function createMarkerWalker(root: Node): MarkerWalker {
  return document.createTreeWalker(root, NodeFilter.SHOW_COMMENT, filter);
}

const mark = '$';
function filter(node: Node) {
  return node.nodeValue === mark ? 1 /** accept */ : 3 /** skip */;
}

// Slightly modified version of udomdiff by solid.
// udomdiff: https://github.com/WebReflection/udomdiff/blob/master/index.js
// solid: https://github.com/ryansolid/dom-expressions/blob/main/packages/dom-expressions/src/reconcile.js
export function reconcile(parent: Node, nodesA: Node[], nodesB: Node[]) {
  let lengthB = nodesB.length,
    endA = nodesA.length,
    endB = lengthB,
    startA = 0,
    startB = 0,
    after = nodesA[endA - 1].nextSibling,
    map: Map<Node, number> | null = null;

  while (startA < endA || startB < endB) {
    // common prefix
    if (nodesA[startA] === nodesB[startB]) {
      startA++;
      startB++;
      continue;
    }

    // common suffix
    while (nodesA[endA - 1] === nodesB[endB - 1]) {
      endA--;
      endB--;
    }

    // append
    if (endA === startA) {
      const node =
        endB < lengthB ? (startB ? nodesB[startB - 1].nextSibling : nodesB[endB - startB]) : after;
      while (startB < endB) parent.insertBefore(nodesB[startB++], node);
    }
    // remove
    else if (endB === startB) {
      while (startA < endA) {
        if (!map || !map.has(nodesA[startA])) (nodesA[startA] as Element).remove();
        startA++;
      }
    }
    // swap backward
    else if (nodesA[startA] === nodesB[endB - 1] && nodesB[startB] === nodesA[endA - 1]) {
      const node = nodesA[--endA].nextSibling;
      parent.insertBefore(nodesB[startB++], nodesA[startA++].nextSibling);
      parent.insertBefore(nodesB[--endB], node);

      nodesA[endA] = nodesB[endB];
    }
    // fallback to map
    else {
      if (!map) {
        map = new Map();
        let i = startB;

        while (i < endB) map.set(nodesB[i], i++);
      }

      const index = map.get(nodesA[startA]);
      if (index != null) {
        if (startB < index && index < endB) {
          let i = startA,
            sequence = 1,
            t;

          while (++i < endA && i < endB) {
            if ((t = map.get(nodesA[i])) == null || t !== index + sequence) break;
            sequence++;
          }

          if (sequence > index - startB) {
            const node = nodesA[startA];
            while (startB < index) parent.insertBefore(nodesB[startB++], node);
          } else parent.replaceChild(nodesB[startB++], nodesA[startA++]);
        } else startA++;
      } else (nodesA[startA++] as Element).remove();
    }
  }
}

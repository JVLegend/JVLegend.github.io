'use strict';

// Local security backport for GHSA-vfj7-8cjw-p6xm; see BACKPORT.md.
const MAX_DEPTH = 100;
const MAX_NODES = 20010;

const failure = (code, message) => {
  const error = new RangeError(message);
  error.code = code;
  return error;
};

const limit = options => {
  const depth = options && options.maxDepth !== undefined ? options.maxDepth : MAX_DEPTH;
  if (!Number.isInteger(depth) || depth < 1 || depth > MAX_DEPTH) {
    throw failure('ERR_BRACES_DEPTH_OPTION', `maxDepth must be an integer from 1 to ${MAX_DEPTH}`);
  }
  return depth;
};

const check = (depth, max) => {
  if (depth > max) {
    throw failure('ERR_BRACES_DEPTH', `Brace AST nesting exceeds maximum depth (${max})`);
  }
};

// Iterative preflight: never recurse over an unvalidated, caller-supplied AST.
const assert = (ast, options) => {
  const max = limit(options);
  const active = new Set();
  const frames = [{ node: ast, parent: null, depth: ast.type === 'root' ? 0 : 1, index: -1 }];
  let count = 0;
  while (frames.length) {
    const frame = frames[frames.length - 1];
    const node = frame.node;
    if (frame.index === -1) {
      if (++count > MAX_NODES) {
        throw failure('ERR_BRACES_NODES', `Brace AST exceeds maximum nodes (${MAX_NODES})`);
      }
      if (active.has(node)) throw failure('ERR_BRACES_AST', 'Cyclic brace AST');
      const parents = new Set();
      let parent = node;
      while (parent) {
        if (parents.has(parent)) throw failure('ERR_BRACES_AST', 'Cyclic brace AST parent');
        parents.add(parent);
        // Upstream may retain old parent links when flattening invalid braces.
        // Validate their bound, rather than requiring structural equality.
        check(parents.size - 2, max);
        parent = parent.parent;
      }
      if (node.nodes) {
        check(frame.depth, max);
        if (!Array.isArray(node.nodes)) throw failure('ERR_BRACES_AST', 'Expected AST nodes array');
      }
      active.add(node);
      frame.index = 0;
    }
    if (node.nodes && frame.index < node.nodes.length) {
      const child = node.nodes[frame.index++];
      frames.push({ node: child, parent: node, depth: frame.depth + 1, index: -1 });
    } else {
      active.delete(node);
      frames.pop();
    }
  }

};

module.exports = { MAX_DEPTH, MAX_NODES, limit, check, assert };

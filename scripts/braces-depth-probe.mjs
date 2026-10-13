import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { originalPath, patchedPath } = JSON.parse(fs.readFileSync(0, "utf8"));
const original = require(originalPath);
const patched = require(patchedPath);
const deep = "{".repeat(4000) + "x" + "}".repeat(4000);
assert.ok(deep.length < 10000);
const evidence = { inputLength: deep.length, original: {}, patched: {} };
for (const method of ["compile", "expand"]) {
  assert.throws(
    () => original[method](deep),
    (error) => {
      evidence.original[method] = { name: error.name, message: error.message };
      return (
        error instanceof RangeError &&
        /call stack/i.test(error.message) &&
        !error.code
      );
    },
  );
}
const rejected = (fn, code = "ERR_BRACES_DEPTH") =>
  assert.throws(
    fn,
    (error) =>
      error instanceof RangeError &&
      error.code === code &&
      !/call stack/i.test(error.message),
  );
for (const pattern of [
  deep,
  "(".repeat(4000) + "x" + ")".repeat(4000),
  "{(".repeat(1500) + "x" + ")}".repeat(1500),
  "{".repeat(101) + "x",
]) {
  for (const method of ["parse", "compile", "expand", "stringify"])
    rejected(() => patched[method](pattern));
}
// Bypass parsing intentionally: all public and internal AST entry points must guard.
for (const method of ["compile", "expand", "stringify"]) {
  rejected(() => patched[method](original.parse(deep)));
  const internal = require(patchedPath + "/lib/" + method);
  rejected(() => internal(original.parse(deep)));
  evidence.patched[method] = "ERR_BRACES_DEPTH for string and caller AST";
}
for (const opening of ["{", "(", "{("]) {
  const depth = opening.length === 2 ? 50 : 100;
  const closing = opening === "{" ? "}" : opening === "(" ? ")" : ")}";
  const pattern = opening.repeat(depth) + "x" + closing.repeat(depth);
  for (const method of ["compile", "expand", "stringify"])
    assert.deepEqual(patched[method](pattern), original[method](pattern));
  for (const method of ["parse", "compile", "expand", "stringify"])
    rejected(() => patched[method](opening + pattern + closing));
}
for (const pattern of [
  "\\{".repeat(200) + "x" + "\\}".repeat(200),
  '"' + deep + '"',
  "[" + deep + "]",
]) {
  for (const method of ["compile", "expand", "stringify"])
    assert.deepEqual(patched[method](pattern), original[method](pattern));
}
for (const maxDepth of [false, 0, -1, NaN, Infinity, 101, "100"])
  rejected(
    () => patched.parse("{a,b}", { maxDepth }),
    "ERR_BRACES_DEPTH_OPTION",
  );
rejected(() => patched.compile("{{a,b}}", { maxDepth: 1 }));
const cycle = { type: "root", nodes: [] };
cycle.nodes.push(cycle);
const parentCycle = { type: "root", nodes: [] };
parentCycle.parent = parentCycle;
const wide = {
  type: "root",
  nodes: Array.from({ length: 20011 }, () => ({ type: "text", value: "x" })),
};
for (const method of ["compile", "expand", "stringify"]) {
  rejected(() => patched[method](cycle), "ERR_BRACES_AST");
  rejected(() => patched[method](parentCycle), "ERR_BRACES_AST");
  rejected(() => patched[method](wide), "ERR_BRACES_NODES");
}
// Differential corpus preserves options and ordinary/incomplete pattern outputs.
const patterns = [
  "",
  "x",
  "a/{b,c}/d",
  "{a,a,,b}",
  "{01..05}",
  "{5..1..2}",
  "{a..e}",
  "${a,b}",
  "a{b{c,d}e",
  "{a,b}}",
  "\\{a,b}",
  "(a|{b,c})",
  "{1..x}",
  "[{}]",
  '"{a,b}"',
];
for (const first of ["a", "{b,c}", "{1..3}", "{,x}", "{foo,bar}"])
  for (const second of ["", "{d,e}", "/{a,b}/x", "\\{x,y}"])
    patterns.push(first + second);
const options = [
  {},
  { expand: true },
  { expand: true, nodupes: true },
  { expand: true, noempty: true },
  { keepEscaping: true },
  { keepQuotes: true },
  { escapeInvalid: true },
  { rangeLimit: 50 },
];
let comparisons = 0;
for (const pattern of patterns)
  for (const option of options) {
    for (const method of ["compile", "expand", "stringify", "create"]) {
      assert.deepEqual(
        patched[method](pattern, option),
        original[method](pattern, option),
      );
      comparisons++;
    }
    assert.deepEqual(
      patched([pattern, pattern], option),
      original([pattern, pattern], option),
    );
    comparisons++;
  }
evidence.differentialComparisons = comparisons;
process.stdout.write(JSON.stringify(evidence));

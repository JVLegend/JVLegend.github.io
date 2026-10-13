import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";
import postcss from "postcss";
import { compileSelectors } from "./security-fixtures/compile-selectors.mjs";

const require = createRequire(import.meta.url);
const csso = createRequire(require.resolve("astro-compress"))("csso");
for (const consumer of [
  "tailwindcss",
  "postcss-nested",
  "@tailwindcss/typography",
  "eslint-plugin-astro",
]) {
  const consumerRequire = createRequire(require.resolve(consumer));
  assert.equal(
    consumerRequire("postcss-selector-parser/package.json").version,
    "7.1.6",
    consumer,
  );
}
const expected = JSON.parse(
  await fs.readFile(
    new URL("security-fixtures/selectors-expected.json", import.meta.url),
    "utf8",
  ),
);
// v7 makes insertion during iteration safe. v6 lost these two variant rules;
// check their intended CSS explicitly, then compare every other rule to v6.
const actual = postcss.parse(await compileSelectors());
const restoredVariants = new Map([
  [
    ".group:hover .group-hover\\:underline",
    [["text-decoration-line", "underline"]],
  ],
  [".peer:checked ~ .peer-checked\\:block", [["display", "block"]]],
]);
actual.walkRules((rule) => {
  if (restoredVariants.has(rule.selector)) {
    assert.deepEqual(
      rule.nodes.map(({ prop, value }) => [prop, value]),
      restoredVariants.get(rule.selector),
    );
    restoredVariants.delete(rule.selector);
    rule.remove();
  }
});
assert.equal(
  restoredVariants.size,
  0,
  "Group and peer variants must retain their intended declarations",
);
assert.equal(
  csso.minify(actual.toString()).css,
  csso.minify(expected.css).css,
  "Nested, typography and Tailwind variant CSS must match the v6 baseline",
);
// Bound the regression probe so a vulnerable parser cannot hang the CI worker.
const probe = spawnSync(
  process.execPath,
  [
    "-e",
    `
  const assert = require('node:assert/strict');
  const parser = require('postcss-selector-parser');
  const selector = '.a'.repeat(100000);
  assert.equal(parser().processSync(selector), selector);
`,
  ],
  { timeout: 5000, encoding: "utf8" },
);
assert.ifError(probe.error);
assert.equal(probe.status, 0, probe.stderr);
console.log(
  "Parser consumers, CSS compatibility and flat-selector regression passed.",
);

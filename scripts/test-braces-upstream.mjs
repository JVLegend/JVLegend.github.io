import path from "node:path";
import fs from "node:fs";
import Module, { createRequire } from "node:module";
const require = createRequire(import.meta.url);
import { describe, it } from "node:test";
import cp from "node:child_process";
const base = path.resolve("vendor/braces-backport/upstream-tests");
const target = path.resolve(process.argv[2] || "node_modules/braces");
// Run the untouched upstream synchronous assertions using Node's test runner.
// Avoid installing upstream's obsolete Mocha 6/development dependency tree.
global.describe = describe;
global.it = it;
const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (parent?.filename.startsWith(base + path.sep)) {
    if (request === "mocha") return {};
    if (request === "bash-path") return () => "/bin/bash";
    if (request === "..") return originalLoad(target, parent, isMain);
    if (request.startsWith("../lib/")) {
      return originalLoad(path.join(target, request.slice(3)), parent, isMain);
    }
  }
  return originalLoad(request, parent, isMain);
};
const originalSpawn = cp.spawnSync;
cp.spawnSync = (command, args, options = {}) => {
  const result = originalSpawn(command, args, {
    ...options,
    timeout: 5000,
    maxBuffer: 1024 * 1024,
  });
  if (result.error) throw result.error;
  return result;
};
for (const file of fs.readdirSync(path.join(base, "test")).sort()) {
  if (file.endsWith(".js")) require(path.join(base, "test", file));
}

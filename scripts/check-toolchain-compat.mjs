import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";
import { ESLint } from "eslint";

const require = createRequire(import.meta.url);
const lock = JSON.parse(
  await fs.readFile(new URL("../package-lock.json", import.meta.url), "utf8"),
);
assert.ok(
  !Object.keys(lock.packages).some((name) =>
    name.endsWith("node_modules/glob"),
  ),
  "Sucrase must no longer install the vulnerable glob dependency",
);
for (const consumer of [
  "eslint",
  "@eslint/config-array",
  "@eslint/eslintrc",
  "@typescript-eslint/typescript-estree",
]) {
  const consumerRequire = createRequire(require.resolve(consumer));
  assert.equal(
    consumerRequire("minimatch/package.json").version,
    "11.0.1",
    consumer,
  );
}
assert.equal(require("sucrase/package.json").version, "3.35.1");

const scratch = await fs.mkdtemp(path.join(os.tmpdir(), "jv-toolchain-"));
const estree = require("@typescript-eslint/typescript-estree");
try {
  // Exercise actual flat-config matching and ignore handling, not just imports.
  const eslint = new ESLint({
    cwd: scratch,
    overrideConfigFile: true,
    overrideConfig: [
      { ignores: ["ignored/**"] },
      { files: ["**/*.{js,ts}"], rules: { "no-undef": "error" } },
    ],
  });
  for (const filePath of ["src/index.js", "src/nested/tool.ts", ".hidden.js"]) {
    const [result] = await eslint.lintText("undeclared = 1;", { filePath });
    assert.deepEqual(
      result.messages.map(({ ruleId }) => ruleId),
      ["no-undef"],
      filePath,
    );
  }
  const [ignored] = await eslint.lintText("undeclared = 1;", {
    filePath: "ignored/probe.js",
  });
  assert.ok(!ignored.messages.some(({ ruleId }) => ruleId === "no-undef"));

  // The legacy config consumer still uses the Minimatch class API.
  const tester = require("@eslint/eslintrc").Legacy.OverrideTester.create(
    ["**/*.{js,ts}"],
    ["ignored/**"],
    scratch,
  );
  assert.equal(tester.test(path.join(scratch, "src/index.js")), true);
  assert.equal(tester.test(path.join(scratch, "ignored/index.js")), false);
  assert.equal(tester.test(path.join(scratch, "src/style.css")), false);

  // Project-service allowDefaultProject uses minimatch's function API.
  await fs.writeFile(
    path.join(scratch, "tsconfig.json"),
    JSON.stringify({
      compilerOptions: { strict: true },
      include: ["included.ts"],
    }),
  );
  await fs.writeFile(path.join(scratch, "included.ts"), "export {};\n");
  const code = "const count: number = 1;";
  const filePath = path.join(scratch, "probe.ts");
  await fs.writeFile(filePath, code);
  const options = {
    filePath,
    tsconfigRootDir: scratch,
    projectService: { allowDefaultProject: ["*.ts"] },
  };
  assert.ok(estree.parseAndGenerateServices(code, options).services.program);
  estree.clearCaches();
  assert.throws(
    () =>
      estree.parseAndGenerateServices(code, {
        ...options,
        projectService: { allowDefaultProject: ["other.ts"] },
      }),
    /not found|not.*included/i,
  );
  estree.clearCaches();

  // Exercise the Sucrase project CLI path changed from glob to tinyglobby.
  const project = path.join(scratch, "project");
  await fs.mkdir(path.join(project, "src/nested"), { recursive: true });
  const files = {
    "src/index.ts": "export const value: number = 1;\n",
    "src/nested/tool.ts": "export const name: string = 'probe';\n",
    "src/nested/plain.js": "export const plain = true;\n",
    "src/types.d.ts": "export declare const declared: number;\n",
    "src/.hidden.ts": "export const hidden = true;\n",
  };
  for (const [name, content] of Object.entries(files)) {
    await fs.writeFile(path.join(project, name), content);
  }
  await fs.writeFile(
    path.join(project, "tsconfig.json"),
    JSON.stringify({
      compilerOptions: { outDir: "out", module: "commonjs" },
      include: ["src/**/*.ts", "src/**/*.js"],
    }),
  );
  const cli = path.join(
    path.dirname(require.resolve("sucrase/package.json")),
    "bin/sucrase",
  );
  const compile = spawnSync(process.execPath, [cli, "--project", "."], {
    cwd: project,
    encoding: "utf8",
    timeout: 10000,
    maxBuffer: 65536,
  });
  assert.ifError(compile.error);
  assert.equal(compile.status, 0, compile.stderr);
  const generated = (
    await fs.readdir(path.join(project, "out"), { recursive: true })
  )
    .filter((name) => name.endsWith(".js"))
    .sort();
  assert.deepEqual(generated, [
    "src/index.js",
    "src/nested/plain.js",
    "src/nested/tool.js",
  ]);
  assert.match(
    await fs.readFile(path.join(project, "out/src/index.js"), "utf8"),
    /value.*=.*1/,
  );
} finally {
  estree.clearCaches();
  await fs.rm(scratch, { recursive: true, force: true });
}

// Bound both the child process and the caller's pattern expansion budget.
// This verifies the GHSA-g3hv-75wg-m249 preprocessor respects that budget;
// it is not a promise that arbitrary patterns have a constant cost.
const probe = spawnSync(
  process.execPath,
  [
    "--max-old-space-size=96",
    "--stack_size=512",
    "-e",
    `const assert = require('node:assert/strict');
     const { Minimatch } = require(process.argv[1]);
     const pattern = 'a/**/../b/c/'.repeat(18) + 'end';
     const m = new Minimatch(pattern, { optimizationLevel: 2, braceExpandMax: 64 });
     assert.ok(m.globParts.length <= 64);
     m.match('a/b/c/end');`,
    require.resolve("minimatch"),
  ],
  { timeout: 5000, encoding: "utf8", maxBuffer: 65536 },
);
assert.ifError(probe.error);
assert.equal(probe.status, 0, probe.stderr);
console.log(
  "Toolchain compatibility passed: ESLint flat/legacy, TypeScript project service, Sucrase CLI, bounded minimatch preprocessing.",
);

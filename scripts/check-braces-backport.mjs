import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";
const require = createRequire(import.meta.url);
const vendor = path.resolve("vendor/braces-backport");
const manifest = JSON.parse(
  await fs.readFile(path.join(vendor, "manifest.json"), "utf8"),
);
const provenance = JSON.parse(
  await fs.readFile(path.join(vendor, "provenance.json"), "utf8"),
);
const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");
const installed = path.dirname(require.resolve("braces/package.json"));
for (const [file, hash] of Object.entries(manifest.source_sha256))
  assert.equal(
    digest(await fs.readFile(path.join(installed, file))),
    hash,
    "Installed backport: " + file,
  );
assert.equal(require("braces/package.json").jvSecurityPatch, manifest.patch_id);
// Check every installed consumer, including nested copies, against the canonical artifact.
const lock = JSON.parse(await fs.readFile("package-lock.json", "utf8"));
const braceEntries = Object.entries(lock.packages).filter(([name]) =>
  name.endsWith("node_modules/braces"),
);
assert.ok(braceEntries.length > 0);
for (const [name, pkg] of braceEntries) {
  assert.equal(
    pkg.version,
    "3.0.3",
    "Retain upstream version; do not claim a registry fix",
  );
  assert.ok(
    pkg.resolved?.endsWith(
      "vendor/braces-backport/braces-3.0.3-depth-guard.1.tgz",
    ),
    name,
  );
  for (const [file, hash] of Object.entries(manifest.source_sha256))
    assert.equal(
      digest(await fs.readFile(path.join(name, file))),
      hash,
      name + "/" + file,
    );
}
for (const [name, pkg] of Object.entries(lock.packages)) {
  if (pkg.dependencies?.braces) {
    const consumer = createRequire(path.resolve(name, "package.json"));
    assert.equal(consumer.resolve("braces"), require.resolve("braces"), name);
  }
}
const scratch = await fs.mkdtemp(
  path.join(os.tmpdir(), "braces-backport-test-"),
);
try {
  const baselineTar = path.join(vendor, "upstream/braces-3.0.3.tgz");
  assert.equal(
    digest(await fs.readFile(baselineTar)),
    provenance.upstream_sha256,
  );
  const unpack = spawnSync("tar", ["-xzf", baselineTar, "-C", scratch], {
    timeout: 5000,
    encoding: "utf8",
  });
  assert.ifError(unpack.error);
  assert.equal(unpack.status, 0, unpack.stderr);
  const probe = spawnSync(
    process.execPath,
    [
      "--stack-size=256",
      "--max-old-space-size=64",
      "scripts/braces-depth-probe.mjs",
    ],
    {
      input: JSON.stringify({
        originalPath: path.join(scratch, "package"),
        patchedPath: installed,
      }),
      env: { ...process.env, NODE_PATH: path.resolve("node_modules") },
      timeout: 15000,
      maxBuffer: 64 * 1024,
      encoding: "utf8",
    },
  );
  assert.ifError(probe.error);
  assert.equal(probe.status, 0, probe.stderr);
  console.log("Bounded before/after reproduction:", probe.stdout);
  // Actual micromatch and fast-glob integrations, not just the library API.
  const mm = require("micromatch");
  assert.deepEqual(mm.braceExpand("src/*.{astro,ts}", { keepEscaping: true }), [
    "src/*.astro",
    "src/*.ts",
  ]);
  assert.ok(mm.parse("src/*.{astro,ts}").length > 0);
  assert.deepEqual(mm.braces("{a,b}"), ["(a|b)"]);
  assert.deepEqual(mm(["a.ts", "b.astro", "c.css"], "*.{ts,astro}"), [
    "a.ts",
    "b.astro",
  ]);
  await fs.writeFile(path.join(scratch, "a.ts"), "");
  await fs.writeFile(path.join(scratch, "b.astro"), "");
  const glob = require("fast-glob");
  assert.deepEqual((await glob("*.{ts,astro}", { cwd: scratch })).sort(), [
    "a.ts",
    "b.astro",
  ]);
  const deep = "{".repeat(101) + "x" + "}".repeat(101);
  assert.throws(() => mm.braces(deep), { code: "ERR_BRACES_DEPTH" });
  assert.throws(() => mm.braceExpand(deep), { code: "ERR_BRACES_DEPTH" });
  assert.throws(() => glob.sync(deep, { cwd: scratch }), {
    code: "ERR_BRACES_DEPTH",
  });
  // Chokidar's glob expansion is exercised by a real, isolated watcher.
  const chokidar = require("chokidar");
  const seen = [];
  const watcher = chokidar.watch(path.join(scratch, "*.{ts,astro}"), {
    ignoreInitial: false,
  });
  let timer;
  try {
    await new Promise((resolve, reject) => {
      timer = setTimeout(
        () => reject(new Error("Chokidar readiness timed out")),
        5000,
      );
      watcher.on("add", (file) => seen.push(path.basename(file)));
      watcher.once("error", reject);
      watcher.once("ready", resolve);
    });
    assert.deepEqual(seen.sort(), ["a.ts", "b.astro"]);
  } finally {
    clearTimeout(timer);
    await watcher.close();
  }
  console.log(
    "Canonical artifact, every installed braces consumer and glob/watcher integrations passed.",
  );
} finally {
  await fs.rm(scratch, { recursive: true, force: true });
}

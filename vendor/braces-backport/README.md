# Canonical local braces backport

This directory owns the shared `depth-guard.1` patch for the portfolio and
Blinktracking. Copy this directory and the four `scripts/*braces*` runners
unchanged into the other repository; do not create a second divergent fork.
The package is private, local and deterministic. Nothing is published to npm.

## Integration

Keep all unrelated dependencies/overrides. Add this direct development dependency:

```json
"braces": "file:vendor/braces-backport/braces-3.0.3-depth-guard.1.tgz"
```

Resolve every transitive braces edge to it:

```json
"overrides": { "braces": "$braces" }
```

Regenerate the lockfile with `npm install --package-lock-only --ignore-scripts`,
then run a clean `npm ci`. Run the full existing audit and add this independent CI
gate before it:

```sh
python3 scripts/package-braces-backport.py
node scripts/check-braces-backport.mjs
node scripts/test-braces-upstream.mjs
```

These gates are separate from npm audit. The artifact deliberately keeps
`name: braces` and `version: 3.0.3`; `jvSecurityPatch` identifies the local patch.
The audit still reports the original advisory here. Do not dismiss it, lower its
threshold, change the name/version to evade it, or call this an upstream fix.
A green registry audit would not independently prove a local fork's security.

## Evidence and scope

`provenance.json` pins the official release commit, npm URL and SHA-512 integrity.
`upstream/braces-3.0.3.tgz` is that original, vulnerable release, used only as a
bounded regression baseline; it is never installed as the application's override.
`source/` is the readable patched package. `depth-guard.1.patch` shows every change
from the official tarball, including this package's security note and private
metadata. `manifest.json` pins every shipped file, the patch and upstream tests.
The original MIT copyright and license are preserved.

The regression child uses a 256 KB stack, 64 MB heap, 15-second timeout and 64 KB
output cap. It demonstrates native stack exhaustion before the patch, controlled
errors afterwards, depth-boundary behavior, caller AST and internal walkers,
parent/child cycles, node budget, quoting/escaping, mixed parentheses/braces and
1,400 ordinary-input/option comparisons. The main gate verifies every installed
braces copy and its consumers; it also exercises micromatch, fast-glob and an
isolated Chokidar watcher. Temporary test files are removed on completion.

All 764 upstream tests are imported unchanged from the release commit and run
using Node's native test runner. A narrow adapter maps the synchronous Mocha
`describe`/`it` globals, upstream package imports and `bash-path` to `/bin/bash`.
It adds time/output limits to Bash subprocesses. It does not skip or rewrite
assertions and avoids installing upstream's obsolete test dependency tree.

See `source/BACKPORT.md` for the exact limits, controlled error codes and remaining
resource/application obligations. This patch does not claim to bound aggregate
Cartesian expansion, hostile JavaScript objects or arbitrary user-supplied input
arrays. Callers still need to handle input-validation exceptions.

## Maintenance

The repository owner maintains this backport until an upstream fix can replace it.
For an intentional source change, review the new diff against the pinned upstream
release, refresh `depth-guard.1.patch`, update the patch ID, and generate the
artifact with `python3 scripts/package-braces-backport.py --write`. Commit source,
patch, manifest and archive together. Run every independent gate, the full audit,
build and UI/content checks in both consumers. Do not merely regenerate hashes to
accept an unexplained change. Prefer an official compatible patch when available;
remove the local override only after its regression suite and all consumers pass.

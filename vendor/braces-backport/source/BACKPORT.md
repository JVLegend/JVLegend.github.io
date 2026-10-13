# Local depth-guard backport, revision 1

This is `braces` 3.0.3 (MIT, Jon Schlinkert), modified locally for
[GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm).
The original name and version are retained, with `jvSecurityPatch: depth-guard.1`.
This is not a release endorsed by upstream. Do not publish it to a registry.

The parser rejects nesting of braces **and parentheses** over 100 containers,
before allocating the next container. Recursive compile/expand/stringify walkers
perform an iterative AST preflight, including for directly supplied ASTs.
The preflight caps container depth at 100 and total visits at 20,010, and rejects
child cycles and cyclic/deep parent chains. Original parent links retained by
upstream while flattening invalid braces remain supported.
`maxDepth` can tighten the depth bound (integer 1–100), never disable or raise it.
Depth errors are `RangeError` with code `ERR_BRACES_DEPTH`, not a native stack
exhaustion. AST/option/budget errors have distinct `ERR_BRACES_*` codes.

Intentional compatibility change: patterns/ASTs exceeding these limits now fail
with a controlled error. CommonJS, normal outputs and existing options are kept.
Callers processing untrusted input must catch validation errors; an uncaught
validation exception can still terminate their application, just as upstream's
existing type/length/range errors can. The patch prevents unbounded recursion,
not every possible resource exhaustion. Existing input-length and numeric range
limits remain. Aggregate Cartesian expansion size, input-array length, huge
literal values in caller-created ASTs, accessors/proxies and hostile object
behavior are outside this patch; use external quotas/isolation for such input.
Caller-supplied ASTs are expected to be ordinary data objects, not executable
objects. Resource tests run in memory/stack/time-limited subprocesses.

See the enclosing provenance manifest, patch diff, tests and reproducible local
package artifact. Registry audit tools may still report 3.0.3, or omit a local
artifact; neither outcome establishes whether this patch is correct. Independent
source-integrity, regression, upstream and actual-consumer tests are required.

"""Build/check the deterministic local braces package without npm lifecycle hooks."""
import argparse
import difflib
import gzip
import hashlib
import io
import json
from pathlib import Path
import tarfile

root = Path(__file__).resolve().parents[1] / "vendor/braces-backport"
source = root / "source"
archive = root / "braces-3.0.3-depth-guard.1.tgz"
manifest = root / "manifest.json"
parser = argparse.ArgumentParser()
parser.add_argument("--write", action="store_true")
args = parser.parse_args()
# Independently prove that the review diff covers every source change.
provenance = json.loads((root / "provenance.json").read_text())
upstream_bytes = (root / "upstream/braces-3.0.3.tgz").read_bytes()
assert hashlib.sha256(upstream_bytes).hexdigest() == provenance["upstream_sha256"]
original = {}
with tarfile.open(fileobj=io.BytesIO(upstream_bytes), mode="r:gz") as upstream:
    for entry in upstream.getmembers():
        if entry.isfile():
            original[entry.name.removeprefix("package/")] = upstream.extractfile(entry).read().decode()
review_diff = []
for file in sorted(p for p in source.rglob("*") if p.is_file()):
    name = file.relative_to(source).as_posix()
    review_diff.extend(difflib.unified_diff(original.get(name, "").splitlines(True), file.read_text().splitlines(True), fromfile="a/" + name, tofile="b/" + name))
assert "".join(review_diff) == (root / "depth-guard.1.patch").read_text(), "Review diff does not match upstream/source"
assert set(original).issubset({p.relative_to(source).as_posix() for p in source.rglob("*") if p.is_file()}), "Upstream files removed"

buffer = io.BytesIO()
files = sorted(p for p in source.rglob("*") if p.is_file())
with gzip.GzipFile(fileobj=buffer, mode="wb", filename="", mtime=0) as compressed:
    with tarfile.open(fileobj=compressed, mode="w", format=tarfile.GNU_FORMAT) as package:
        for path in files:
            content = path.read_bytes()
            entry = tarfile.TarInfo("package/" + path.relative_to(source).as_posix())
            entry.size = len(content)
            entry.mode = 0o644
            package.addfile(entry, io.BytesIO(content))
content = buffer.getvalue()
record = {
    "patch_id": "depth-guard.1",
    "package_name": "braces",
    "package_version": "3.0.3",
    "archive_sha256": hashlib.sha256(content).hexdigest(),
    "source_sha256": {p.relative_to(source).as_posix(): hashlib.sha256(p.read_bytes()).hexdigest() for p in files},
    "patch_sha256": hashlib.sha256((root / "depth-guard.1.patch").read_bytes()).hexdigest(),
    "upstream_test_sha256": {p.relative_to(root / "upstream-tests").as_posix(): hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted((root / "upstream-tests/test").glob("*.js"))},
}
if args.write:
    archive.write_bytes(content)
    manifest.write_text(json.dumps(record, indent=2) + "\n")
else:
    assert archive.read_bytes() == content, "Package differs from its reviewed source"
    assert json.loads(manifest.read_text()) == record, "Backport manifest mismatch"
print("Verified deterministic braces artifact:", record["archive_sha256"])

/**
 * fix-imports.js
 *
 * Converts all `from 'src/...'` / `from "src/..."` style imports into
 * proper relative imports (./ or ../) across the whole src/ tree.
 *
 * Usage (run from the `server` folder, where `src/` lives):
 *   node fix-imports.js
 *
 * It's safe to re-run — files with no `src/...` imports are left untouched,
 * and it prints a summary of every file it changed.
 */

const fs = require('fs');
const path = require('path');

const SRC_ROOT = path.resolve(__dirname, 'src');

if (!fs.existsSync(SRC_ROOT)) {
  console.error(`Could not find ${SRC_ROOT}. Run this from the "server" folder.`);
  process.exit(1);
}

function walk(dir, filelist = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'dist') continue;
      walk(full, filelist);
    } else if (entry.isFile() && entry.name.endsWith('.ts')) {
      filelist.push(full);
    }
  }
  return filelist;
}

// Matches:  from 'src/foo/bar'   or   from "src/foo/bar"
const importRegex = /from\s+(['"])src\/([^'"]+)\1/g;

const files = walk(SRC_ROOT);
let filesChanged = 0;
let importsChanged = 0;
const problems = [];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const fileDir = path.dirname(file);

  const newContent = content.replace(importRegex, (match, quote, importPath) => {
    const targetAbs = path.join(SRC_ROOT, importPath);

    // Case-correct the resolved path against what's actually on disk,
    // so we don't bake in another casing mismatch.
    const corrected = correctCase(targetAbs, file, match);

    let rel = path.relative(fileDir, corrected);
    rel = rel.split(path.sep).join('/'); // normalize to forward slashes
    if (!rel.startsWith('.')) rel = './' + rel;

    importsChanged++;
    return `from ${quote}${rel}${quote}`;
  });

  if (newContent !== content) {
    fs.writeFileSync(file, newContent, 'utf8');
    filesChanged++;
    console.log('Updated:', path.relative(SRC_ROOT, file));
  }
}

// Walks the path segment by segment, matching each segment against the
// real directory entries on disk (case-insensitively), so the final
// relative import uses the ACTUAL casing that exists in git.
function correctCase(targetAbs, sourceFile, originalMatch) {
  const relFromSrc = path.relative(SRC_ROOT, targetAbs);
  const segments = relFromSrc.split(path.sep);

  let current = SRC_ROOT;
  const correctedSegments = [];

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const isLast = i === segments.length - 1;

    let entries;
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      problems.push(`${path.relative(SRC_ROOT, sourceFile)}: cannot read dir for "${originalMatch}"`);
      correctedSegments.push(seg);
      current = path.join(current, seg);
      continue;
    }

    let match = null;

    if (isLast) {
      // Import paths omit the .ts extension — match filename ignoring case & extension.
      match = entries.find(
        (e) => e.isFile() && path.parse(e.name).name.toLowerCase() === seg.toLowerCase(),
      );
    } else {
      match = entries.find((e) => e.isDirectory() && e.name.toLowerCase() === seg.toLowerCase());
    }

    if (!match) {
      problems.push(`${path.relative(SRC_ROOT, sourceFile)}: could not resolve "${originalMatch}" on disk`);
      correctedSegments.push(seg);
      current = path.join(current, seg);
      continue;
    }

    const realName = isLast ? path.parse(match.name).name : match.name;
    correctedSegments.push(realName);
    current = path.join(current, match.name);
  }

  return path.join(SRC_ROOT, ...correctedSegments);
}

console.log(`\nDone. Changed ${importsChanged} import(s) across ${filesChanged} file(s).`);

if (problems.length) {
  console.log(`\n${problems.length} import(s) could not be auto-resolved — check these manually:`);
  for (const p of problems) console.log('  -', p);
}
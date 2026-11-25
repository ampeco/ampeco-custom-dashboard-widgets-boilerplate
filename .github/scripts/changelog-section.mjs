/**
 * Prints one version's entry from CHANGELOG.md, for use as GitHub release notes.
 *
 * Usage: node .github/scripts/changelog-section.mjs 0.6.0
 *
 * A version entry starts at a level-two heading whose first word is the version
 * ("## 0.6.0 (security fix)") and ends at the next level-two heading.
 */
import { readFileSync } from "node:fs";

const version = process.argv[2];

if (!version) {
  console.error("Usage: node .github/scripts/changelog-section.mjs <version>");
  process.exit(1);
}

const changelogPath = new URL("../../CHANGELOG.md", import.meta.url);
const lines = readFileSync(changelogPath, "utf8").split("\n");
const versionHeading = /^##\s+(\d+\.\d+\.\d+[^\s(]*)/;

let firstLine = -1;
let lastLine = lines.length;

for (let i = 0; i < lines.length; i++) {
  const match = lines[i].match(versionHeading);

  if (!match) {
    continue;
  }

  if (firstLine === -1) {
    if (match[1] === version) {
      firstLine = i + 1;
    }
    continue;
  }

  lastLine = i;
  break;
}

if (firstLine === -1) {
  console.error(`CHANGELOG.md has no entry for version ${version}.`);
  process.exit(1);
}

const notes = lines.slice(firstLine, lastLine).join("\n").trim();

if (!notes) {
  console.error(`The CHANGELOG.md entry for version ${version} is empty.`);
  process.exit(1);
}

console.log(notes);

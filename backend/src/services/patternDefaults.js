import fs from "fs/promises";
import path from "path";

const PATTERNS_DIR = path.resolve(process.cwd(), "patterns");

/**
 * Loads defaults from a pattern file inside /patterns.
 * Accepts "a" or "a.json". Prevents path traversal.
 *
 * Expected pattern file format: JSON that contains either:
 * - { "defaults": { ... } }
 * Returns: defaults object (or null if none).
 */
export async function loadPatternDefaults(patternName) {
  if (!patternName || typeof patternName !== "string") return null;

  // Prevent path traversal; strip directories
  const safeBase = path.basename(patternName);

  // Allow patternName without extension; try a few candidates
  const candidates = [
    safeBase,
    `${safeBase}.pat`,
  ];

  for (const name of candidates) {
    const filePath = path.join(PATTERNS_DIR, name);
    const resolved = path.resolve(filePath);

    // Ensure file remains inside /patterns
    if (!resolved.startsWith(PATTERNS_DIR + path.sep)) {
      continue;
    }

    try {
      const raw = await fs.readFile(resolved, "utf8");
      const parsed = JSON.parse(raw);

      // Support both "defaults" and ".defaults"
      const defaults = parsed?.defaults ?? null;
      return defaults && typeof defaults === "object" ? defaults : null;
    } catch (err) {
      // try next candidate if file missing
      if (err && err.code === "ENOENT") continue;

      // if JSON parse fails or other error, surface it
      throw err;
    }
  }

  // no file found
  return null;
}

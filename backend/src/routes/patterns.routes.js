import express from "express";
import fs from "fs/promises";
import path from "path";

const router = express.Router();

// Absolute path to /patterns (sibling of /src)
const PATTERNS_DIR = path.resolve(process.cwd(), "patterns");

// Optional: allow only certain extensions
const ALLOWED_EXT = new Set([".pat"]);

router.get("/:filename", async (req, res) => {
  try {
    const rawName = req.params.filename;

    // Basic safety: avoid empty names
    if (!rawName || rawName.trim() === "") {
      return res.status(400).json({ error: "filename is required" });
    }

    // Normalize to a base name (strips any path like a/b/../c)
    const safeName = path.basename(rawName);

    // Optional: extension allowlist
    const ext = path.extname(safeName).toLowerCase();
    if (ext && !ALLOWED_EXT.has(ext)) {
      return res.status(400).json({ error: `file type not allowed: ${ext}` });
    }

    const filePath = path.join(PATTERNS_DIR, safeName);

    // Ensure resolved path is still inside PATTERNS_DIR
    const resolved = path.resolve(filePath);
    if (!resolved.startsWith(PATTERNS_DIR + path.sep)) {
      return res.status(400).json({ error: "invalid filename" });
    }

    const content = await fs.readFile(resolved, "utf8");

    // Return as JSON (easy for frontend)
    return res.json({
      filename: safeName,
      content,
    });
  } catch (err) {
    // File not found
    if (err && (err.code === "ENOENT" || err.code === "ENOTDIR")) {
      return res.status(404).json({ error: "file not found" });
    }

    console.error("patterns read error:", err);
    return res.status(500).json({ error: "server error" });
  }
});

export default router;

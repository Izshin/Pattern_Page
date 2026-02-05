import express from "express";
import fs from "fs/promises";
import path from "path";

const router = express.Router();

// Absolute path to /patterns (sibling of /src)
const PATTERNS_DIR = path.resolve(process.cwd(), "patterns");

// Optional: allow only certain extensions
const ALLOWED_EXT = new Set([".pat"]);

// GET /patterns - List all available patterns
router.get("/", async (req, res) => {
  try {
    const files = await fs.readdir(PATTERNS_DIR);
    const patternFiles = files.filter(file => 
      ALLOWED_EXT.has(path.extname(file).toLowerCase())
    );
    
    return res.json({
      patterns: patternFiles
    });
  } catch (err) {
    console.error("patterns list error:", err);
    return res.status(500).json({ error: "server error" });
  }
});

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

    // Try to parse as JSON
    let parsedData;
    try {
      parsedData = JSON.parse(content);
    } catch {
      // If not JSON, return raw content
      parsedData = { content };
    }

    // Return as JSON (easy for frontend)
    return res.json({
      filename: safeName,
      ...parsedData
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

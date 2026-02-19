import express from "express";
import { loadPatternDefaults } from "../services/patternCalculations/patternDefaults.js";

export async function resize(req, res) {
  try {
    const input = req.body ?? {};

    // If pattern is provided, load defaults and merge
    let defaults = null;
    if (input.pattern) {
      defaults = await loadPatternDefaults(input.pattern);
      console.log("Loaded defaults for pattern", input.pattern, defaults);
      if (!defaults) {
        return res.status(404).json({ error: "Pattern not found or has no defaults", pattern: input.pattern });
      }
    }

    let resized = randomizeDefaults(defaults);

    // 🚧 Calculations later — for now just return what will be used
    return res.json({
      ok: true,
      size: resized
    });
  } catch (err) {
    console.error("calculate error:", err);

    // JSON parse error in pattern file
    if (err instanceof SyntaxError) {
      return res.status(500).json({ error: "Pattern file is not valid JSON" });
    }

    return res.status(500).json({ error: "Server error" });
  }
}

function randomizeDefaults(defaults) {
  if (!defaults || typeof defaults !== "object") {
    return {};
  }
  const out = structuredClone(defaults);
  if (out["width-cm"]) { out["width-cm"] = Math.floor(Math.random() * 100)};
  if (out["height-cm"]) { out["height-cm"] = Math.floor(Math.random() * 100)};
  if (out["cast-on"]) { out["cast-on"] = Math.floor(Math.random() * 100)};
  if (out["ribbing-height-cm"]) { out["ribbing-height-cm"] = Math.floor(Math.random() * 100)};
  if (out["ribbing-width-stitches"]) { out["ribbing-width-stitches"] = Math.floor(Math.random() * 100)};
  if (out["before-motif-stitches"]) { out["before-motif-stitches"] = Math.floor(Math.random() * 100)};
  
  return out;
}

export async function calculate(req, res) {
  try {
    const { shape } = req.body;

    if (!shape) {
      return res.status(400).json({ error: "Shape is required" });
    }

    switch (shape.toLowerCase()) {
      case "line":
        await calcLine(req, res);
        break;
      case "rectangle":
        await calcRectangle(req, res);
        break;
      case "ellipse":
        await calcEllipse(req, res);
        break;
      default:
        res.status(400).json({ error: `Unknown shape '${shape}'` });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// calculate line
async function calcLine(req, res) {
  const { length, tension, return: returnType } = req.body;

  if (typeof length !== "number") {
    return res.status(400).json({ error: "length (number) is required" });
  }

  if (!returnType) {
    return res.status(400).json({ error: "return type is required" });
  }

  let result;
  switch (returnType.toLowerCase()) {
    case "stitch":
      if (!tension || typeof tension.x !== "number") {
        return res
          .status(400)
          .json({ error: "tension.x is required for return = 'stitch'" });
      }
      result = (length * tension.x) / 10;
      return res.json({ stitch: result });

    case "rows":
      if (!tension || typeof tension.y !== "number") {
        return res
          .status(400)
          .json({ error: "tension.y is required for return = 'rows'" });
      }
      result = (length * tension.y) / 10;
      return res.json({ rows: result });

    case "inch":
      result = Number((length / 2.54).toFixed(2));
      return res.json({ inch: result });

    default:
      return res
        .status(400)
        .json({ error: `Unknown return type '${returnType}'` });
  }
}

// calculate rectangle
async function calcRectangle(req, res) {
  const { width, height, tension } = req.body;

  if (typeof width !== "number" || typeof height !== "number") {
    return res
      .status(400)
      .json({ error: "width and height (numbers) are required" });
  }

  if (
    !tension ||
    typeof tension.x !== "number" ||
    typeof tension.y !== "number"
  ) {
    return res
      .status(400)
      .json({ error: "tension.x and tension.y are required" });
  }

  const stitches = (width * tension.x) / 10;
  const rows = (height * tension.y) / 10;
  const inch = {
    width: Number((width / 2.54).toFixed(2)),
    height: Number((height / 2.54).toFixed(2)),
  };

  return res.json({ stitches, rows, inch });
}

// calculate ellipse
async function calcEllipse(req, res) {
  // TODO: Implement ellipse calculation
  return res
    .status(501)
    .json({ error: "Ellipse calculation not implemented yet" });
}

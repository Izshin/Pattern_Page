import express from "express";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { solvePattern } from "../services/patternCalculator.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

/**
 * POST /pattern/calculate
 * Calculate pattern with user inputs and return accordion sections
 * 
 * Request body:
 * {
 *   "patternFile": "babyblanket1.pat",
 *   "tensionX": 18,
 *   "tensionY": 32,
 *   "width": 60,
 *   "height": 80
 * }
 */
router.post("/calculate", async (req, res) => {
    try {
        const { patternFile, tensionX, tensionY, width, height, motifWidth, motifHeight } = req.body;

        // Validate inputs - check for undefined/null, allow 0
        if (!patternFile || tensionX == null || tensionY == null || width == null || height == null) {
            console.error('Validation failed:', { patternFile, tensionX, tensionY, width, height });
            return res.status(400).json({
                error: "Missing required fields: patternFile, tensionX, tensionY, width, height",
                received: { patternFile, tensionX, tensionY, width, height }
            });
        }

        // Load pattern file
        const patternsDir = path.join(__dirname, "../../patterns");
        const filePath = path.join(patternsDir, patternFile);
        const fileContent = await fs.readFile(filePath, "utf-8");
        const patternData = JSON.parse(fileContent);

        // Update pattern with user inputs
        patternData.defaults["slider-tension"].x = Number(tensionX);
        patternData.defaults["slider-tension"].y = Number(tensionY);
        patternData.defaults["width-cm"] = Number(width);
        patternData.defaults["height-cm"] = Number(height);
        
        // Override motif dimensions if provided from URL (PrestaShop integration)
        if (motifWidth) {
            patternData.defaults["motif-width-stitches"] = Number(motifWidth);
        }
        if (motifHeight) {
            patternData.defaults["motif-height-rows"] = Number(motifHeight);
        }

        // Calculate pattern
        const result = solvePattern(patternData);

        if (result.errors.length > 0) {
            return res.status(400).json({
                errors: result.errors,
                warnings: result.warnings
            });
        }

        // Parse content into accordion sections
        const sections = parseAccordionSections(result.content, result.pat.calculated);

        res.json({
            success: true,
            warnings: result.warnings,
            sections: sections,
            calculated: result.pat.calculated,
            defaults: result.pat.defaults
        });

    } catch (error) {
        console.error("Error calculating pattern:", error);
        res.status(500).json({
            error: "Internal server error",
            message: error.message
        });
    }
});

/**
 * Parse content with ###SECTION### markers into accordion sections
 */
function parseAccordionSections(content, calculated) {
    const sections = [];
    const parts = content.split(/###([A-Z]+)###/);
    
    // Skip first empty part, then process pairs of (title, content)
    for (let i = 1; i < parts.length; i += 2) {
        const title = parts[i];
        const sectionContent = parts[i + 1]?.trim() || "";
        
        if (title && sectionContent) {
            sections.push({
                id: sections.length,
                title: formatTitle(title),
                content: sectionContent
            });
        }
    }
    
    return sections;
}

/**
 * Format section title for display
 */
function formatTitle(title) {
    return title.charAt(0) + title.slice(1).toLowerCase();
}

export default router;

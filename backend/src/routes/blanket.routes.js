import express from "express";
import { solvePattern } from "../services/patternCalculator.js";

const router = express.Router();

/**
 * POST /blanket/calculate
 * Calculate baby blanket pattern with motif repeats
 * 
 * Request body:
 * {
 *   "width": 80,           // cm
 *   "height": 100,         // cm
 *   "tension": {
 *     "x": 23,             // stitches per 10cm
 *     "y": 30              // rows per 10cm
 *   },
 *   "motif": {
 *     "width": 12,         // stitches
 *     "height": 16         // rows
 *   },
 *   "ribbing": {
 *     "height": 3,         // cm (optional, default: 3)
 *     "width": 8           // stitches (optional, default: 8)
 *   },
 *   "beforeMotif": 7       // stitches (optional, default: 7)
 * }
 */
router.post("/calculate", (req, res) => {
    try {
        const { width, height, tension, motif, ribbing, beforeMotif } = req.body;

        // Validate required fields
        if (!width || !height || !tension || !motif) {
            return res.status(400).json({
                error: "Missing required fields: width, height, tension, motif"
            });
        }

        if (!tension.x || !tension.y) {
            return res.status(400).json({
                error: "Tension must include x (stitches) and y (rows)"
            });
        }

        if (!motif.width || !motif.height) {
            return res.status(400).json({
                error: "Motif must include width (stitches) and height (rows)"
            });
        }

        // Build pattern object
        const patternData = {
            defaults: {
                "slider-tension": {
                    x: Number(tension.x),
                    y: Number(tension.y)
                },
                "width-cm": Number(width),
                "height-cm": Number(height),
                "motif-width-stitches": Number(motif.width),
                "motif-height-rows": Number(motif.height),
                "ribbing-height-cm": ribbing?.height || 3,
                "ribbing-width-stitches": ribbing?.width || 8,
                "before-motif-stitches": beforeMotif || 7,
                "cast-on": 0
            },
            content: `
Cast on {cast-on} stitches.
Blanket size: {width-cm} x {height-cm} cm

Work {ribbing-height-cm} cm in ribbing.
Then work motif pattern with {calculated.horizontalRepeats} repeats across and {calculated.verticalRepeats} repeats vertically.
Finish with {ribbing-height-cm} cm ribbing.
`
        };

        // Calculate pattern
        const result = solvePattern(patternData);

        if (result.errors.length > 0) {
            return res.status(400).json({
                errors: result.errors,
                warnings: result.warnings
            });
        }

        // Return successful result
        res.json({
            success: true,
            warnings: result.warnings,
            pattern: result.content,
            details: {
                castOn: result.pat.defaults["cast-on"],
                totalStitches: result.pat.calculated.totalStitches,
                totalRows: result.pat.calculated.totalRows,
                ribbingRows: result.pat.calculated.ribbingRows,
                horizontalRepeats: result.pat.calculated.horizontalRepeats,
                verticalRepeats: result.pat.calculated.verticalRepeats
            }
        });

    } catch (error) {
        console.error("Error calculating blanket pattern:", error);
        res.status(500).json({
            error: "Internal server error",
            message: error.message
        });
    }
});

export default router;

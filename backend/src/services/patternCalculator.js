/**
 * 1) Calculate and validate all knitting math
 */
function calculateBabyBlanketPattern(pat) {
    const d = pat.defaults;

    // --- Gauge conversion ---
    const stitchesPerCm = d["slider-tension"].x / 10;
    const rowsPerCm = d["slider-tension"].y / 10;

    // --- Size conversion ---
    const totalStitches = Math.round(d["width-cm"] * stitchesPerCm);
    const totalRows = Math.round(d["height-cm"] * rowsPerCm);

    // --- Ribbing ---
    const ribbingRows = Math.round(d["ribbing-height-cm"] * rowsPerCm);

    const warnings = [];
    const errors = [];

    if (ribbingRows * 2 >= totalRows) {
        errors.push("Ribbing height is too large for the blanket height.");
    }

    // --- Horizontal motif calculation ---
    const usableStitches =
        totalStitches -
        d["ribbing-width-stitches"] * 2 -
        d["before-motif-stitches"];

    const horizontalRepeats = Math.floor(
        usableStitches / d["motif-width-stitches"]
    );

    if (horizontalRepeats < 1) {
        errors.push("Motif does not fit horizontally.");
    }

    const remainingStitches =
        usableStitches -
        horizontalRepeats * d["motif-width-stitches"];

    if (remainingStitches !== 0) {
        warnings.push(
            `Motif does not fit evenly across width (${remainingStitches} leftover stitches).`
        );
    }

    // --- Cast-on (derived value) ---
    const castOn =
        d["ribbing-width-stitches"] * 2 +
        d["before-motif-stitches"] +
        horizontalRepeats * d["motif-width-stitches"];

    // --- Vertical motif calculation ---
    const usableRows = totalRows - ribbingRows * 2;

    const verticalRepeats = Math.floor(
        usableRows / d["motif-height-rows"]
    );

    if (verticalRepeats < 1) {
        errors.push("Motif does not fit vertically.");
    }

    const remainingRows =
        usableRows -
        verticalRepeats * d["motif-height-rows"];

    if (remainingRows !== 0) {
        warnings.push(
            `Motif does not fit evenly vertically (${remainingRows} leftover rows).`
        );
    }

    // --- Update pat defaults ---
    d["cast-on"] = castOn;

    // Optional: expose calculated values for debugging/UI
    pat.calculated = {
        totalStitches,
        totalRows,
        ribbingRows,
        horizontalRepeats,
        verticalRepeats
    };

    return { pat, warnings, errors };
}

/**
 * 2) Interpolate calculated values into content template
 * Supports nested paths like {slider-tension.x} and {calculated.horizontalRepeats}
 */
function interpolateContent(template, values) {
    return template.replace(/\{([^}]+)\}/g, (_, key) => {
        // Handle nested paths like "slider-tension.x" or "calculated.horizontalRepeats"
        const keys = key.split('.');
        let result = values;
        
        for (const k of keys) {
            if (result && typeof result === 'object' && k in result) {
                result = result[k];
            } else {
                return `{${key}}`; // Return placeholder if path not found
            }
        }
        
        return result ?? `{${key}}`;
    });
}

/**
 * 3) Final solved process
 */
function solvePattern(pat) {
    const result = calculateBabyBlanketPattern(pat);

    if (result.errors.length > 0) {
        return {
            errors: result.errors,
            warnings: result.warnings,
            content: null
        };
    }

    // Merge defaults and calculated values for interpolation
    const allValues = {
        ...result.pat.defaults,
        calculated: result.pat.calculated
    };

    const finalContent = interpolateContent(
        result.pat.content,
        allValues
    );

    return {
        errors: [],
        warnings: result.warnings,
        content: finalContent,
        pat: result.pat
    };
}

// Export functions for use in API
export { calculateBabyBlanketPattern, interpolateContent, solvePattern };

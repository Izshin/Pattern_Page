/**
 * 1) Calculate and validate all knitting math — Baby Blanket
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

    // Check if motif dimensions are provided
    const hasMotif = d["motif-width-stitches"] && d["motif-height-rows"];

    let horizontalRepeats = 0;
    let verticalRepeats = 0;
    let castOn = totalStitches;
    let motifWidthCm = null;
    let motifHeightCm = null;

    if (hasMotif) {
        // --- Horizontal motif calculation ---
        const usableStitches =
            totalStitches -
            d["ribbing-width-stitches"] * 2 -
            d["before-motif-stitches"];

        horizontalRepeats = Math.floor(
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
        castOn =
            d["ribbing-width-stitches"] * 2 +
            d["before-motif-stitches"] +
            horizontalRepeats * d["motif-width-stitches"];

        // --- Vertical motif calculation ---
        const usableRows = totalRows - ribbingRows * 2;

        verticalRepeats = Math.floor(
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

        // --- Calculate motif dimensions in cm ---
        motifWidthCm = Math.round(d["motif-width-stitches"] / stitchesPerCm);
        motifHeightCm = Math.round(d["motif-height-rows"] / rowsPerCm);
    }

    // --- Update pat defaults ---
    d["cast-on"] = castOn;

    // Optional: expose calculated values for debugging/UI
    pat.calculated = {
        totalStitches,
        totalRows,
        ribbingRows,
        horizontalRepeats,
        verticalRepeats,
        ...(hasMotif && {
            motifWidthStitches: d["motif-width-stitches"],
            motifHeightRows: d["motif-height-rows"],
            motifWidthCm,
            motifHeightCm
        })
    };

    return { pat, warnings, errors };
}

/**
 * 1b) Calculate and validate all knitting math — Sweater
 */
function calculateSweaterPattern(pat) {
    const d = pat.defaults;

    const stitchesPerCm = d["slider-tension"].x / 10;
    const rowsPerCm     = d["slider-tension"].y / 10;

    const totalStitches  = Math.round(d["body-width-cm"]  * stitchesPerCm);
    const totalRows      = Math.round(d["body-length-cm"] * rowsPerCm);
    const ribbingRows    = Math.round(d["ribbing-height-cm"] * rowsPerCm);

    // Cuff cast-on ≈ 35 % of body width (typical sleeve/cuff proportion)
    const cuffCastOn     = Math.round(d["body-width-cm"] * 0.35 * stitchesPerCm);

    // Motif placement starts after the bottom ribbing + a short stockinette intro
    const motifStartRows = ribbingRows + Math.round(totalRows * 0.05);

    const warnings = [];
    const errors   = [];

    const hasMotif = d["motif-width-stitches"] && d["motif-height-rows"];

    let horizontalRepeats = 0;
    let verticalRepeats   = 0;
    let motifWidthCm      = null;
    let motifHeightCm     = null;

    if (hasMotif) {
        // 80 % of total stitches available for the motif area (leave 10 % each side)
        const usableStitches = Math.round(totalStitches * 0.8);
        horizontalRepeats = Math.floor(usableStitches / d["motif-width-stitches"]);

        if (horizontalRepeats < 1) {
            errors.push("Motif does not fit horizontally on the sweater body.");
        }

        // Rows available for motif: body rows minus ribbing, start padding, and top 20 % (armhole zone)
        const usableRows = totalRows - ribbingRows - Math.round(totalRows * 0.05) - Math.round(totalRows * 0.2);
        verticalRepeats = Math.floor(usableRows / d["motif-height-rows"]);

        if (verticalRepeats < 1) {
            errors.push("Motif does not fit vertically on the sweater body.");
        }

        motifWidthCm  = Math.round(d["motif-width-stitches"] / stitchesPerCm);
        motifHeightCm = Math.round(d["motif-height-rows"]    / rowsPerCm);
    }

    pat.calculated = {
        totalStitches,
        totalRows,
        ribbingRows,
        castOn:         totalStitches,
        cuffCastOn,
        motifStartRows,
        horizontalRepeats,
        verticalRepeats,
        ...(hasMotif && {
            motifWidthStitches: d["motif-width-stitches"],
            motifHeightRows:    d["motif-height-rows"],
            motifWidthCm,
            motifHeightCm,
        }),
    };

    return { pat, warnings, errors };
}

/**
 * 1c) Calculate and validate all knitting math — Ski Hat
 */
function calculateHatPattern(pat) {
    const d = pat.defaults;

    const stitchesPerCm = d["slider-tension"].x / 10;
    const rowsPerCm     = d["slider-tension"].y / 10;

    // Round cast-on to nearest even number for 1×1 rib
    const rawCastOn   = Math.round(d["head-circumference-cm"] * stitchesPerCm);
    const castOn      = rawCastOn % 2 === 0 ? rawCastOn : rawCastOn + 1;

    const totalRows   = Math.round(d["hat-height-cm"]     * rowsPerCm);
    const ribbingRows = Math.round(d["ribbing-height-cm"] * rowsPerCm);

    // Crown decrease: 8 evenly-spaced decrease points, every other row
    const decreaseSections = 8;
    const decreaseRounds   = Math.ceil((castOn - 8) / decreaseSections);
    const crownRows        = decreaseRounds * 2;

    // Stitches per section after first decrease row (for the instructions)
    const stitchesPerSection           = Math.floor((castOn / decreaseSections) - 2);
    const stitchesAfterFirstDecrease   = castOn - decreaseSections;

    // Rows for stockinette before/after motif
    const rowsBeforeMotif  = 2;
    const warnings = [];
    const errors   = [];

    const hasMotif = d["motif-width-stitches"] && d["motif-height-rows"];

    let horizontalRepeats = 0;
    let verticalRepeats   = 0;
    let stitchesBefore    = 0;
    let rowsAfterMotif    = 0;
    let motifWidthCm      = null;
    let motifHeightCm     = null;

    if (hasMotif) {
        // Centre the motif; one repeat horizontally on a hat is typical
        horizontalRepeats = Math.floor(castOn / d["motif-width-stitches"]);
        if (horizontalRepeats < 1) {
            errors.push("Motif does not fit horizontally on the hat circumference.");
        }

        // Place the motif once, centred
        stitchesBefore = Math.floor((castOn - d["motif-width-stitches"]) / 2);

        // Rows available for motif: total − ribbing − before-rows − crown
        const usableRows  = totalRows - ribbingRows - rowsBeforeMotif - crownRows;
        verticalRepeats   = Math.floor(usableRows / d["motif-height-rows"]);
        if (verticalRepeats < 1) {
            errors.push("Motif does not fit vertically on the hat body.");
        }

        rowsAfterMotif = usableRows - (verticalRepeats * d["motif-height-rows"]);

        motifWidthCm  = Math.round(d["motif-width-stitches"] / stitchesPerCm);
        motifHeightCm = Math.round(d["motif-height-rows"]    / rowsPerCm);
    } else {
        // No motif: fill stockinette between ribbing and crown
        rowsAfterMotif = totalRows - ribbingRows - crownRows;
    }

    pat.calculated = {
        castOn,
        totalRows,
        ribbingRows,
        stockinetteBefore: rowsBeforeMotif,
        stitchesBefore,
        rowsAfterMotif,
        crownRows,
        decreaseSections,
        decreaseRounds,
        stitchesPerSection,
        stitchesAfterFirstDecrease,
        horizontalRepeats,
        verticalRepeats,
        ...(hasMotif && {
            motifWidthStitches: d["motif-width-stitches"],
            motifHeightRows:    d["motif-height-rows"],
            motifWidthCm,
            motifHeightCm,
        }),
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
 * Remove motif-related lines from content
 */
function removeMotifLines(content) {
    return content
        .split('\n')
        .filter(line => {
            // Remove lines containing motif-related placeholders or keywords
            const motifKeywords = [
                'motif-width-stitches',
                'motif-height-rows',
                'Motif size:',
                'Motif repeats:',
                'horizontalRepeats',
                'verticalRepeats'
            ];
            return !motifKeywords.some(keyword => line.includes(keyword));
        })
        .join('\n')
        // Clean up any double newlines that might result
        .replace(/\n{3,}/g, '\n\n');
}

/**
 * 3) Final solved process — dispatches to the correct calculator by pat.type
 */
function solvePattern(pat) {
    const type = pat.type || 'blanket';
    let result;
    if (type === 'sweater') {
        result = calculateSweaterPattern(pat);
    } else if (type === 'hat') {
        result = calculateHatPattern(pat);
    } else {
        result = calculateBabyBlanketPattern(pat);
    }

    if (result.errors.length > 0) {
        return {
            errors: result.errors,
            warnings: result.warnings,
            content: null
        };
    }

    // Check if motif data exists
    const hasMotif = result.pat.defaults["motif-width-stitches"] && result.pat.defaults["motif-height-rows"];

    // Merge defaults and calculated values for interpolation
    const allValues = {
        ...result.pat.defaults,
        calculated: result.pat.calculated
    };

    // Remove motif-related lines from content if no motif
    let contentTemplate = result.pat.content;
    if (!hasMotif) {
        contentTemplate = removeMotifLines(contentTemplate);
    }

    const finalContent = interpolateContent(
        contentTemplate,
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
export { calculateBabyBlanketPattern, calculateSweaterPattern, calculateHatPattern, interpolateContent, solvePattern };

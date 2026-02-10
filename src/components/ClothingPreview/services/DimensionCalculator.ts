import { Bounds } from '../models/Bounds';
import type { PatternDimensions } from '../models/PatternConfig';

interface CanvasConfig {
    containerWidth: number;
    containerHeight: number;
    padding: number;
    maxSize: number;
    ribbonSize: number; // Size of decorative border/ribbon in cm (from actual blanket dimensions)
}

interface CalculationResult {
    displayWidth: number;
    displayHeight: number;
    x: number;
    y: number;
    bounds: Bounds;
}

/**
 * Service class for calculating display dimensions and bounds for patterns
 * Handles scaling and centering logic
 */
export class DimensionCalculator {
    private readonly config: CanvasConfig;

    constructor(config: Partial<CanvasConfig> = {}) {
        this.config = {
            containerWidth: config.containerWidth ?? 400,
            containerHeight: config.containerHeight ?? 500,
            padding: config.padding ?? 20,
            maxSize: config.maxSize ?? 140,
            ribbonSize: config.ribbonSize ?? 5 // Default 5cm ribbon/border
        };
    }

    /**
     * Calculate display dimensions and bounds for a pattern
     */
    calculate(actualDimensions: PatternDimensions): CalculationResult {
        const { containerWidth, containerHeight, padding, maxSize } = this.config;
        
        const availableWidth = containerWidth - (padding * 2);
        const availableHeight = containerHeight - (padding * 2);

        // Calculate scale to fit within available space
        const scaleX = availableWidth / maxSize;
        const scaleY = availableHeight / maxSize;
        const scale = Math.min(scaleX, scaleY);

        // Calculate display dimensions
        const displayWidth = actualDimensions.width * scale;
        const displayHeight = actualDimensions.height * scale;

        // Center the pattern
        const x = padding + (availableWidth - displayWidth) / 2;
        const y = padding + (availableHeight - displayHeight) / 2;

        // Calculate ribbon offset in pixels (scaled from cm)
        // The ribbon size is in cm, scale it to pixels based on the pattern scale
        const ribbonOffsetX = (this.config.ribbonSize / actualDimensions.width) * displayWidth;
        const ribbonOffsetY = (this.config.ribbonSize / actualDimensions.height) * displayHeight;

        // Create bounds accounting for decorative ribbon/border
        const bounds = new Bounds(
            x + ribbonOffsetX,
            y + ribbonOffsetY,
            x + displayWidth - ribbonOffsetX,
            y + displayHeight - ribbonOffsetY
        );

        return {
            displayWidth,
            displayHeight,
            x,
            y,
            bounds
        };
    }

    /**
     * Get default design bounds for sweater patterns
     */
    getDefaultDesignBounds(): Bounds {
        return new Bounds(50, 50, 350, 350);
    }

    /**
     * Get stage dimensions
     */
    getStageDimensions() {
        return {
            width: this.config.containerWidth,
            height: this.config.containerHeight
        };
    }
}

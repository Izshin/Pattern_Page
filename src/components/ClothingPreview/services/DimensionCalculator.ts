import { Bounds } from '../models/Bounds';
import type { PatternDimensions } from '../models/PatternConfig';

interface CanvasConfig {
    containerWidth: number;
    containerHeight: number;
    padding: number;
    maxSize: number;
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
            maxSize: config.maxSize ?? 140
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

        // Create bounds with slight adjustments for better fit
        const bounds = new Bounds(
            x,
            y,
            x + displayWidth + 5,
            y + displayHeight + 10
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

import { checkRectIntersection } from './geometry';

// Define minimal interface to avoid circular dependency
interface RectObject {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    scaleX?: number;
    scaleY?: number;
}

interface Bounds {
    left: number;
    top: number;
    right: number;
    bottom: number;
}

interface Position {
    x: number;
    y: number;
}

/**
 * Finds the closest valid position for a motif that doesn't overlap with others.
 * Searches in a spiral pattern from the start position.
 * Returns null if no valid position is found within the search limit.
 */
export const findClosestValidPosition = (
    startX: number,
    startY: number,
    width: number,
    height: number,
    scaleX: number,
    scaleY: number,
    existingMotifs: RectObject[],
    bounds: Bounds,
    padding: number = 0
): Position | null => {
    let x = startX;
    let y = startY;
    let step = 0;
    const maxSteps = 500; // Search limit
    const stepSize = 10; // Finer grain for smoother snapping
    let direction = 0; // 0: right, 1: down, 2: left, 3: up
    let stepsInDirection = 1;
    let stepsTaken = 0;
    let turnCounter = 0;

    // Helper to check collision at specific x,y
    const checkCollision = (checkX: number, checkY: number) => {
        const currentRect = {
            x: checkX + padding,
            y: checkY + padding,
            width: Math.max(1, width * scaleX - (padding * 2)),
            height: Math.max(1, height * scaleY - (padding * 2)),
        };

        return existingMotifs.some(other => {
            const oScaleX = other.scaleX || 1;
            const oScaleY = other.scaleY || 1;

            const otherRect = {
                x: other.x + padding,
                y: other.y + padding,
                width: Math.max(1, other.width * oScaleX - (padding * 2)),
                height: Math.max(1, other.height * oScaleY - (padding * 2)),
            };
            return checkRectIntersection(currentRect, otherRect);
        });
    };

    // Helper to check if position is within bounds (WITHOUT padding - use exact bounds)
    const isWithinBounds = (checkX: number, checkY: number) => {
        return checkX >= bounds.left &&
            checkY >= bounds.top &&
            (checkX + width * scaleX) <= bounds.right &&
            (checkY + height * scaleY) <= bounds.bottom;
    };

    // Check start position first
    if (isWithinBounds(x, y) && !checkCollision(x, y)) {
        return { x, y };
    }

    // Spiral search
    while (step < maxSteps) {
        // Move in current direction
        switch (direction) {
            case 0: x += stepSize; break; // Right
            case 1: y += stepSize; break; // Down
            case 2: x -= stepSize; break; // Left
            case 3: y -= stepSize; break; // Up
        }

        if (isWithinBounds(x, y) && !checkCollision(x, y)) {
            return { x, y };
        }

        stepsTaken++;
        if (stepsTaken >= stepsInDirection) {
            stepsTaken = 0;
            direction = (direction + 1) % 4;
            turnCounter++;
            if (turnCounter % 2 === 0) {
                stepsInDirection++;
            }
        }

        step++;
    }

    // No valid position found within search limit
    return null;
};

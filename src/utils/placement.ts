import { checkRectIntersection } from './geometry';

// Define minimal interface to avoid circular dependency
interface RectObject {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation?: number;
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
 */
export const findClosestValidPosition = (
    startX: number,
    startY: number,
    width: number,
    height: number,
    rotation: number,
    scaleX: number,
    scaleY: number,
    existingMotifs: RectObject[],
    bounds: Bounds,
    padding: number = 0
): Position => {
    let x = startX;
    let y = startY;
    let step = 0;
    const maxSteps = 100; // Search limit
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
            rotation,
        };

        return existingMotifs.some(other => {
            const oScaleX = other.scaleX || 1;
            const oScaleY = other.scaleY || 1;

            const otherRect = {
                x: other.x + padding,
                y: other.y + padding,
                width: Math.max(1, other.width * oScaleX - (padding * 2)),
                height: Math.max(1, other.height * oScaleY - (padding * 2)),
                rotation: other.rotation || 0,
            };
            return checkRectIntersection(currentRect, otherRect);
        });
    };

    // Check start position first
    if (!checkCollision(x, y)) {
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

        // Clamp to bounds (optional: if we want to ensure it stays inside)
        // If clamped value is different, we might be hitting a wall, so just continue
        // But for "closest valid", we check if the new pos is valid
        // Ideally we respect bounds, but if the only valid spot is SLIGHTLY out, maybe allow?
        // Let's enforce strict bounds for now.

        const isWithinBounds =
            x >= bounds.left &&
            y >= bounds.top &&
            (x + width * scaleX) <= bounds.right &&
            (y + height * scaleY) <= bounds.bottom;

        if (isWithinBounds && !checkCollision(x, y)) {
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

    // Fallback: Return original start if no spot found (or maybe just return start and let overlap happen)
    return { x: startX, y: startY };
};

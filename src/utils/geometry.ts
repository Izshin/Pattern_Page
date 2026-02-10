export interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
}

/**
 * Checks if two axis-aligned rectangles intersect using AABB collision detection.
 * Simple and efficient overlap detection without rotation support.
 */
export const checkRectIntersection = (r1: Rect, r2: Rect): boolean => {
    // Check if rectangles do NOT overlap, then negate
    // No overlap conditions:
    // - r1 is completely to the left of r2
    // - r1 is completely to the right of r2
    // - r1 is completely above r2
    // - r1 is completely below r2
    return !(
        r1.x + r1.width <= r2.x ||  // r1 left of r2
        r1.x >= r2.x + r2.width ||  // r1 right of r2
        r1.y + r1.height <= r2.y || // r1 above r2
        r1.y >= r2.y + r2.height     // r1 below r2
    );
};

export interface Point {
    x: number;
    y: number;
}

export interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number; // in degrees
}

/**
 * Calculates the four corners of a rotated rectangle.
 */
export const getRotatedRectCorners = (rect: Rect): Point[] => {
    const angleRad = (rect.rotation * Math.PI) / 180;
    const cx = rect.x + rect.width / 2;
    const cy = rect.y + rect.height / 2;

    // Unrotated corners relative to center
    const w2 = rect.width / 2;
    const h2 = rect.height / 2;

    // Corners relative to center: TL, TR, BR, BL
    // Note: Konva's rotation is clockwise positive.
    // Standard rotation matrix:
    // x' = x*cos(theta) - y*sin(theta)
    // y' = x*sin(theta) + y*cos(theta)

    const corners = [
        { x: -w2, y: -h2 },
        { x: w2, y: -h2 },
        { x: w2, y: h2 },
        { x: -w2, y: h2 },
    ];

    return corners.map(p => ({
        x: cx + (p.x * Math.cos(angleRad) - p.y * Math.sin(angleRad)),
        y: cy + (p.x * Math.sin(angleRad) + p.y * Math.cos(angleRad))
    }));
};

/**
 * Projects a polygon onto an axis and returns the min/max values.
 */
const projectPolygon = (axis: Point, polygon: Point[]) => {
    let min = Infinity;
    let max = -Infinity;

    for (const p of polygon) {
        const dot = p.x * axis.x + p.y * axis.y;
        if (dot < min) min = dot;
        if (dot > max) max = dot;
    }
    return { min, max };
};

/**
 * Checks if two convex polygons intersect using the Separating Axis Theorem (SAT).
 */
export const doPolygonsIntersect = (poly1: Point[], poly2: Point[]): boolean => {
    const polygons = [poly1, poly2];

    for (const polygon of polygons) {
        for (let i = 0; i < polygon.length; i++) {
            // Get edge
            const p1 = polygon[i];
            const p2 = polygon[(i + 1) % polygon.length];

            // Get normal (axis)
            const normal = { x: -(p2.y - p1.y), y: p2.x - p1.x };

            // Normalize axis (optional for SAT boolean check, but good practice)
            const len = Math.sqrt(normal.x * normal.x + normal.y * normal.y);
            const axis = { x: normal.x / len, y: normal.y / len };

            // Project both polygons
            const proj1 = projectPolygon(axis, poly1);
            const proj2 = projectPolygon(axis, poly2);

            // Check overlap
            if (proj1.max < proj2.min || proj2.max < proj1.min) {
                return false; // Found a separating axis
            }
        }
    }
    return true; // No separating axis found
};

/**
 * Checks if two rotated rectangles intersect.
 */
export const checkRectIntersection = (r1: Rect, r2: Rect): boolean => {
    const poly1 = getRotatedRectCorners(r1);
    const poly2 = getRotatedRectCorners(r2);
    return doPolygonsIntersect(poly1, poly2);
};

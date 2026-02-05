import { checkRectIntersection, getRotatedRectCorners } from './src/utils/geometry';

function assert(condition: boolean, message: string) {
    if (!condition) {
        console.error(`❌ FAILED: ${message}`);
        process.exit(1);
    } else {
        console.log(`✅ PASSED: ${message}`);
    }
}

console.log("Running Geometry Tests...");

// 1. Simple non-overlapping rectangles
const r1 = { x: 0, y: 0, width: 10, height: 10, rotation: 0 };
const r2 = { x: 20, y: 0, width: 10, height: 10, rotation: 0 };
assert(checkRectIntersection(r1, r2) === false, "Disjoint rectangles should not intersect");

// 2. Simple overlapping rectangles
const r3 = { x: 5, y: 0, width: 10, height: 10, rotation: 0 };
assert(checkRectIntersection(r1, r3) === true, "Overlapping rectangles should intersect");

// 3. Touching rectangles (should count as intersection with SAT usually, or maybe not depending on strict < vs <=. 
// My SAT implementation uses < so touching might be false. Let's check.)
// proj1.max < proj2.min || proj2.max < proj1.min
// If they touch, max == min. So < is false. So they would "intersect".
const r4 = { x: 10, y: 0, width: 10, height: 10, rotation: 0 };
assert(checkRectIntersection(r1, r4) === true, "Touching rectangles should intersect");

// 4. Rotated intersection
// Rotate r1 45 degrees. Center is 5,5.
// Corners will extend further.
const r5 = { x: 0, y: 0, width: 10, height: 10, rotation: 45 };
// A rect at 12,0. Unrotated check: 0+10=10 < 12. No overlap.
// Rotated check: The corner of r5 at 45deg extends to ~5 + 5*sqrt(2) ≈ 12.07. 
// So a rect at 11,0 should intersect.
const r6 = { x: 11, y: 4, width: 2, height: 2, rotation: 0 };
assert(checkRectIntersection(r5, r6) === true, "Rotated rect should intersect nearby rect");

console.log("All tests passed!");

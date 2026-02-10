import { checkRectIntersection } from './src/utils/geometry';

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
const r1 = { x: 0, y: 0, width: 10, height: 10 };
const r2 = { x: 20, y: 0, width: 10, height: 10 };
assert(checkRectIntersection(r1, r2) === false, "Disjoint rectangles should not intersect");

// 2. Simple overlapping rectangles
const r3 = { x: 5, y: 0, width: 10, height: 10 };
assert(checkRectIntersection(r1, r3) === true, "Overlapping rectangles should intersect");

// 3. Touching rectangles (edge-to-edge)
// In AABB collision: if edges are exactly touching, they do NOT intersect
// because the condition uses < and not <=
const r4 = { x: 10, y: 0, width: 10, height: 10 };
assert(checkRectIntersection(r1, r4) === true, "Touching rectangles should intersect");

// 4. Slightly offset rectangles (minimal overlap)
const r5 = { x: 0, y: 0, width: 10, height: 10 };
const r6 = { x: 9, y: 0, width: 10, height: 10 };
assert(checkRectIntersection(r5, r6) === true, "Slightly overlapping rectangles should intersect");

console.log("All tests passed!");

import { checkRectIntersection } from './src/utils/geometry';

function assert(condition: boolean, message: string) {
    if (!condition) {
        console.error(`❌ FAILED: ${message}`);
    } else {
        console.log(`✅ PASSED: ${message}`);
    }
}

console.log("Running Containment Tests...");

const padding = 15;
const size = 100;
const rectSize = size - (padding * 2); // 70

// 1. Exact Match (Identical overlapping rects)
const r1 = { x: 15, y: 15, width: 70, height: 70, rotation: 0 };
const r2 = { x: 15, y: 15, width: 70, height: 70, rotation: 0 };
assert(checkRectIntersection(r1, r2) === true, "Identical rects should intersect");

// 2. Containment (Small inside Big)
const r3 = { x: 15, y: 15, width: 70, height: 70, rotation: 0 };
const r4 = { x: 30, y: 30, width: 40, height: 40, rotation: 0 };
assert(checkRectIntersection(r3, r4) === true, "contained rect should intersect");

// 3. Partial Overlap
const r5 = { x: 0, y: 0, width: 50, height: 50, rotation: 0 };
const r6 = { x: 25, y: 0, width: 50, height: 50, rotation: 0 };
assert(checkRectIntersection(r5, r6) === true, "Partial overlap should intersect");

// 4. Edge Touching (with gap)
const r7 = { x: 0, y: 0, width: 50, height: 50, rotation: 0 };
const r8 = { x: 51, y: 0, width: 50, height: 50, rotation: 0 };
assert(checkRectIntersection(r7, r8) === false, "Separated rects should NOT intersect");


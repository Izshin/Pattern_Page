# Development Diary

## 05/02/2026

### Baby Blanket Pattern Support - Full Implementation

This update adds complete baby blanket pattern functionality with dynamic calculations, real-time UI updates, and backend-driven pattern generation.

---

#### Backend Enhancements

- **Pattern Calculator Service** (`patternCalculator.js`): Core calculation engine for knitting math including stitch counts, row calculations, motif repeats, and gauge conversions. Supports nested placeholder interpolation (`{calculated.horizontalRepeats}`, `{slider-tension.x}`)

- **Pattern API Endpoints**: 
  - `/pattern/calculate`: Real-time pattern calculations based on tension/size slider inputs
  - `/blanket`: Baby blanket pattern endpoint with section parsing
  - Enhanced pattern routes with section marker support (`###SIZE###`, `###MATERIALS###`, etc.)

- **Baby Blanket Pattern File**: Restructured with dynamic section markers and comprehensive template variables for automated instruction generation

#### Frontend Features

- **URL-Based Pattern Switching**: Added `?pattern=BabyBlanket` parameter support for toggling between sweater and blanket modes

- **Dynamic Controls**: 
  - Dual-slider system for baby blanket (width: 60-140cm, height: 80-140cm, step: 10)
  - Universal tension slider (8-40 with step: 1) for all patterns
  - Conditional UI rendering based on pattern type

- **Real-Time Visual Feedback**:
  - Dynamic blanket image scaling based on backend calculations
  - Proportional resizing maintaining aspect ratio within fixed 400×500 container
  - Max size (140×140cm) fills available space, smaller sizes scale accordingly
  - Debounced API calls (500ms) on slider changes

- **Dynamic Accordion Instructions**:
  - Backend-driven section generation from pattern file markers
  - Consistent typography matching sweater pattern (3.4rem headers, proper paragraph spacing)
  - Auto-populated with calculated values (cast-on stitches, motif repeats, total rows)

#### Technical Infrastructure

- **API Utility** (`api.ts`): Centralized pattern calculation API communication
- **Type Definitions** (`pattern.ts`): TypeScript interfaces for pattern data structures
- **State Management**: Added `blanketDimensions` and `accordionSections` states with automatic updates from backend

#### Draggable Motif System

- **Dynamic Bounds System**: 
  - Blanket bounds calculated as percentage-based padding (7% horizontal, 6% vertical) to account for ribbon border
  - Real-time bounds enforcement during drag, transform, and placement operations
  - Visual indicator (blue dashed lines) showing exact draggable canvas area

- **Collision Detection**:
  - Separating Axis Theorem (SAT) implementation for rotated rectangle intersection
  - 25px collision padding between motifs for visual spacing
  - Automatic position adjustment to nearest valid location on collision
  - Spiral search algorithm for optimal placement

- **Bounds Enforcement**:
  - Fixed dimension tracking using base width/height instead of group bounds
  - Separate collision padding (motif-to-motif) and bounds padding (motif-to-edge)
  - Proper handling of scaled and rotated motifs within blanket interior
  - Real-time constraint checking in `useMotifDraggable` hook

- **Motif Management**:
  - Maximum 4 motifs per blanket
  - Duplicate/delete functionality with keyboard shortcuts (Delete/Backspace)
  - Selection state management with global click handlers
  - Counter-rotated action buttons maintaining upright orientation

#### Statistics

**Files Modified**: 15 files | **Lines Changed**: +909 / -102

**Modified Files**:
- `backend/patterns/babyblanket1.pat`
- `backend/src/routes/blanket.routes.js` (new)
- `backend/src/routes/pattern.routes.js` (new)
- `backend/src/routes/patterns.routes.js`
- `backend/src/server.js`
- `backend/src/services/patternCalculator.js` (new)
- `src/App.tsx`
- `src/assets/Patterns/BabybBlanketPatternImage.png` (new)
- `src/components/ClothingPreview/ClothingPreview.css`
- `src/components/ClothingPreview/ClothingPreview.tsx`
- `src/components/Controls/Controls.css`
- `src/components/Controls/Controls.tsx`
- `src/components/InfoSection/InfoSection.tsx`
- `src/types/pattern.ts` (new)
- `src/utils/api.ts` (new)
- `src/components/ClothingPreview/hooks/useMotifDraggable.ts` (modified)
- `src/components/ClothingPreview/hooks/useMotifLogic.ts` (modified)
- `src/components/ClothingPreview/Motif/DraggableMotif.tsx` (modified)
- `src/utils/placement.ts` (modified)
- `src/utils/geometry.ts` (new)

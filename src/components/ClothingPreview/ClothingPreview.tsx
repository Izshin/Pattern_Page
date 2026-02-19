import { useState, useEffect, useRef, useMemo } from 'react';
import './ClothingPreview.css';
import { ClothingDropdown, PatternCanvas } from './components';
import { useMotifLogic } from './hooks/useMotifLogic';
import { usePatternConfig } from './hooks/usePatternConfig';
import { DimensionCalculator } from './services';
import { Bounds } from './models/Bounds';
import BabyBlanketImage from '../../assets/Patterns/BabybBlanketPatternImage.png';
import SweaterPatternImage from '../../assets/Patterns/SweaterPattern.png';
import HatPatternImage from '../../assets/Patterns/HatPattern.png';
import InfoModal from '../Modal/InfoModal';

interface ClothingPreviewProps {
    blanketDimensions?: { width: number; height: number };
    motifSize?: { stitches: number; rows: number; widthCm: number; heightCm: number } | null;
    /** Raw pixel dimensions fetched from the motif JSON — used as a canvas-size fallback
     *  when motifSize is null (e.g. sweater, where no backend tension calculation runs). */
    motifDimensions?: { width: number; height: number } | null;
    motifImageUrl?: string | null;
    onMotifsCannotFit?: () => void;
    onMotifsUpdatedSuccessfully?: () => void;
}

interface MotifDisplayDimensions {
    width: number;
    height: number;
}

/**
 * Refactored ClothingPreview component using clean architecture
 * - Separated concerns: UI components, business logic, and services
 * - Uses service classes for calculations and motif management
 * - Improved component composition
 */
const ClothingPreview: React.FC<ClothingPreviewProps> = ({ 
    blanketDimensions = { width: 60, height: 80 },
    motifSize = null,
    motifDimensions = null,
    motifImageUrl = null,
    onMotifsCannotFit,
    onMotifsUpdatedSuccessfully
}) => {
    // Pattern configuration from URL
    const patternConfig = usePatternConfig(blanketDimensions);
    
    // Dimension calculator service (memoized)
    const dimensionCalculator = useMemo(() => new DimensionCalculator({
        containerHeight: 390  // Reduced from default 500
    }), []);

    // Calculate display dimensions for baby blanket
    const blanketCalc = useMemo(() => {
        if (!patternConfig.isBabyBlanket) return null;
        return dimensionCalculator.calculate(
            patternConfig.dimensions || blanketDimensions
        );
    }, [patternConfig, dimensionCalculator, blanketDimensions]);

    // Sweater-specific dimensions — chosen so the image fills most of the canvas.
    // The PNG is 1600×1200 (landscape) but the sweater sketch itself is portrait-like;
    // using a portrait aspect ratio here keeps the sketch readable and large.
    // Tune width/height to change the rendered size on the canvas.
    const SWEATER_CANVAS_DIMS = useMemo(() => ({ width: 130, height: 130 }), []);

    // Calculate display dimensions for sweater (only when type is sweater, not hat)
    const sweaterCalc = useMemo(() => {
        if (patternConfig.isBabyBlanket || patternConfig.isHat) return null;
        return dimensionCalculator.calculate(SWEATER_CANVAS_DIMS);
    }, [patternConfig.isBabyBlanket, patternConfig.isHat, dimensionCalculator, SWEATER_CANVAS_DIMS]);

    // Hat-specific canvas dimensions.
    // The PNG is 135×119 px (nearly square); smaller virtual dims = bigger rendered image.
    // Tune width/height to change the rendered size on the canvas.
    const HAT_CANVAS_DIMS = useMemo(() => ({ width: 85, height: 75 }), []);

    // Calculate display dimensions for hat
    const hatCalc = useMemo(() => {
        if (!patternConfig.isHat) return null;
        return dimensionCalculator.calculate(HAT_CANVAS_DIMS);
    }, [patternConfig.isHat, dimensionCalculator, HAT_CANVAS_DIMS]);

    // Fractions that map the knittable body area inside HatPattern.png.
    // Adjust these to move the droppable rectangle (use "Show bounds" toggle to visualise).
    const HAT_BODY_FRACTIONS = useMemo(() => ({
        left:   0.10,   // past left edge / brim start
        top:    0.12,   // below the very top of the hat sketch
        right:  0.90,   // before right edge
        bottom: 0.80,   // above the brim ribbing
    }), []);

    // Hat body bounds derived from hatCalc + fractions
    const hatBodyBounds = useMemo(() => {
        if (!hatCalc) return null;
        const { x: imgX, y: imgY, displayWidth: imgW, displayHeight: imgH } = hatCalc;
        return new Bounds(
            imgX + imgW * HAT_BODY_FRACTIONS.left,
            imgY + imgH * HAT_BODY_FRACTIONS.top,
            imgX + imgW * HAT_BODY_FRACTIONS.right,
            imgY + imgH * HAT_BODY_FRACTIONS.bottom,
        );
    }, [hatCalc, HAT_BODY_FRACTIONS]);

    // Fractions that map the sweater body/torso inside the PNG.
    // Adjust these to move the droppable rectangle (use "Show bounds" toggle to visualise).
    const SWEATER_BODY_FRACTIONS = useMemo(() => ({
        left:   0.32,   // start of torso — past the left sleeve
        top:    0.17,   // start of torso — below collar/shoulders
        right:  0.63,   // end of torso   — before right sleeve tip
        bottom: 0.73,   // end of torso   — above bottom hem ribbing
    }), []);

    // Body bounds derived from sweaterCalc + fractions — computed independently of sweaterImage
    // so useMotifLogic receives the correct area before the image finishes loading.
    const sweaterBodyBounds = useMemo(() => {
        if (!sweaterCalc) return null;
        const { x: imgX, y: imgY, displayWidth: imgW, displayHeight: imgH } = sweaterCalc;
        return new Bounds(
            imgX + imgW * SWEATER_BODY_FRACTIONS.left,
            imgY + imgH * SWEATER_BODY_FRACTIONS.top,
            imgX + imgW * SWEATER_BODY_FRACTIONS.right,
            imgY + imgH * SWEATER_BODY_FRACTIONS.bottom,
        );
    }, [sweaterCalc, SWEATER_BODY_FRACTIONS]);

    // Design bounds — what useMotifLogic uses to place / constrain motifs
    const designBounds = useMemo(() => {
        if (blanketCalc) return blanketCalc.bounds;
        if (sweaterBodyBounds) return sweaterBodyBounds;
        if (hatBodyBounds) return hatBodyBounds;
        return dimensionCalculator.getDefaultDesignBounds();
    }, [blanketCalc, sweaterBodyBounds, hatBodyBounds, dimensionCalculator]);

    // Stage dimensions
    const stageDimensions = dimensionCalculator.getStageDimensions();

    // Calculate motif display dimensions based on tension (works for blanket, sweater, and hat)
    const motifDisplayDimensions = useMemo<MotifDisplayDimensions | null>(() => {
        const calc = blanketCalc ?? sweaterCalc ?? hatCalc;
        if (!calc) return null;

        // If the backend returned tension-scaled cm dimensions, use those
        if (motifSize) {
            const dims = patternConfig.isBabyBlanket ? blanketDimensions
                : patternConfig.isHat ? HAT_CANVAS_DIMS
                : SWEATER_CANVAS_DIMS;
            const scaleX = calc.displayWidth  / dims.width;
            const scaleY = calc.displayHeight / dims.height;
            const scale  = (scaleX + scaleY) / 2;
            return {
                width:  motifSize.widthCm  * scale,
                height: motifSize.heightCm * scale
            };
        }

        // Fallback: scale raw pixel dimensions from motif JSON to fit inside the body bounds
        const bodyBounds = sweaterBodyBounds ?? hatBodyBounds;
        if (motifDimensions && bodyBounds) {
            const maxW = bodyBounds.width  * 0.5;
            const maxH = bodyBounds.height * 0.5;
            const scale = Math.min(maxW / motifDimensions.width, maxH / motifDimensions.height);
            return {
                width:  motifDimensions.width  * scale,
                height: motifDimensions.height * scale
            };
        }

        return null;
    }, [motifSize, motifDimensions, blanketCalc, sweaterCalc, hatCalc, sweaterBodyBounds, hatBodyBounds,
        patternConfig.isBabyBlanket, patternConfig.isHat, blanketDimensions, SWEATER_CANVAS_DIMS, HAT_CANVAS_DIMS]);

    // Motif management hook with design bounds and display dimensions
    const {
        placedMotifs,
        selectedId,
        selectMotif,
        addMotif,
        updateMotif,
        duplicateMotif,
        deleteMotif,
        motifCount,
        maxMotifs,
        updateAllMotifSizes
    } = useMotifLogic({ 
        designBounds, 
        motifDisplayDimensions,
        onNoSpaceAvailable: () => setIsNoSpaceModalOpen(true),
        onMotifsCannotFit: () => {
            setIsImpossibleFitModalOpen(true);
            onMotifsCannotFit?.();
        },
        onMotifsUpdatedSuccessfully
    });

    // Baby blanket image state
    const [blanketImage, setBlanketImage] = useState<HTMLImageElement | null>(null);
    const [sweaterImage, setSweaterImage] = useState<HTMLImageElement | null>(null);
    const [hatImage, setHatImage] = useState<HTMLImageElement | null>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [showBounds, setShowBounds] = useState(false); // Toggle for bounds visualization
    const [isNoSpaceModalOpen, setIsNoSpaceModalOpen] = useState(false);
    const [isImpossibleFitModalOpen, setIsImpossibleFitModalOpen] = useState(false);
    const initialized = useRef(false);

    // Load baby blanket image
    useEffect(() => {
        if (patternConfig.isBabyBlanket) {
            const img = new window.Image();
            img.src = BabyBlanketImage;
            img.onload = () => setBlanketImage(img);
        }
    }, [patternConfig.isBabyBlanket]);

    // Load sweater image (only when pattern is specifically a sweater)
    useEffect(() => {
        if (!patternConfig.isBabyBlanket && !patternConfig.isHat) {
            const img = new window.Image();
            img.src = SweaterPatternImage;
            img.onload = () => setSweaterImage(img);
        }
    }, [patternConfig.isBabyBlanket, patternConfig.isHat]);

    // Load hat image
    useEffect(() => {
        if (patternConfig.isHat) {
            const img = new window.Image();
            img.src = HatPatternImage;
            img.onload = () => setHatImage(img);
        }
    }, [patternConfig.isHat]);

    // Auto-add initial motif once the image URL is ready.
    // motifDisplayDimensions is passed to createMotif for sizing; if still null at this
    // point MotifManager falls back to 100×100 and the motif is resized by the
    // updateAllMotifSizes effect once dimensions become available.
    useEffect(() => {
        if (!initialized.current && motifImageUrl) {
            initialized.current = true;
            const defaultImage = '/IconsImages/ImageIcon.png';
            addMotif(motifImageUrl, defaultImage);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [motifImageUrl]);

    // Update motif sizes when tension changes (affects display dimensions)
    useEffect(() => {
        if (motifDisplayDimensions) {
            if (placedMotifs.length > 0) {
                updateAllMotifSizes(motifDisplayDimensions);
            } else {
                // No motifs to update, so this is a successful "update" (trivially)
                onMotifsUpdatedSuccessfully?.();
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [motifDisplayDimensions]);

    // Deselect motif when clicking outside canvas
    useEffect(() => {
        const handleGlobalClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest('.konvajs-content')) {
                selectMotif(null);
            }
        };

        window.addEventListener('mousedown', handleGlobalClick);
        return () => window.removeEventListener('mousedown', handleGlobalClick);
    }, [selectMotif]);

    // Prepare blanket display data
    const blanketDisplay = useMemo(() => {
        if (!patternConfig.isBabyBlanket || !blanketImage || !blanketCalc) {
            return undefined;
        }
        return {
            image: blanketImage,
            x: blanketCalc.x,
            y: blanketCalc.y,
            width: blanketCalc.displayWidth,
            height: blanketCalc.displayHeight,
            bounds: blanketCalc.bounds
        };
    }, [patternConfig.isBabyBlanket, blanketImage, blanketCalc]);

    // Prepare hat display data — same pattern as sweaterDisplay
    const hatDisplay = useMemo(() => {
        if (!patternConfig.isHat || !hatImage || !hatCalc || !hatBodyBounds) return undefined;
        return {
            image:  hatImage,
            x:      hatCalc.x,
            y:      hatCalc.y,
            width:  hatCalc.displayWidth,
            height: hatCalc.displayHeight,
            bounds: hatBodyBounds,
        };
    }, [patternConfig.isHat, hatImage, hatCalc, hatBodyBounds]);

    // Prepare sweater display data — reuses the same sweaterBodyBounds as designBounds
    // so placement logic and canvas rendering are always in sync.
    const sweaterDisplay = useMemo(() => {
        if (patternConfig.isBabyBlanket || !sweaterImage || !sweaterCalc || !sweaterBodyBounds) {
            return undefined;
        }
        return {
            image:  sweaterImage,
            x:      sweaterCalc.x,
            y:      sweaterCalc.y,
            width:  sweaterCalc.displayWidth,
            height: sweaterCalc.displayHeight,
            bounds: sweaterBodyBounds,   // ← same object used by useMotifLogic
        };
    }, [patternConfig.isBabyBlanket, sweaterImage, sweaterCalc, sweaterBodyBounds]);

    return (
        <>
            <ClothingDropdown 
                isOpen={isDropdownOpen}
                onToggle={() => setIsDropdownOpen(!isDropdownOpen)}
            />

            <InfoModal
                isOpen={isNoSpaceModalOpen}
                onClose={() => setIsNoSpaceModalOpen(false)}
                title="No Space Available"
                className="error-modal"
            >
                <h3>Cannot place motif</h3>
                <p>
                    There is not enough space on the pattern to place a motif with the current size.
                </p>
                <p>
                    Try one of the following:
                </p>
                <ul>
                    <li>Remove some existing motifs</li>
                    <li>Reduce the motif size by adjusting the tension</li>
                    <li>Increase the pattern dimensions</li>
                </ul>
            </InfoModal>

            <InfoModal
                isOpen={isImpossibleFitModalOpen}
                onClose={() => setIsImpossibleFitModalOpen(false)}
                title="Impossible to Fit Motifs"
                className="error-modal"
            >
                <h3>Motifs too large</h3>
                <p>
                    The current motif size is too large to fit all motifs on the pattern.
                </p>
                <p>
                    Try one of the following:
                </p>
                <ul>
                    <li>Remove some existing motifs</li>
                    <li>Reduce the motif size by adjusting the tension</li>
                    <li>Increase the pattern dimensions</li>
                </ul>
            </InfoModal>

            <div className={`sweater-preview ${isDropdownOpen ? 'dropdown-open' : ''}`}>
                <div className="sweater-container">
                    {motifImageUrl && (
                        <label className="bounds-toggle">
                            <span className="bounds-toggle-text">Show bounds</span>
                            <input 
                                type="checkbox" 
                                checked={showBounds} 
                                onChange={(e) => setShowBounds(e.target.checked)}
                            />
                            <span className="toggle-switch"></span>
                        </label>
                    )}
                    <PatternCanvas
                        isBabyBlanket={patternConfig.isBabyBlanket}
                        isHat={patternConfig.isHat}
                        motifs={placedMotifs}
                        selectedId={selectedId}
                        onSelectMotif={selectMotif}
                        onMotifChange={updateMotif}
                        onMotifDuplicate={duplicateMotif}
                        onMotifDelete={deleteMotif}
                        designBounds={designBounds}
                        stageDimensions={stageDimensions}
                        canAddMore={motifCount < maxMotifs}
                        blanketDisplay={blanketDisplay}
                        sweaterDisplay={sweaterDisplay}
                        hatDisplay={hatDisplay}
                        showBounds={showBounds}
                    />
                </div>
                {motifImageUrl && (
                    <div className="motif-size">
                        <label>Motif size</label>
                        <div className="size-display">
                            {motifSize 
                                ? `${motifSize.stitches} × ${motifSize.rows} stitches (${motifSize.widthCm} × ${motifSize.heightCm} cm)`
                                : '-- × -- stitches'}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default ClothingPreview;

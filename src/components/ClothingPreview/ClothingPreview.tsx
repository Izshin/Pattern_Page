import { useState, useEffect, useRef, useMemo } from 'react';
import './ClothingPreview.css';
import { ClothingDropdown, PatternCanvas } from './components';
import { useMotifLogic } from './hooks/useMotifLogic';
import { usePatternConfig } from './hooks/usePatternConfig';
import { DimensionCalculator } from './services';
import BabyBlanketImage from '../../assets/Patterns/BabybBlanketPatternImage.png';
import InfoModal from '../Modal/InfoModal';

interface ClothingPreviewProps {
    blanketDimensions?: { width: number; height: number };
    motifSize?: { stitches: number; rows: number; widthCm: number; heightCm: number } | null;
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

    // Design bounds based on pattern type
    const designBounds = useMemo(() => {
        if (blanketCalc) {
            return blanketCalc.bounds;
        }
        return dimensionCalculator.getDefaultDesignBounds();
    }, [blanketCalc, dimensionCalculator]);

    // Stage dimensions
    const stageDimensions = dimensionCalculator.getStageDimensions();

    // Calculate motif display dimensions based on tension
    const motifDisplayDimensions = useMemo<MotifDisplayDimensions | null>(() => {
        if (!motifSize || !blanketCalc) return null;
        
        // Calculate scale factor: pixels per cm
        const scaleX = blanketCalc.displayWidth / blanketDimensions.width;
        const scaleY = blanketCalc.displayHeight / blanketDimensions.height;
        
        // Use average scale to maintain aspect ratio
        const scale = (scaleX + scaleY) / 2;
        
        return {
            width: motifSize.widthCm * scale,
            height: motifSize.heightCm * scale
        };
    }, [motifSize, blanketCalc, blanketDimensions]);

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

    // Auto-add initial motif only if motifImageUrl is provided
    useEffect(() => {
        if (!initialized.current && motifImageUrl) {
            initialized.current = true;
            // Use motif from URL with fallback to default if it fails to load
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

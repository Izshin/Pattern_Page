import { useState, useEffect, useRef, useMemo } from 'react';
import './ClothingPreview.css';
import { ClothingDropdown, PatternCanvas } from './components';
import { useMotifLogic } from './hooks/useMotifLogicRefactored';
import { usePatternConfig } from './hooks/usePatternConfig';
import { DimensionCalculator } from './services';
import BabyBlanketImage from '../../assets/Patterns/BabybBlanketPatternImage.png';

interface ClothingPreviewProps {
    blanketDimensions?: { width: number; height: number };
    motifSize?: { stitches: number; rows: number; widthCm: number; heightCm: number } | null;
    motifImageUrl?: string | null;
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
    motifImageUrl = null
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

    // Motif management hook with design bounds
    const {
        placedMotifs,
        selectedId,
        selectMotif,
        addMotif,
        updateMotif,
        duplicateMotif,
        deleteMotif,
        motifCount,
        maxMotifs
    } = useMotifLogic({ designBounds });

    // Baby blanket image state
    const [blanketImage, setBlanketImage] = useState<HTMLImageElement | null>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const initialized = useRef(false);

    // Load baby blanket image
    useEffect(() => {
        if (patternConfig.isBabyBlanket) {
            const img = new window.Image();
            img.src = BabyBlanketImage;
            img.onload = () => setBlanketImage(img);
        }
    }, [patternConfig.isBabyBlanket]);

    // Auto-add initial demo motif
    useEffect(() => {
        if (!initialized.current) {
            initialized.current = true;
            // Use motif from URL if provided, with fallback to default
            const defaultImage = '/IconsImages/ImageIcon.png';
            if (motifImageUrl) {
                // Try custom image with fallback to default
                addMotif(motifImageUrl, defaultImage);
            } else {
                // Use default image directly
                addMotif(defaultImage);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [motifImageUrl]);

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

            <div className={`sweater-preview ${isDropdownOpen ? 'dropdown-open' : ''}`}>
                <div className="sweater-container">
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
                    />
                </div>
                <div className="motif-size">
                    <label>Motif size</label>
                    <div className="size-display">
                        {motifSize 
                            ? `${motifSize.stitches} × ${motifSize.rows} stitches (${motifSize.widthCm} × ${motifSize.heightCm} cm)`
                            : '-- × -- stitches'}
                    </div>
                </div>
            </div>
        </>
    );
};

export default ClothingPreview;

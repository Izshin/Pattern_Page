import { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Group, Image as KonvaImage, Rect } from 'react-konva';
import './ClothingPreview.css';
import SweaterIcon from '../../assets/Logos/SweaterIcon.svg?react';
import { useMotifLogic } from './hooks/useMotifLogic';
import DraggableMotif from './Motif/DraggableMotif';
import BabyBlanketImage from '../../assets/Patterns/BabybBlanketPatternImage.png';

interface ClothingPreviewProps {
    blanketDimensions?: { width: number; height: number };
}

const ClothingPreview: React.FC<ClothingPreviewProps> = ({ blanketDimensions = { width: 60, height: 80 } }) => {
    const [isClothingDropdownOpen, setIsClothingDropdownOpen] = useState(false);
    const [blanketImage, setBlanketImage] = useState<HTMLImageElement | null>(null);
    
    // Get current pattern from URL
    const urlParams = new URLSearchParams(window.location.search);
    const currentPattern = urlParams.get('pattern') || 'BabyBlanket';
    const isBabyBlanket = currentPattern === 'BabyBlanket';

    // Strict mode duplicate prevention
    const initialized = useRef(false);

    // Load baby blanket image
    useEffect(() => {
        if (isBabyBlanket) {
            const img = new window.Image();
            img.src = BabyBlanketImage;
            img.onload = () => {
                setBlanketImage(img);
            };
        }
    }, [isBabyBlanket]);

    // Motif Logic
    const {
        placedMotifs,
        selectedId,
        selectMotif,
        addMotif,
        updateMotif,
        duplicateMotif,
        deleteMotif,
        designBounds,
        stageDimensions
    } = useMotifLogic();

    // Auto-add a demo motif on mount for "Inspiration"
    useEffect(() => {
        if (!initialized.current) {
            initialized.current = true;
            // "use image icon instead of sweater icon"
            addMotif('/IconsImages/ImageIcon.png');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Deselect when clicking on empty stage area
    const checkDeselect = (e: any) => {
        // deselect when clicked on empty area (and not on a motif)
        const clickedOnStage = e.target === e.target.getStage();
        if (clickedOnStage) {
            selectMotif(null);
        }
    };

    // Deselect when clicking outside the canvas entirely
    useEffect(() => {
        const handleGlobalClick = (e: MouseEvent) => {
            // Check if click is inside the Konva container (class 'konvajs-content')
            const target = e.target as HTMLElement;
            if (!target.closest('.konvajs-content')) {
                selectMotif(null);
            }
        };

        window.addEventListener('mousedown', handleGlobalClick);
        return () => {
            window.removeEventListener('mousedown', handleGlobalClick);
        };
    }, [selectMotif]);

    // Calculate blanket container dimensions - container stays same size
    const containerWidth = 400;
    const containerHeight = 500;
    const padding = 20;
    
    // Max blanket size that fills the container
    const maxBlanketSize = 140; // cm
    
    // Calculate scale factor based on aspect ratio
    // The blanket should scale proportionally based on its actual cm dimensions
    const actualWidth = blanketDimensions.width;
    const actualHeight = blanketDimensions.height;
    
    // Available space in container
    const availableWidth = containerWidth - (padding * 2);
    const availableHeight = containerHeight - (padding * 2);
    
    // Calculate scale: max size (140cm) should fill available space
    const scaleX = availableWidth / maxBlanketSize;
    const scaleY = availableHeight / maxBlanketSize;
    
    // Use the smaller scale to maintain aspect ratio
    const scale = Math.min(scaleX, scaleY);
    
    // Calculate actual blanket display dimensions
    const displayWidth = actualWidth * scale;
    const displayHeight = actualHeight * scale;
    
    // Center the blanket in the container
    const blanketX = padding + (availableWidth - displayWidth) / 2;
    const blanketY = padding + (availableHeight - displayHeight) / 2;
    
    // Simple rectangular bounds for baby blanket (for motif dragging)
    const blanketBounds = {
        left: blanketX,
        top: blanketY,
        right: blanketX + displayWidth,
        bottom: blanketY + displayHeight
    };

    return (
        <>
            <div className="clothing-dropdown">
                <button
                    className="dropdown-button"
                    onClick={() => setIsClothingDropdownOpen(!isClothingDropdownOpen)}
                >
                    Clothing
                    <svg
                        width="30"
                        height="30"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        className={isClothingDropdownOpen ? 'rotated' : ''}
                    >
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                </button>

                {isClothingDropdownOpen && (
                    <div className="dropdown-menu">
                        <button className="dropdown-item" onClick={() => window.location.href = '?pattern=BabyBlanket'}>
                            <div className="dropdown-item-content">
                                <img src="/src/assets/Patterns/BabybBlanketPatternImage.png" alt="Baby Blankets" />
                                <span>Baby Blankets</span>
                            </div>
                            <span className="dropdown-item-arrow">›</span>
                        </button>
                        <button className="dropdown-item" onClick={() => window.location.href = '?pattern=Hat'}>
                            <div className="dropdown-item-content">
                                <SweaterIcon />
                                <span>Hats</span>
                            </div>
                            <span className="dropdown-item-arrow">›</span>
                        </button>
                        <button className="dropdown-item" onClick={() => window.location.href = '?pattern=Scarf'}>
                            <div className="dropdown-item-content">
                                <img src="/IconsImages/ScarfIcon.png" alt="Scarfs" />
                                <span>Scarfs</span>
                            </div>
                            <span className="dropdown-item-arrow">›</span>
                        </button>
                        <button className="dropdown-item" onClick={() => window.location.href = '?pattern=Sweater'}>
                            <div className="dropdown-item-content">
                                <img src="/IconsImages/SweaterIcon.png" alt="Sweaters" />
                                <span>Sweaters</span>
                            </div>
                            <span className="dropdown-item-arrow">›</span>
                        </button>
                        <button className="dropdown-item" onClick={() => window.location.href = '?pattern=Mittens'}>
                            <div className="dropdown-item-content">
                                <img src="/IconsImages/MittensIcon.png" alt="Mittens" />
                                <span>Mittens</span>
                            </div>
                            <span className="dropdown-item-arrow">›</span>
                        </button>
                        <button className="dropdown-item" onClick={() => window.location.href = '?pattern=Bag'}>
                            <div className="dropdown-item-content">
                                <img src="/IconsImages/BagIcon.png" alt="Bags" />
                                <span>Bags</span>
                            </div>
                            <span className="dropdown-item-arrow">›</span>
                        </button>
                    </div>
                )}
            </div>

            <div className={`sweater-preview ${isClothingDropdownOpen ? 'dropdown-open' : ''}`}>
                <div className="sweater-container">
                    {isBabyBlanket ? (
                        /* Baby Blanket View */
                        <Stage
                            width={containerWidth}
                            height={containerHeight}
                            onMouseDown={checkDeselect}
                            onTouchStart={checkDeselect}
                            className="motif-stage blanket-stage"
                        >
                            <Layer>
                                {/* Container background */}
                                <Rect
                                    x={0}
                                    y={0}
                                    width={containerWidth}
                                    height={containerHeight}
                                    fill="#f5f5f5"
                                    stroke="#ccc"
                                    strokeWidth={2}
                                    cornerRadius={8}
                                    listening={false}
                                />
                                
                                {/* Baby blanket image - scaled based on actual dimensions */}
                                {blanketImage && (
                                    <KonvaImage
                                        image={blanketImage}
                                        x={blanketX}
                                        y={blanketY}
                                        width={displayWidth}
                                        height={displayHeight}
                                        listening={false}
                                    />
                                )}
                                
                                {/* Draggable area border */}
                                <Rect
                                    x={blanketX}
                                    y={blanketY}
                                    width={displayWidth}
                                    height={displayHeight}
                                    stroke="#666"
                                    strokeWidth={1}
                                    dash={[5, 5]}
                                    listening={false}
                                />
                                
                                {/* Motifs */}
                                <Group>
                                    {placedMotifs.map((motif) => (
                                        <DraggableMotif
                                            key={motif.id}
                                            motif={motif}
                                            isSelected={motif.id === selectedId}
                                            onSelect={() => selectMotif(motif.id)}
                                            onChange={updateMotif}
                                            onDuplicate={duplicateMotif}
                                            onDelete={deleteMotif}
                                            sweaterBounds={blanketBounds}
                                        />
                                    ))}
                                </Group>
                            </Layer>
                        </Stage>
                    ) : (
                        /* Sweater View - Original code */
                        <>
                            <SweaterIcon className="sweater-base" />

                            <Stage
                                width={stageDimensions.width}
                                height={stageDimensions.height}
                                onMouseDown={checkDeselect}
                                onTouchStart={checkDeselect}
                                className="motif-stage"
                            >
                                <Layer>
                                    <Group>
                                        {/* Maps motifs */}
                                        <Group>
                                            {placedMotifs.map((motif) => (
                                                <DraggableMotif
                                                    key={motif.id}
                                                    motif={motif}
                                                    isSelected={motif.id === selectedId}
                                                    onSelect={() => selectMotif(motif.id)}
                                                    onChange={updateMotif}
                                                    onDuplicate={duplicateMotif}
                                                    onDelete={deleteMotif}
                                                    sweaterBounds={{ ...designBounds, left: 0, top: 0, right: 400, bottom: 400 }}
                                                />
                                            ))}
                                        </Group>
                                    </Group>
                                </Layer>
                            </Stage>
                        </>
                    )}
                </div>
                <div className="motif-size">
                    <label>Motif size</label>
                    <div className="size-display">46 × 54</div>
                </div>
            </div>
        </>
    );
};

export default ClothingPreview;

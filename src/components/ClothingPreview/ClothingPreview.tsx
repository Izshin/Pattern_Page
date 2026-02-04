import { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Group, Path } from 'react-konva';
import './ClothingPreview.css';
import SweaterIcon from '../../assets/Logos/SweaterIcon.svg?react';
import { useMotifLogic } from './hooks/useMotifLogic';
import DraggableMotif from './Motif/DraggableMotif';

const ClothingPreview = () => {
    const [isClothingDropdownOpen, setIsClothingDropdownOpen] = useState(false);

    // Strict mode duplicate prevention
    const initialized = useRef(false);

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
                        <button className="dropdown-item">
                            <div className="dropdown-item-content">
                                <SweaterIcon />
                                <span>Hats</span>
                            </div>
                            <span className="dropdown-item-arrow">›</span>
                        </button>
                        <button className="dropdown-item">
                            <div className="dropdown-item-content">
                                <img src="/IconsImages/ScarfIcon.png" alt="Scarfs" />
                                <span>Scarfs</span>
                            </div>
                            <span className="dropdown-item-arrow">›</span>
                        </button>
                        <button className="dropdown-item">
                            <div className="dropdown-item-content">
                                <img src="/IconsImages/SweaterIcon.png" alt="Sweaters" />
                                <span>Sweaters</span>
                            </div>
                            <span className="dropdown-item-arrow">›</span>
                        </button>
                        <button className="dropdown-item">
                            <div className="dropdown-item-content">
                                <img src="/IconsImages/MittensIcon.png" alt="Mittens" />
                                <span>Mittens</span>
                            </div>
                            <span className="dropdown-item-arrow">›</span>
                        </button>
                        <button className="dropdown-item">
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
                    <SweaterIcon className="sweater-base" />

                    {/* Konva Stage Layer for Motifs */}
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
                                            // Allow moving anywhere, visual clip handles the rest
                                            sweaterBounds={{ ...designBounds, left: 0, top: 0, right: 400, bottom: 400 }}
                                        />
                                    ))}
                                </Group>

                                {/* Mask Layer using GCO. This shape keeps content overlapping it. */}
                                <Path
                                    data="M445.084,62.175L314.555,27.688C304.165,49.59,281.854,64.74,256,64.74 c-25.854,0-48.163-15.149-58.555-37.052L66.917,62.175L10.45,434.507l56.467,17.371l50.809-234.014v266.448h276.548V217.865 l50.809,234.014l56.467-17.371L445.084,62.175z"
                                    fill="black" // needed for alpha mask
                                    scaleX={400 / 512}
                                    scaleY={400 / 512}
                                    globalCompositeOperation="destination-in"
                                    listening={false} // pass through events
                                />
                            </Group>
                        </Layer>
                    </Stage>
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

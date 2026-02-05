import React from 'react';
import './Controls.css';

interface ControlsProps {
    tensionMin: number;
    setTensionMin: (val: number) => void;
    tensionMax: number;
    setTensionMax: (val: number) => void;
    chestSize: number;
    setChestSize: (val: number) => void;
    sizeMin: number;
    setSizeMin: (val: number) => void;
    sizeMax: number;
    setSizeMax: (val: number) => void;
    onOpenInfo: (type: 'tension' | 'chest') => void;
    tensionRange?: { min: number; max: number };
    sizeRange?: { min: number; max: number; step?: number };
    isBabyBlanket?: boolean;
}

const Controls: React.FC<ControlsProps> = ({
    tensionMin,
    setTensionMin,
    tensionMax,
    setTensionMax,
    chestSize,
    setChestSize,
    sizeMin,
    setSizeMin,
    sizeMax,
    setSizeMax,
    onOpenInfo,
    tensionRange = { min: 17, max: 23 },
    sizeRange = { min: 0, max: 5, step: 1 },
    isBabyBlanket = false
}) => {
    const sizes = ['Woman XXS', 'Woman XS', 'Woman S', 'Woman M', 'Woman L', 'Woman XL'];
    const sizeLabel = isBabyBlanket ? 'Size' : 'Chest / Bust';
    const sizeValue = isBabyBlanket ? `${sizeMin} × ${sizeMax}` : sizes[chestSize];
    const sizeStep = sizeRange.step || 1;

    return (
        <>
            <div className="control-group">
                <div className="control-header">
                    <label>
                        Knitting tension
                        <button
                            className="info-button"
                            title="Information about knitting tension"
                            onClick={() => onOpenInfo('tension')}
                        >?</button>
                    </label>
                    <div className="value-display">{tensionMin} × {tensionMax}</div>
                </div>
                <div className="dual-slider-container">
                    <div className="slider-track-visuals">
                        {/* The filled line between min and max */}
                        <div
                            className="slider-track-fill"
                            style={{
                                left: `calc(29px + (100% - 58px) * ((${tensionMin} - ${tensionRange.min}) / ${tensionRange.max - tensionRange.min}))`,
                                width: `calc((100% - 58px) * ((${tensionMax} - ${tensionMin}) / ${tensionRange.max - tensionRange.min}))`
                            }}
                        />
                    </div>
                    <input
                        type="range"
                        min={tensionRange.min}
                        max={tensionRange.max}
                        step="1"
                        value={tensionMin}
                        onChange={(e) => {
                            const newMin = parseInt(e.target.value);
                            if (newMin <= tensionMax) {
                                setTensionMin(newMin);
                            }
                        }}
                        className="slider slider-min"
                    />
                    <input
                        type="range"
                        min={tensionRange.min}
                        max={tensionRange.max}
                        step="1"
                        value={tensionMax}
                        onChange={(e) => {
                            const newMax = parseInt(e.target.value);
                            if (newMax >= tensionMin) {
                                setTensionMax(newMax);
                            }
                        }}
                        className="slider slider-max"
                    />
                </div>
            </div>

            <div className="control-group">
                <div className="control-header">
                    <label>
                        {sizeLabel}
                        <button
                            className="info-button"
                            title={`Information about ${sizeLabel.toLowerCase()}`}
                            onClick={() => onOpenInfo('chest')}
                        >?</button>
                    </label>
                    <div className="value-display">{sizeValue}</div>
                </div>
                {isBabyBlanket ? (
                    <div className="dual-slider-container">
                        <div className="slider-track-visuals">
                            {/* The filled line between min and max */}
                            <div
                                className="slider-track-fill"
                                style={{
                                    left: `calc(29px + (100% - 58px) * ((${sizeMin} - ${sizeRange.min}) / ${sizeRange.max - sizeRange.min}))`,
                                    width: `calc((100% - 58px) * ((${sizeMax} - ${sizeMin}) / ${sizeRange.max - sizeRange.min}))`
                                }}
                            />
                            {/* Dots for size range */}
                            {Array.from({ length: Math.floor((sizeRange.max - sizeRange.min) / sizeStep) + 1 }, (_, i) => {
                                const dotValue = sizeRange.min + (i * sizeStep);
                                const isActive = dotValue >= sizeMin && dotValue <= sizeMax;
                                return (
                                    <div
                                        key={i}
                                        className={`slider-dot ${isActive ? 'active' : ''}`}
                                        style={{ opacity: i < 1 || i > Math.floor((sizeRange.max - sizeRange.min) / sizeStep) - 1 ? 0 : 1 }}
                                    />
                                );
                            })}
                        </div>
                        <input
                            type="range"
                            min={sizeRange.min}
                            max={sizeRange.max}
                            step={sizeStep}
                            value={sizeMin}
                            onChange={(e) => {
                                const newMin = parseInt(e.target.value);
                                if (newMin <= sizeMax) {
                                    setSizeMin(newMin);
                                }
                            }}
                            className="slider slider-min"
                        />
                        <input
                            type="range"
                            min={sizeRange.min}
                            max={sizeRange.max}
                            step={sizeStep}
                            value={sizeMax}
                            onChange={(e) => {
                                const newMax = parseInt(e.target.value);
                                if (newMax >= sizeMin) {
                                    setSizeMax(newMax);
                                }
                            }}
                            className="slider slider-max"
                        />
                    </div>
                ) : (
                    <div className="single-slider-container">
                        <div className="slider-track-visuals">
                            {/* The filled line from start to current value */}
                            <div
                                className="slider-track-fill"
                                style={{
                                    left: '14px',
                                    width: `calc((100% - 58px) * (${chestSize} / 5))`
                                }}
                            />
                            {sizes.map((_, i) => (
                                <div
                                    key={i}
                                    className={`slider-dot ${i <= chestSize ? 'active' : ''}`}
                                    style={{ opacity: i < 1 ? 0 : 1 }}
                                />
                            ))}
                        </div>
                        <input
                            type="range"
                            min={sizeRange.min}
                            max={sizeRange.max}
                            step={sizeStep}
                            value={chestSize}
                            onChange={(e) => setChestSize(parseInt(e.target.value))}
                            className="slider"
                        />
                    </div>
                )}
            </div>
        </>
    );
};

export default Controls;

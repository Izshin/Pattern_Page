import { Stage, Layer, Group, Image as KonvaImage, Rect } from 'react-konva';
import SweaterIcon from '../../../../assets/Logos/SweaterIcon.svg?react';
import DraggableMotif from '../../Motif/DraggableMotif';
import type { Motif } from '../../types';
import { Bounds } from '../../models';

interface PatternCanvasProps {
    isBabyBlanket: boolean;
    motifs: Motif[];
    selectedId: string | null;
    onSelectMotif: (id: string | null) => void;
    onMotifChange: (motif: Motif) => void;
    onMotifDuplicate: (id: string) => void;
    onMotifDelete: (id: string) => void;
    designBounds: Bounds;
    stageDimensions: { width: number; height: number };
    canAddMore: boolean;
    blanketDisplay?: {
        image: HTMLImageElement;
        x: number;
        y: number;
        width: number;
        height: number;
        bounds: Bounds;
    };
}

/**
 * Canvas component for rendering pattern with motifs
 * Handles both baby blanket and sweater patterns
 */
export const PatternCanvas: React.FC<PatternCanvasProps> = ({
    isBabyBlanket,
    motifs,
    selectedId,
    onSelectMotif,
    onMotifChange,
    onMotifDuplicate,
    onMotifDelete,
    designBounds,
    stageDimensions,
    canAddMore,
    blanketDisplay
}) => {
    const handleDeselect = (e: { target: { getStage: () => unknown } }) => {
        const clickedOnStage = e.target === e.target.getStage();
        if (clickedOnStage) {
            onSelectMotif(null);
        }
    };

    const renderMotifs = (bounds: Bounds) => (
        <Group>
            {motifs.map((motif) => (
                <DraggableMotif
                    key={motif.id}
                    motif={motif}
                    otherMotifs={motifs.filter(m => m.id !== motif.id)}
                    isSelected={motif.id === selectedId}
                    onSelect={() => onSelectMotif(motif.id)}
                    onChange={onMotifChange}
                    onDuplicate={onMotifDuplicate}
                    onDelete={onMotifDelete}
                    sweaterBounds={bounds.toObject()}
                    canAddMore={canAddMore}
                />
            ))}
        </Group>
    );

    if (isBabyBlanket && blanketDisplay) {
        return (
            <Stage
                width={stageDimensions.width}
                height={stageDimensions.height}
                onMouseDown={handleDeselect}
                onTouchStart={handleDeselect}
                className="motif-stage blanket-stage"
            >
                <Layer>
                    {/* Container background */}
                    <Rect
                        x={0}
                        y={0}
                        width={stageDimensions.width}
                        height={stageDimensions.height}
                        fill="#F5F5F0"
                        stroke="#FF808A"
                        strokeWidth={2}
                        cornerRadius={20}
                        listening={false}
                    />

                    {/* Baby blanket image */}
                    <KonvaImage
                        image={blanketDisplay.image}
                        x={blanketDisplay.x}
                        y={blanketDisplay.y}
                        width={blanketDisplay.width}
                        height={blanketDisplay.height}
                        listening={false}
                    />

                    {/* Motifs */}
                    {renderMotifs(blanketDisplay.bounds)}
                </Layer>
            </Stage>
        );
    }

    // Sweater view
    return (
        <>
            <SweaterIcon className="sweater-base" />
            <Stage
                width={stageDimensions.width}
                height={stageDimensions.height}
                onMouseDown={handleDeselect}
                onTouchStart={handleDeselect}
                className="motif-stage"
            >
                <Layer>
                    {renderMotifs(new Bounds(designBounds.left, designBounds.top, designBounds.right, designBounds.bottom))}
                </Layer>
            </Stage>
        </>
    );
};

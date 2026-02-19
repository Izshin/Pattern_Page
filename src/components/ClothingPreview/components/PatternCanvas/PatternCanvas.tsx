import { Stage, Layer, Group, Image as KonvaImage, Rect } from 'react-konva';
import DraggableMotif from '../../Motif/DraggableMotif';
import type { Motif } from '../../types';
import { Bounds } from '../../models';

interface PatternCanvasProps {
    isBabyBlanket: boolean;
    isHat?: boolean;
    motifs: Motif[];
    selectedId: string | null;
    onSelectMotif: (id: string | null) => void;
    onMotifChange: (motif: Motif) => void;
    onMotifDuplicate: (id: string) => void;
    onMotifDelete: (id: string) => void;
    designBounds: Bounds;
    stageDimensions: { width: number; height: number };
    canAddMore: boolean;
    showBounds?: boolean; // Toggle for bounds visualization
    blanketDisplay?: {
        image: HTMLImageElement;
        x: number;
        y: number;
        width: number;
        height: number;
        bounds: Bounds;
    };
    sweaterDisplay?: {
        image: HTMLImageElement;
        x: number;
        y: number;
        width: number;
        height: number;
        bounds: Bounds;
    };
    hatDisplay?: {
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
    isHat = false,
    motifs,
    selectedId,
    onSelectMotif,
    onMotifChange,
    onMotifDuplicate,
    onMotifDelete,
    designBounds,
    stageDimensions,
    canAddMore,
    blanketDisplay,
    sweaterDisplay,
    hatDisplay,
    showBounds = true,
}) => {
    const handleDeselect = (e: { target: { getStage: () => unknown } }) => {
        const clickedOnStage = e.target === e.target.getStage();
        if (clickedOnStage) {
            onSelectMotif(null);
        }
    };

    const renderMotifs = (bounds: Bounds) => (
        <Group>
            {motifs.map((motif) => {
                // Get all other motifs (excluding current one) for collision detection
                const otherMotifs = motifs.filter(m => m.id !== motif.id);
                
                return (
                    <DraggableMotif
                        key={motif.id}
                        motif={motif}
                        isSelected={motif.id === selectedId}
                        onSelect={() => onSelectMotif(motif.id)}
                        onChange={onMotifChange}
                        onDuplicate={onMotifDuplicate}
                        onDelete={onMotifDelete}
                        sweaterBounds={bounds.toObject()}
                        canAddMore={canAddMore}
                        otherMotifs={otherMotifs}
                        showBounds={showBounds}
                    />
                );
            })}
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
                        fill="transparent"
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

                    {/* Blanket bounds visualization */}
                    {showBounds && (
                        <Rect
                            x={blanketDisplay.bounds.left}
                            y={blanketDisplay.bounds.top}
                            width={blanketDisplay.bounds.width}
                            height={blanketDisplay.bounds.height}
                            stroke="#FF808A"
                            strokeWidth={3}
                            dash={[10, 5]}
                            listening={false}
                        />
                    )}

                    {/* Motifs */}
                    {renderMotifs(blanketDisplay.bounds)}
                </Layer>
            </Stage>
        );
    }

    // Sweater view with image
    if (!isBabyBlanket && sweaterDisplay) {
        return (
            <Stage
                width={stageDimensions.width}
                height={stageDimensions.height}
                onMouseDown={handleDeselect}
                onTouchStart={handleDeselect}
                className="motif-stage blanket-stage"
            >
                <Layer>
                    <KonvaImage
                        image={sweaterDisplay.image}
                        x={sweaterDisplay.x}
                        y={sweaterDisplay.y}
                        width={sweaterDisplay.width}
                        height={sweaterDisplay.height}
                        listening={false}
                    />
                    {showBounds && (
                        <Rect
                            x={sweaterDisplay.bounds.left}
                            y={sweaterDisplay.bounds.top}
                            width={sweaterDisplay.bounds.width}
                            height={sweaterDisplay.bounds.height}
                            stroke="#FF808A"
                            strokeWidth={3}
                            dash={[10, 5]}
                            listening={false}
                        />
                    )}
                    {renderMotifs(sweaterDisplay.bounds)}
                </Layer>
            </Stage>
        );
    }

    // Hat view
    if (isHat && hatDisplay) {
        return (
            <Stage
                width={stageDimensions.width}
                height={stageDimensions.height}
                onMouseDown={handleDeselect}
                onTouchStart={handleDeselect}
                className="motif-stage blanket-stage"
            >
                <Layer>
                    <KonvaImage
                        image={hatDisplay.image}
                        x={hatDisplay.x}
                        y={hatDisplay.y}
                        width={hatDisplay.width}
                        height={hatDisplay.height}
                        listening={false}
                    />
                    {showBounds && (
                        <Rect
                            x={hatDisplay.bounds.left}
                            y={hatDisplay.bounds.top}
                            width={hatDisplay.bounds.width}
                            height={hatDisplay.bounds.height}
                            stroke="#FF808A"
                            strokeWidth={3}
                            dash={[10, 5]}
                            listening={false}
                        />
                    )}
                    {renderMotifs(hatDisplay.bounds)}
                </Layer>
            </Stage>
        );
    }

    // Fallback (no image loaded yet)
    return (
        <Stage
            width={stageDimensions.width}
            height={stageDimensions.height}
            onMouseDown={handleDeselect}
            onTouchStart={handleDeselect}
            className="motif-stage"
        >
            <Layer>
                {showBounds && (
                    <Rect
                        x={designBounds.left}
                        y={designBounds.top}
                        width={designBounds.width}
                        height={designBounds.height}
                        stroke="#FF0000"
                        strokeWidth={3}
                        dash={[10, 5]}
                        listening={false}
                    />
                )}
                {renderMotifs(new Bounds(designBounds.left, designBounds.top, designBounds.right, designBounds.bottom))}
            </Layer>
        </Stage>
    );
};

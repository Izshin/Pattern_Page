import React, { useRef, useState, useEffect } from 'react';
import { Image as KonvaImage, Group } from 'react-konva';
import Konva from 'konva';
import { MotifActions } from './MotifActions';
import { useMotifDraggable } from '../hooks/useMotifDraggable';
import type { Motif } from '../types';
import { checkRectIntersection } from '../../../utils/geometry';
import { findClosestValidPosition } from '../../../utils/placement';


interface DraggableMotifProps {
    motif: Motif;
    isSelected: boolean;
    onSelect: () => void;
    onChange: (updatedMotif: Motif) => void;
    onDuplicate?: (id: string) => void;
    onDelete?: (id: string) => void;
    sweaterBounds: {
        left: number;
        top: number;
        right: number;
        bottom: number;
    };
    canAddMore?: boolean;
    otherMotifs?: Motif[];
}

const COLLISION_PADDING = 25; // Increased spacing between motifs

const DraggableMotif: React.FC<DraggableMotifProps> = ({
    motif,
    isSelected,
    onSelect,
    onChange,
    onDuplicate,
    onDelete,
    sweaterBounds,
    canAddMore = true,
    otherMotifs = [],
}) => {
    const groupRef = useRef<Konva.Group>(null);
    const imageRef = useRef<Konva.Image>(null);
    const actionsRef = useRef<Konva.Group>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any

    // Local State
    const [isHovered, setIsHovered] = useState(false);

    // Hooks
    const { handleDragMove } = useMotifDraggable(groupRef, sweaterBounds, motif.width, motif.height);

    // Initial force update to ensure CSS variables are loaded
    const [, forceUpdate] = useState({});
    useEffect(() => {
        forceUpdate({});
    }, []);

    // Handle IMPERATIVE counter-rotation for buttons during transform
    useEffect(() => {
        const node = groupRef.current;
        if (!node) return;

        const handleTransform = () => {
            if (actionsRef.current) {
                // Counter-rotate the buttons group so it stays upright
                actionsRef.current.rotation(-node.rotation());
            }
        };

        node.on('transform', handleTransform);
        // Initial sync
        handleTransform();

        return () => {
            node.off('transform', handleTransform);
        };
    }, []); // Run once on mount

    // Change Handlers
    const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
        const node = e.target;
        let newX = node.x();
        let newY = node.y();
        const rotation = node.rotation();
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();

        // Calculate actual dimensions with scale
        const actualWidth = motif.width * scaleX;
        const actualHeight = motif.height * scaleY;

        // Enforce bounds - ensure motif stays within the blanket canvas
        if (newX < sweaterBounds.left) {
            newX = sweaterBounds.left;
        }
        if (newX + actualWidth > sweaterBounds.right) {
            newX = sweaterBounds.right - actualWidth;
        }
        if (newY < sweaterBounds.top) {
            newY = sweaterBounds.top;
        }
        if (newY + actualHeight > sweaterBounds.bottom) {
            newY = sweaterBounds.bottom - actualHeight;
        }

        // Check for collision with other motifs
        // Apply padding to make the hit box smaller than the visual image
        const currentRect = {
            x: newX + COLLISION_PADDING,
            y: newY + COLLISION_PADDING,
            width: Math.max(1, motif.width * scaleX - (COLLISION_PADDING * 2)),
            height: Math.max(1, motif.height * scaleY - (COLLISION_PADDING *2)),
            rotation: rotation,
        };

        const hasCollision = otherMotifs.some(other => {
            const oScaleX = other.scaleX || 1;
            const oScaleY = other.scaleY || 1;

            const otherRect = {
                x: other.x + COLLISION_PADDING,
                y: other.y + COLLISION_PADDING,
                width: Math.max(1, other.width * oScaleX - (COLLISION_PADDING * 2)),
                height: Math.max(1, other.height * oScaleY - (COLLISION_PADDING * 2)),
                rotation: other.rotation || 0,
            };
            return checkRectIntersection(currentRect, otherRect);
        });

        if (hasCollision) {
            // Find closest valid position instead of reverting
            const { x: safeX, y: safeY } = findClosestValidPosition(
                newX,
                newY,
                motif.width,
                motif.height,
                rotation,
                scaleX,
                scaleY,
                otherMotifs,
                sweaterBounds,
                COLLISION_PADDING
            );

            // Update to safe position
            node.x(safeX);
            node.y(safeY);

            onChange({
                ...motif,
                x: safeX,
                y: safeY,
                rotation: rotation,
                scaleX: scaleX,
                scaleY: scaleY,
            });
            return;
        }

        onChange({
            ...motif,
            x: newX,
            y: newY,
            rotation: rotation,
            scaleX: scaleX,
            scaleY: scaleY,
        });
    };

    const handleTransformEnd = (e: Konva.KonvaEventObject<Event>) => {
        const node = e.target;
        onChange({
            ...motif,
            x: node.x(),
            y: node.y(),
            rotation: node.rotation(),
            scaleX: node.scaleX(),
            scaleY: node.scaleY(),
        });
    };

    return (
        <React.Fragment>
            <Group
                ref={groupRef}
                x={motif.x}
                y={motif.y}
                rotation={motif.rotation || 0}
                scaleX={motif.scaleX || 1}
                scaleY={motif.scaleY || 1}
                draggable
                onClick={onSelect}
                onTap={onSelect}
                onDragMove={handleDragMove}
                onDragEnd={handleDragEnd}
                onTransformEnd={handleTransformEnd}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <KonvaImage
                    ref={imageRef}
                    image={motif.image}
                    width={motif.width}
                    height={motif.height}
                    x={0}
                    y={0}
                />

                <MotifActions
                    ref={actionsRef}
                    motif={motif}
                    isSelected={isSelected}
                    isHovered={isHovered}
                    onDuplicate={onDuplicate}
                    onDelete={onDelete}
                    parentRotation={motif.rotation || 0}
                    canAddMore={canAddMore}
                />
            </Group>


        </React.Fragment>
    );
};

export default DraggableMotif;

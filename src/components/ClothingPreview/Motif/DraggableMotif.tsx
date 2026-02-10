import React, { useRef, useState, useEffect } from 'react';
import { Image as KonvaImage, Group } from 'react-konva';
import Konva from 'konva';
import { MotifActions } from './MotifActions';
import { useMotifDraggable } from '../hooks/useMotifDraggable';
import type { Motif } from '../types';


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
}

const DraggableMotif: React.FC<DraggableMotifProps> = ({
    motif,
    isSelected,
    onSelect,
    onChange,
    onDuplicate,
    onDelete,
    sweaterBounds,
    canAddMore = true,
}) => {
    const groupRef = useRef<Konva.Group>(null);
    const imageRef = useRef<Konva.Image>(null);
    const actionsRef = useRef<Konva.Group>(null);

    // Local State
    const [isHovered, setIsHovered] = useState(false);

    // Hooks
    const { handleDragMove } = useMotifDraggable(groupRef, sweaterBounds, motif.width, motif.height);

    // Initial force update to ensure CSS variables are loaded
    const [, forceUpdate] = useState({});
    useEffect(() => {
        forceUpdate({});
    }, []);

    // Change Handlers
    const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
        const node = e.target;
        let newX = node.x();
        let newY = node.y();
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();

        // Calculate actual dimensions with scale
        const actualWidth = motif.width * scaleX;
        const actualHeight = motif.height * scaleY;

        // Border collision detection - check all 4 edges of the motif
        // Left edge collision
        if (newX < sweaterBounds.left) {
            newX = sweaterBounds.left;
        }
        // Right edge collision
        if (newX + actualWidth > sweaterBounds.right) {
            newX = sweaterBounds.right - actualWidth;
        }
        // Top edge collision
        if (newY < sweaterBounds.top) {
            newY = sweaterBounds.top;
        }
        // Bottom edge collision
        if (newY + actualHeight > sweaterBounds.bottom) {
            newY = sweaterBounds.bottom - actualHeight;
        }

        // Update node position to bounded coordinates
        node.x(newX);
        node.y(newY);

        onChange({
            ...motif,
            x: newX,
            y: newY,
            scaleX: scaleX,
            scaleY: scaleY,
        });
    };

    const handleTransformEnd = (e: Konva.KonvaEventObject<Event>) => {
        const node = e.target;
        let newX = node.x();
        let newY = node.y();
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();

        // Calculate actual dimensions with scale
        const actualWidth = motif.width * scaleX;
        const actualHeight = motif.height * scaleY;

        // Border collision detection after transform - check all 4 edges
        // Left edge collision
        if (newX < sweaterBounds.left) {
            newX = sweaterBounds.left;
        }
        // Right edge collision
        if (newX + actualWidth > sweaterBounds.right) {
            newX = sweaterBounds.right - actualWidth;
        }
        // Top edge collision
        if (newY < sweaterBounds.top) {
            newY = sweaterBounds.top;
        }
        // Bottom edge collision
        if (newY + actualHeight > sweaterBounds.bottom) {
            newY = sweaterBounds.bottom - actualHeight;
        }

        // Update node position if adjusted
        node.x(newX);
        node.y(newY);

        onChange({
            ...motif,
            x: newX,
            y: newY,
            scaleX: scaleX,
            scaleY: scaleY,
        });
    };

    return (
        <React.Fragment>
            <Group
                ref={groupRef}
                x={motif.x}
                y={motif.y}
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
                    canAddMore={canAddMore}
                />
            </Group>


        </React.Fragment>
    );
};

export default DraggableMotif;

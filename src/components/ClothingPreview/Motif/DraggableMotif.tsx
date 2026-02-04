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
}

const DraggableMotif: React.FC<DraggableMotifProps> = ({
    motif,
    isSelected,
    onSelect,
    onChange,
    onDuplicate,
    onDelete,
    sweaterBounds,
}) => {
    const groupRef = useRef<Konva.Group>(null);
    const imageRef = useRef<Konva.Image>(null);
    const actionsRef = useRef<Konva.Group>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any

    // Local State
    const [isHovered, setIsHovered] = useState(false);

    // Hooks
    const { handleDragMove } = useMotifDraggable(groupRef, sweaterBounds);

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
        onChange({
            ...motif,
            x: node.x(),
            y: node.y(),
            rotation: node.rotation(),
            scaleX: node.scaleX(),
            scaleY: node.scaleY(),
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
                />
            </Group>

            
        </React.Fragment>
    );
};

export default DraggableMotif;

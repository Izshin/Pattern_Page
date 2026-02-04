import React from 'react';
import Konva from 'konva';

interface Bounds {
    left: number;
    top: number;
    right: number;
    bottom: number;
}

export const useMotifDraggable = (
    nodeRef: React.RefObject<Konva.Group | null>,
    bounds: Bounds
) => {
    const handleDragMove = () => {
        const node = nodeRef.current;
        if (!node) return;

        const newX = Math.max(
            bounds.left,
            Math.min(bounds.right - (node.width() * node.scaleX()), node.x())
        );
        const newY = Math.max(
            bounds.top,
            Math.min(bounds.bottom - (node.height() * node.scaleY()), node.y())
        );

        node.position({ x: newX, y: newY });
    };

    return { handleDragMove };
};

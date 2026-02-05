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
    bounds: Bounds,
    baseWidth: number,
    baseHeight: number
) => {
    const handleDragMove = () => {
        const node = nodeRef.current;
        if (!node) return;

        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        
        // Calculate the actual image size using base dimensions
        const actualWidth = baseWidth * scaleX;
        const actualHeight = baseHeight * scaleY;

        // Get current position
        let newX = node.x();
        let newY = node.y();

        // Symmetric constraints for perfect rectangle matching blanket interior
        // Left edge: if position would be left of bounds.left, snap to bounds.left
        if (newX < bounds.left) {
            newX = bounds.left;
        }
        // Right edge: if right edge of image would exceed bounds.right, snap back
        if (newX + actualWidth > bounds.right) {
            newX = bounds.right - actualWidth;
        }
        
        // Top edge: if position would be above bounds.top, snap to bounds.top
        if (newY < bounds.top) {
            newY = bounds.top;
        }
        // Bottom edge: if bottom edge of image would exceed bounds.bottom, snap back
        if (newY + actualHeight > bounds.bottom) {
            newY = bounds.bottom - actualHeight;
        }

        node.position({ x: newX, y: newY });
    };

    return { handleDragMove };
};

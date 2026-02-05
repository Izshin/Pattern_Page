import React, { useEffect, useRef, useState } from 'react';
import { Group, Rect, Text } from 'react-konva';
import Konva from 'konva';
import { useMotifStyles } from '../hooks/useMotifStyles';
import type { Motif } from '../types';

interface MotifActionsProps {
    motif: Motif;
    isHovered: boolean;
    isSelected: boolean;
    onDuplicate?: (id: string) => void;
    onDelete?: (id: string) => void;
    parentRotation: number;
    canAddMore?: boolean;
}

export const MotifActions = React.forwardRef<Konva.Group, MotifActionsProps>(({
    motif,
    isHovered,
    isSelected,
    onDuplicate,
    onDelete,
    parentRotation,    canAddMore = true,}, ref) => {
    const [hoveredButton, setHoveredButton] = useState<'copy' | 'delete' | null>(null);
    // Use the forwarded ref or create a fallback (though in this case we expect a ref)
    const internalRef = useRef<Konva.Group>(null);
    // We cast to any to handle the conditional ref assignment if needed, but standard practice:
    // eslint-disable-next-line
    const groupRef = (ref as React.RefObject<Konva.Group>) || internalRef;

    const styles = useMotifStyles();

    // Sync cursor with hoveredButton state - CRITICAL FIX
    useEffect(() => {
        const stage = groupRef.current?.getStage();
        const container = stage?.container();
        if (container) {
            container.style.cursor = hoveredButton ? 'pointer' : 'default';
        }
    }, [hoveredButton, groupRef]); // Added groupRef dependency

    if (!isHovered && !isSelected) return null;

    return (
        <Group
            ref={ref}
            x={motif.width}
            y={0}
            // Initial rotation via prop. 
            // During drag, parent will update this node imperatively.
            rotation={-parentRotation}
        >
            {/* Copy Button */}
            {onDuplicate && canAddMore && (
                <Group
                    x={-24} // Relative to top-right corner
                    y={-14}
                    onClick={(e) => {
                        e.cancelBubble = true;
                        onDuplicate(motif.id);
                    }}
                    onTap={(e) => {
                        e.cancelBubble = true;
                        onDuplicate(motif.id);
                    }}
                    onMouseEnter={() => setHoveredButton('copy')}
                    onMouseLeave={() => setHoveredButton(null)}
                >
                    <Rect
                        width={24}
                        height={24}
                        fill={styles.buttonFill}
                        stroke={hoveredButton === 'copy' ? styles.hoverStroke : styles.buttonStroke}
                        strokeWidth={1}
                        cornerRadius={8}
                        shadowColor={hoveredButton === 'copy' ? styles.hoverShadowColor : styles.shadowColor}
                        shadowBlur={hoveredButton === 'copy' ? 10 : 6}
                        shadowOffsetY={hoveredButton === 'copy' ? 3 : 2}
                    />
                    <Text
                        width={24}
                        height={24}
                        text="+"
                        fontSize={18}
                        fontStyle="bold"
                        align="center"
                        verticalAlign="middle"
                        fill={styles.accentColor}
                        listening={false}
                    />
                </Group>
            )}

            {/* Delete Button */}
            {onDelete && (
                <Group
                    x={6} // Relative to top-right corner
                    y={-14}
                    onClick={(e) => {
                        e.cancelBubble = true;
                        onDelete(motif.id);
                    }}
                    onTap={(e) => {
                        e.cancelBubble = true;
                        onDelete(motif.id);
                    }}
                    onMouseEnter={() => setHoveredButton('delete')}
                    onMouseLeave={() => setHoveredButton(null)}
                >
                    <Rect
                        width={24}
                        height={24}
                        fill={styles.buttonFill}
                        stroke={hoveredButton === 'delete' ? styles.hoverStroke : styles.buttonStroke}
                        strokeWidth={1}
                        cornerRadius={8}
                        shadowColor={hoveredButton === 'delete' ? styles.hoverShadowColor : styles.shadowColor}
                        shadowBlur={hoveredButton === 'delete' ? 10 : 6}
                        shadowOffsetY={hoveredButton === 'delete' ? 3 : 2}
                    />
                    <Text
                        width={24}
                        height={23}
                        text="×"
                        fontSize={18}
                        fontStyle="bold"
                        align="center"
                        verticalAlign="middle"
                        fill={styles.accentColor}
                        listening={false}
                    />
                </Group>
            )}
        </Group>
    );
});

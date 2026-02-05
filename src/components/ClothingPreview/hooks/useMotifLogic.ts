import { useState, useEffect } from 'react';
import type { Motif } from '../types';
import { findClosestValidPosition } from '../../../utils/placement';

const STITCH_SIZE = 4; // Arbitrary connection to pixel size
const STAGE_WIDTH = 400;
const STAGE_HEIGHT = 400;
const MAX_MOTIFS = 4;
const COLLISION_PADDING = 25; // Increased spacing between motifs

// Helper to calculate stitch count
const calculateStitches = (width: number, height: number, stitchSize = STITCH_SIZE) => {
    const cols = Math.round(width / stitchSize);
    const rows = Math.round(height / stitchSize);
    return { cols, rows };
};

interface Bounds {
    left: number;
    top: number;
    right: number;
    bottom: number;
}

export const useMotifLogic = (customBounds?: Bounds) => {
    const [placedMotifs, setPlacedMotifs] = useState<Motif[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    // Default design bounds for sweater, or use custom bounds (e.g., for baby blanket)
    const designBounds = customBounds || {
        left: 50,
        top: 50,
        right: 350,
        bottom: 350,
    };




    const addMotif = (imageUrl: string) => {
        if (placedMotifs.length >= MAX_MOTIFS) {
            console.warn(`Maximum of ${MAX_MOTIFS} motifs allowed`);
            return;
        }

        const img = new window.Image();
        img.crossOrigin = 'Anonymous';
        img.src = imageUrl;

        img.onload = () => {
            const id = `motif-${Date.now()}`;
            const width = 100;
            const height = 100;
            const centerX = (designBounds.left + designBounds.right) / 2;
            const centerY = (designBounds.top + designBounds.bottom) / 2;

            // Find valid position starting from center
            const { x: validX, y: validY } = findClosestValidPosition(
                centerX - width / 2,
                centerY - height / 2,
                width,
                height,
                0, // rotation
                1, // scaleX
                1, // scaleY
                placedMotifs,
                designBounds,
                COLLISION_PADDING
            );

            const stitches = calculateStitches(width, height);

            const newMotif: Motif = {
                id,
                image: img,
                x: validX,
                y: validY,
                width,
                height,
                stitches,
            };

            setPlacedMotifs((prev) => [...prev, newMotif]);
            setSelectedId(id);
        };

        img.onerror = () => {
            console.error("Failed to load motif image:", imageUrl);
            // Fallback placeholder logic could go here
        };
    };

    const updateMotif = (updatedMotif: Motif) => {
        setPlacedMotifs((prev) =>
            prev.map((m) => (m.id === updatedMotif.id ? updatedMotif : m))
        );
    };

    // Delete selected motif on Delete/Backspace
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
                setPlacedMotifs((prev) => prev.filter((m) => m.id !== selectedId));
                setSelectedId(null);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedId]);

    // Select motif helper
    const selectMotif = (id: string | null) => {
        setSelectedId(id);
    };

    const duplicateMotif = (id: string) => {
        if (placedMotifs.length >= MAX_MOTIFS) {
            console.warn(`Maximum of ${MAX_MOTIFS} motifs allowed`);
            return;
        }

        const motifToClone = placedMotifs.find(m => m.id === id);
        if (!motifToClone) return;

        const newId = `motif-${Date.now()}`;
        const offset = 20;

        // Check bounds for the new position
        const startX = motifToClone.x + offset;
        const startY = motifToClone.y + offset;

        const { x: validX, y: validY } = findClosestValidPosition(
            startX,
            startY,
            motifToClone.width,
            motifToClone.height,
            motifToClone.rotation || 0,
            motifToClone.scaleX || 1,
            motifToClone.scaleY || 1,
            placedMotifs,
            designBounds,
            COLLISION_PADDING
        );

        // Simple safety check to keep it somewhat in view (not robust boundary check but good enough for clone)
        const safeX = validX > designBounds.right ? designBounds.left : validX;
        const safeY = validY > designBounds.bottom ? designBounds.top : validY;

        const newMotif: Motif = {
            ...motifToClone,
            id: newId,
            x: safeX,
            y: safeY,
        };

        setPlacedMotifs((prev) => [...prev, newMotif]);
        setSelectedId(newId);
    };

    const deleteMotif = (id: string) => {
        setPlacedMotifs((prev) => prev.filter((m) => m.id !== id));
        if (selectedId === id) setSelectedId(null);
    };

    return {
        placedMotifs,
        selectedId,
        selectMotif,
        addMotif,
        updateMotif,
        duplicateMotif,
        deleteMotif,
        designBounds,
        stageDimensions: { width: STAGE_WIDTH, height: STAGE_HEIGHT },
        motifCount: placedMotifs.length,
        maxMotifs: MAX_MOTIFS
    };
};

import { useState, useEffect } from 'react';
import type { Motif } from '../types';

const STITCH_SIZE = 4; // Arbitrary connection to pixel size
const STAGE_WIDTH = 400;
const STAGE_HEIGHT = 400;


// Helper to calculate stitch count
const calculateStitches = (width: number, height: number, stitchSize = STITCH_SIZE) => {
    const cols = Math.round(width / stitchSize);
    const rows = Math.round(height / stitchSize);
    return { cols, rows };
};

export const useMotifLogic = () => {
    const [placedMotifs, setPlacedMotifs] = useState<Motif[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    // Design bounds (approximate area of the sweater on the 400x400 canvas)
    // You can tune this to match the visual sweater body more precisely
    // For now, giving some padding so it doesn't go off the edge
    const designBounds = {
        left: 50,
        top: 50,
        right: 350,
        bottom: 350,
    };

    const addMotif = (imageUrl: string) => {
        const img = new window.Image();
        img.crossOrigin = 'Anonymous';
        img.src = imageUrl;

        img.onload = () => {
            const id = `motif-${Date.now()}`;
            const width = 100;
            const height = 100;
            const centerX = (designBounds.left + designBounds.right) / 2;
            const centerY = (designBounds.top + designBounds.bottom) / 2;

            const stitches = calculateStitches(width, height);

            const newMotif: Motif = {
                id,
                image: img,
                x: centerX - width / 2,
                y: centerY - height / 2,
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
        const motifToClone = placedMotifs.find(m => m.id === id);
        if (!motifToClone) return;

        const newId = `motif-${Date.now()}`;
        const offset = 20;

        // Check bounds for the new position
        const newX = motifToClone.x + offset;
        const newY = motifToClone.y + offset;

        // Simple safety check to keep it somewhat in view (not robust boundary check but good enough for clone)
        const safeX = newX > designBounds.right ? designBounds.left : newX;
        const safeY = newY > designBounds.bottom ? designBounds.top : newY;

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
        stageDimensions: { width: STAGE_WIDTH, height: STAGE_HEIGHT }
    };
};

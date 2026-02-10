import { useState, useEffect, useMemo } from 'react';
import type { Motif } from '../types';
import { Bounds } from '../models/Bounds';
import { MotifManager } from '../services/MotifManager';

interface UseMotifLogicOptions {
    designBounds?: Bounds;
    maxMotifs?: number;
    motifDisplayDimensions?: { width: number; height: number } | null;
}

/**
 * Refactored hook for motif state management
 * Uses MotifManager service for business logic
 */
export const useMotifLogic = (options: UseMotifLogicOptions = {}) => {
    const { designBounds, maxMotifs, motifDisplayDimensions } = options;
    
    // Create service instance (memoized)
    const motifManager = useMemo(
        () => new MotifManager({ maxMotifs }),
        [maxMotifs]
    );

    // Default bounds if not provided
    const defaultBounds = useMemo(
        () => designBounds || new Bounds(50, 50, 350, 350),
        [designBounds]
    );

    const [placedMotifs, setPlacedMotifs] = useState<Motif[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    // Add motif using service
    const addMotif = async (imageUrl: string, fallbackUrl?: string) => {
        if (!motifManager.canAddMotif(placedMotifs.length)) {
            console.warn(`Maximum of ${motifManager.getMaxMotifs()} motifs allowed`);
            return;
        }

        try {
            const newMotif = await motifManager.createMotif(
                imageUrl,
                defaultBounds,
                fallbackUrl,
                motifDisplayDimensions
            );
            setPlacedMotifs(prev => [...prev, newMotif]);
            setSelectedId(newMotif.id);
        } catch (error) {
            console.error('Failed to add motif:', error);
        }
    };

    // Update motif
    const updateMotif = (updatedMotif: Motif) => {
        setPlacedMotifs(prev =>
            prev.map(m => (m.id === updatedMotif.id ? updatedMotif : m))
        );
    };

    // Duplicate motif using service
    const duplicateMotif = (id: string) => {
        if (!motifManager.canAddMotif(placedMotifs.length)) {
            console.warn(`Maximum of ${motifManager.getMaxMotifs()} motifs allowed`);
            return;
        }

        const motifToClone = placedMotifs.find(m => m.id === id);
        if (!motifToClone) return;

        const newMotif = motifManager.duplicateMotif(
            motifToClone,
            defaultBounds
        );

        setPlacedMotifs(prev => [...prev, newMotif]);
        setSelectedId(newMotif.id);
    };

    // Delete motif
    const deleteMotif = (id: string) => {
        setPlacedMotifs(prev => prev.filter(m => m.id !== id));
        if (selectedId === id) setSelectedId(null);
    };

    // Select motif
    const selectMotif = (id: string | null) => {
        setSelectedId(id);
    };

    // Update all motif sizes when tension changes
    const updateAllMotifSizes = (newDimensions: { width: number; height: number }) => {
        setPlacedMotifs(prev => 
            prev.map(motif => 
                motifManager.updateMotifSize(motif, newDimensions, defaultBounds)
            )
        );
    };

    // Delete selected motif on keyboard shortcut
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
                deleteMotif(selectedId);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedId]);

    return {
        placedMotifs,
        selectedId,
        selectMotif,
        addMotif,
        updateMotif,
        duplicateMotif,
        deleteMotif,
        updateAllMotifSizes,
        designBounds: defaultBounds,
        motifCount: placedMotifs.length,
        maxMotifs: motifManager.getMaxMotifs()
    };
};

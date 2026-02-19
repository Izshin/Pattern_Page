import type { Motif } from '../types';
import { Bounds } from '../models/Bounds';
import { findClosestValidPosition } from '../../../utils/placement';

interface MotifManagerConfig {
    maxMotifs?: number;
    stitchSize?: number;
}

/**
 * Service class managing motif operations using OOP principles
 * Encapsulates CRUD operations and business rules for motifs
 */
export class MotifManager {
    private readonly maxMotifs: number;
    private readonly stitchSize: number;

    constructor(config: MotifManagerConfig = {}) {
        this.maxMotifs = config.maxMotifs ?? 4;
        this.stitchSize = config.stitchSize ?? 4;
    }

    /**
     * Check if we can add more motifs
     */
    canAddMotif(currentCount: number): boolean {
        return currentCount < this.maxMotifs;
    }

    /**
     * Calculate stitch count for given dimensions
     */
    private calculateStitches(width: number, height: number) {
        return {
            cols: Math.round(width / this.stitchSize),
            rows: Math.round(height / this.stitchSize)
        };
    }

    /**
     * Create a new motif at the center of design bounds
     */
    async createMotif(
        imageUrl: string,
        designBounds: Bounds,
        fallbackUrl?: string,
        displayDimensions?: { width: number; height: number } | null,
        existingMotifs: Motif[] = []
    ): Promise<Motif> {
        return new Promise((resolve, reject) => {
            const img = new window.Image();
            img.crossOrigin = 'Anonymous';
            img.src = imageUrl;

            img.onload = () => {
                const id = `motif-${Date.now()}`;
                
                // Use calculated dimensions if available, otherwise derive a sensible
                // default that fits inside the design bounds (40% of the smaller side).
                const boundsMinDim = Math.min(designBounds.width, designBounds.height);
                const fallbackSize = Math.max(20, Math.floor(boundsMinDim * 0.4));
                const width = displayDimensions?.width || fallbackSize;
                const height = displayDimensions?.height || fallbackSize;

                // Start at center position
                const startX = designBounds.centerX - width / 2;
                const startY = designBounds.centerY - height / 2;

                // Find valid position that doesn't overlap
                const validPosition = findClosestValidPosition(
                    startX,
                    startY,
                    width,
                    height,
                    1, // scaleX
                    1, // scaleY
                    existingMotifs,
                    {
                        left: designBounds.left,
                        top: designBounds.top,
                        right: designBounds.right,
                        bottom: designBounds.bottom
                    },
                    2 // padding
                );

                // If no valid position found, throw specific error
                if (!validPosition) {
                    reject(new Error('NO_SPACE_AVAILABLE'));
                    return;
                }

                const stitches = this.calculateStitches(width, height);

                const newMotif: Motif = {
                    id,
                    image: img,
                    x: validPosition.x,
                    y: validPosition.y,
                    width,
                    height,
                    stitches,
                };

                resolve(newMotif);
            };

            img.onerror = () => {
                // Try fallback image if provided
                if (fallbackUrl && fallbackUrl !== imageUrl) {
                    console.warn(`Failed to load motif image: ${imageUrl}, trying fallback: ${fallbackUrl}`);
                    this.createMotif(fallbackUrl, designBounds, undefined, displayDimensions, existingMotifs).then(resolve).catch(reject);
                } else {
                    reject(new Error(`Failed to load motif image: ${imageUrl}`));
                }
            };
        });
    }

    /**
     * Duplicate an existing motif with offset
     * Throws error if no valid position is available
     */
    duplicateMotif(
        sourceMotif: Motif,
        designBounds: Bounds,
        existingMotifs: Motif[] = []
    ): Motif {
        const newId = `motif-${Date.now()}`;
        const offset = 20;

        // Start searching from offset position
        const startX = sourceMotif.x + offset;
        const startY = sourceMotif.y + offset;

        // Find valid position that doesn't overlap
        const validPosition = findClosestValidPosition(
            startX,
            startY,
            sourceMotif.width,
            sourceMotif.height,
            sourceMotif.scaleX || 1,
            sourceMotif.scaleY || 1,
            existingMotifs,
            {
                left: designBounds.left,
                top: designBounds.top,
                right: designBounds.right,
                bottom: designBounds.bottom
            },
            2 // padding
        );

        // If no valid position found, throw specific error
        if (!validPosition) {
            throw new Error('NO_SPACE_AVAILABLE');
        }

        return {
            ...sourceMotif,
            id: newId,
            x: validPosition.x,
            y: validPosition.y,
        };
    }

    /**
     * Update motif size based on new display dimensions (e.g., when tension changes)
     * Maintains position and adjusts if needed to stay within bounds
     */
    updateMotifSize(
        motif: Motif,
        newDimensions: { width: number; height: number },
        designBounds: Bounds
    ): Motif {
        const scaleX = motif.scaleX || 1;
        const scaleY = motif.scaleY || 1;
        
        // Calculate new dimensions
        const newWidth = newDimensions.width;
        const newHeight = newDimensions.height;
        
        // Calculate actual dimensions with scale
        const actualWidth = newWidth * scaleX;
        const actualHeight = newHeight * scaleY;
        
        // Adjust position if motif would go out of bounds
        let newX = motif.x;
        let newY = motif.y;
        
        if (newX + actualWidth > designBounds.right) {
            newX = designBounds.right - actualWidth;
        }
        if (newX < designBounds.left) {
            newX = designBounds.left;
        }
        if (newY + actualHeight > designBounds.bottom) {
            newY = designBounds.bottom - actualHeight;
        }
        if (newY < designBounds.top) {
            newY = designBounds.top;
        }
        
        // Update stitches based on new dimensions
        const stitches = this.calculateStitches(newWidth, newHeight);
        
        return {
            ...motif,
            width: newWidth,
            height: newHeight,
            x: newX,
            y: newY,
            stitches
        };
    }

    /**
     * Resolve overlaps for all motifs after size changes
     * Repositions overlapping motifs to valid locations
     * Throws error if motifs cannot fit in bounds
     */
    resolveOverlaps(
        motifs: Motif[],
        designBounds: Bounds
    ): Motif[] {
        const resolvedMotifs: Motif[] = [];
        let hasUnfittableMotif = false;

        for (const motif of motifs) {
            // Find valid position for this motif
            const validPosition = findClosestValidPosition(
                motif.x,
                motif.y,
                motif.width,
                motif.height,
                motif.scaleX || 1,
                motif.scaleY || 1,
                resolvedMotifs, // Check against already resolved motifs
                {
                    left: designBounds.left,
                    top: designBounds.top,
                    right: designBounds.right,
                    bottom: designBounds.bottom
                },
                2 // padding
            );

            // Track if any motif couldn't find a valid position
            if (!validPosition && motifs.length > 1) {
                hasUnfittableMotif = true;
            }

            // Use valid position if found, otherwise keep original
            resolvedMotifs.push({
                ...motif,
                x: validPosition?.x ?? motif.x,
                y: validPosition?.y ?? motif.y
            });
        }

        // Throw error if multiple motifs can't fit
        if (hasUnfittableMotif) {
            throw new Error('MOTIFS_CANNOT_FIT');
        }

        return resolvedMotifs;
    }

    /**
     * Get maximum allowed motifs
     */
    getMaxMotifs(): number {
        return this.maxMotifs;
    }
}

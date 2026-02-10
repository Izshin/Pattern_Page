import type { Motif } from '../types';
import { Bounds } from '../models/Bounds';

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
        displayDimensions?: { width: number; height: number } | null
    ): Promise<Motif> {
        return new Promise((resolve, reject) => {
            const img = new window.Image();
            img.crossOrigin = 'Anonymous';
            img.src = imageUrl;

            img.onload = () => {
                const id = `motif-${Date.now()}`;
                
                // Use calculated dimensions if available, otherwise default to 100x100
                const width = displayDimensions?.width || 100;
                const height = displayDimensions?.height || 100;

                // Center position
                const centerX = designBounds.centerX - width / 2;
                const centerY = designBounds.centerY - height / 2;

                const stitches = this.calculateStitches(width, height);

                const newMotif: Motif = {
                    id,
                    image: img,
                    x: centerX,
                    y: centerY,
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
                    this.createMotif(fallbackUrl, designBounds, undefined, displayDimensions).then(resolve).catch(reject);
                } else {
                    reject(new Error(`Failed to load motif image: ${imageUrl}`));
                }
            };
        });
    }

    /**
     * Duplicate an existing motif with offset
     */
    duplicateMotif(
        sourceMotif: Motif,
        designBounds: Bounds
    ): Motif {
        const newId = `motif-${Date.now()}`;
        const offset = 20;

        let newX = sourceMotif.x + offset;
        let newY = sourceMotif.y + offset;

        // Keep within bounds
        const actualWidth = sourceMotif.width * (sourceMotif.scaleX || 1);
        const actualHeight = sourceMotif.height * (sourceMotif.scaleY || 1);
        
        if (newX + actualWidth > designBounds.right) {
            newX = designBounds.left;
        }
        if (newY + actualHeight > designBounds.bottom) {
            newY = designBounds.top;
        }

        return {
            ...sourceMotif,
            id: newId,
            x: newX,
            y: newY,
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
     * Get maximum allowed motifs
     */
    getMaxMotifs(): number {
        return this.maxMotifs;
    }
}

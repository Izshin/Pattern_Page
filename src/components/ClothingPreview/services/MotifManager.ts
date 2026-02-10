import type { Motif } from '../types';
import { Bounds } from '../models/Bounds';
import { findClosestValidPosition } from '../../../utils/placement';

interface MotifManagerConfig {
    maxMotifs?: number;
    collisionPadding?: number;
    stitchSize?: number;
}

/**
 * Service class managing motif operations using OOP principles
 * Encapsulates CRUD operations and business rules for motifs
 */
export class MotifManager {
    private readonly maxMotifs: number;
    private readonly collisionPadding: number;
    private readonly stitchSize: number;

    constructor(config: MotifManagerConfig = {}) {
        this.maxMotifs = config.maxMotifs ?? 4;
        this.collisionPadding = config.collisionPadding ?? 25;
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
        existingMotifs: Motif[],
        fallbackUrl?: string
    ): Promise<Motif> {
        return new Promise((resolve, reject) => {
            const img = new window.Image();
            img.crossOrigin = 'Anonymous';
            img.src = imageUrl;

            img.onload = () => {
                const id = `motif-${Date.now()}`;
                const width = 100;
                const height = 100;

                // Start from center
                const centerX = designBounds.centerX;
                const centerY = designBounds.centerY;

                // Find valid position without collisions
                const { x: validX, y: validY } = findClosestValidPosition(
                    centerX - width / 2,
                    centerY - height / 2,
                    width,
                    height,
                    0,
                    1,
                    1,
                    existingMotifs,
                    designBounds.toObject(),
                    this.collisionPadding
                );

                const stitches = this.calculateStitches(width, height);

                const newMotif: Motif = {
                    id,
                    image: img,
                    x: validX,
                    y: validY,
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
                    this.createMotif(fallbackUrl, designBounds, existingMotifs).then(resolve).catch(reject);
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
        existingMotifs: Motif[],
        designBounds: Bounds
    ): Motif {
        const newId = `motif-${Date.now()}`;
        const offset = 20;

        const startX = sourceMotif.x + offset;
        const startY = sourceMotif.y + offset;

        const { x: validX, y: validY } = findClosestValidPosition(
            startX,
            startY,
            sourceMotif.width,
            sourceMotif.height,
            sourceMotif.rotation || 0,
            sourceMotif.scaleX || 1,
            sourceMotif.scaleY || 1,
            existingMotifs,
            designBounds.toObject(),
            this.collisionPadding
        );

        // Keep within bounds
        const safeX = validX > designBounds.right ? designBounds.left : validX;
        const safeY = validY > designBounds.bottom ? designBounds.top : validY;

        return {
            ...sourceMotif,
            id: newId,
            x: safeX,
            y: safeY,
        };
    }

    /**
     * Get maximum allowed motifs
     */
    getMaxMotifs(): number {
        return this.maxMotifs;
    }

    /**
     * Get collision padding
     */
    getCollisionPadding(): number {
        return this.collisionPadding;
    }
}

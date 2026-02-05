/**
 * Value object representing rectangular boundaries
 */
export class Bounds {
    readonly left: number;
    readonly top: number;
    readonly right: number;
    readonly bottom: number;

    constructor(left: number, top: number, right: number, bottom: number) {
        this.left = left;
        this.top = top;
        this.right = right;
        this.bottom = bottom;
    }

    get width(): number {
        return this.right - this.left;
    }

    get height(): number {
        return this.bottom - this.top;
    }

    get centerX(): number {
        return (this.left + this.right) / 2;
    }

    get centerY(): number {
        return (this.top + this.bottom) / 2;
    }

    contains(x: number, y: number, width: number, height: number): boolean {
        return (
            x >= this.left &&
            y >= this.top &&
            x + width <= this.right &&
            y + height <= this.bottom
        );
    }

    static fromDimensions(x: number, y: number, width: number, height: number): Bounds {
        return new Bounds(x, y, x + width, y + height);
    }

    toObject() {
        return {
            left: this.left,
            top: this.top,
            right: this.right,
            bottom: this.bottom
        };
    }
}

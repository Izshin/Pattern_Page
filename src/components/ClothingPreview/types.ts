export interface Motif {
    id: string;
    image: HTMLImageElement;
    x: number;
    y: number;
    scaleX?: number;
    scaleY?: number;
    width: number;
    height: number;
    stitches?: {
        cols: number;
        rows: number;
    };
}

/**
 * Configuration for different clothing patterns
 */
export const PatternType = {
    BABY_BLANKET: 'BabyBlanket',
    HAT: 'Hat',
    SCARF: 'Scarf',
    SWEATER: 'Sweater',
    MITTENS: 'Mittens',
    BAG: 'Bag'
} as const;

export type PatternType = typeof PatternType[keyof typeof PatternType];

export interface PatternDimensions {
    width: number;
    height: number;
}

export class PatternConfig {
    readonly type: PatternType;
    readonly dimensions?: PatternDimensions;

    constructor(type: PatternType, dimensions?: PatternDimensions) {
        this.type = type;
        this.dimensions = dimensions;
    }

    get isBabyBlanket(): boolean {
        return this.type === PatternType.BABY_BLANKET;
    }

    get isHat(): boolean {
        return this.type === PatternType.HAT;
    }

    static fromUrl(): PatternConfig {
        const urlParams = new URLSearchParams(window.location.search);
        const patternParam = urlParams.get('pattern') || 'BabyBlanket';
        const type = Object.values(PatternType).includes(patternParam as PatternType)
            ? (patternParam as PatternType)
            : PatternType.BABY_BLANKET;

        return new PatternConfig(type);
    }

    static getDefaultDimensions(type: PatternType): PatternDimensions {
        switch (type) {
            case PatternType.BABY_BLANKET:
                return { width: 60, height: 80 };
            default:
                return { width: 100, height: 100 };
        }
    }
}

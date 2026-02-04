/**
 * Helper to safely get CSS variable with fallback
 */
export const getCssVariable = (name: string, fallback: string): string => {
    if (typeof window === 'undefined') return fallback;
    const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return value || fallback;
};

/**
 * Helper to construct RGBA from CSS RGB variable
 */
export const getRgbaFromCss = (name: string, alpha: number, fallbackRgb: string): string => {
    const rgb = getCssVariable(name, fallbackRgb);
    return `rgba(${rgb}, ${alpha})`;
};

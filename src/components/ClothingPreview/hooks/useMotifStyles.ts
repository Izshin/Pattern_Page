import { getCssVariable, getRgbaFromCss } from '../../../utils/styleUtils';

export const useMotifStyles = () => {
    // Styling constants derived from user request
    const secondaryRgb = '--color-secondary-rgb';
    const accentRgb = '--color-accent-rgb';

    // Fallbacks
    const fallbackSecondaryRgb = '245, 245, 240';
    const fallbackAccentRgb = '255, 128, 138';

    // Default Styles
    const buttonFill = getRgbaFromCss(secondaryRgb, 0.8, fallbackSecondaryRgb);
    const buttonStroke = getRgbaFromCss(accentRgb, 0.133, fallbackAccentRgb);
    const accentColor = getCssVariable('--color-accent', '#FF808A');
    const shadowColor = getRgbaFromCss(accentRgb, 0.3, fallbackAccentRgb);

    // Hover Styles
    const hoverStroke = getRgbaFromCss(accentRgb, 0.6, fallbackAccentRgb);
    const hoverShadowColor = getRgbaFromCss(accentRgb, 0.65, fallbackAccentRgb);

    return {
        buttonFill,
        buttonStroke,
        accentColor,
        shadowColor,
        hoverStroke,
        hoverShadowColor,
    };
};

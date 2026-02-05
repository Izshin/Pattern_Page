import { useMemo } from 'react';
import { PatternConfig } from '../models/PatternConfig';

/**
 * Hook to manage pattern configuration from URL
 */
export const usePatternConfig = (overrideDimensions?: { width: number; height: number }) => {
    const patternConfig = useMemo(() => {
        const config = PatternConfig.fromUrl();
        
        // If dimensions provided as prop, use them; otherwise use defaults
        const dimensions = overrideDimensions || 
            PatternConfig.getDefaultDimensions(config.type);
        
        return new PatternConfig(config.type, dimensions);
    }, [overrideDimensions]);

    return patternConfig;
};

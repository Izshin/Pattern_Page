import { PatternType } from '../../models/PatternConfig';
import SweaterIcon from '../../../../assets/Logos/SweaterIcon.svg?react';
import './ClothingDropdown.css';

interface PatternMenuItem {
    type: PatternType;
    label: string;
    icon: string | React.ComponentType;
}

const PATTERN_MENU_ITEMS: PatternMenuItem[] = [
    {
        type: PatternType.BABY_BLANKET,
        label: 'Baby Blankets',
        icon: '/src/assets/Patterns/BabybBlanketPatternImage.png'
    },
    {
        type: PatternType.HAT,
        label: 'Hats',
        icon: SweaterIcon
    },
    {
        type: PatternType.SCARF,
        label: 'Scarfs',
        icon: '/IconsImages/ScarfIcon.png'
    },
    {
        type: PatternType.SWEATER,
        label: 'Sweaters',
        icon: '/IconsImages/SweaterIcon.png'
    },
    {
        type: PatternType.MITTENS,
        label: 'Mittens',
        icon: '/IconsImages/MittensIcon.png'
    },
    {
        type: PatternType.BAG,
        label: 'Bags',
        icon: '/IconsImages/BagIcon.png'
    }
];

interface ClothingDropdownProps {
    isOpen?: boolean;
    onToggle?: () => void;
}

/**
 * Dropdown component for selecting clothing patterns
 * Extracted from ClothingPreview for better separation of concerns
 */
export const ClothingDropdown: React.FC<ClothingDropdownProps> = ({ 
    isOpen = false, 
    onToggle 
}) => {

    const handlePatternSelect = (patternType: PatternType) => {
        // Navigate to new pattern
        const url = new URL(window.location.href);
        url.searchParams.set('pattern', patternType);
        window.location.replace(url.toString());
    };

    const renderIcon = (icon: string | React.ComponentType) => {
        if (typeof icon === 'string') {
            return <img src={icon} alt="" />;
        }
        const IconComponent = icon;
        return <IconComponent />;
    };

    return (
        <div className="clothing-dropdown">
            <button
                className="dropdown-button"
                onClick={onToggle}
            >
                Clothing
                <svg
                    width="30"
                    height="30"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className={isOpen ? 'rotated' : ''}
                >
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </button>

            {isOpen && (
                <div className="dropdown-menu">
                    {PATTERN_MENU_ITEMS.map((item) => (
                        <button
                            key={item.type}
                            className="dropdown-item"
                            onClick={() => handlePatternSelect(item.type)}
                        >
                            <div className="dropdown-item-content">
                                {renderIcon(item.icon)}
                                <span>{item.label}</span>
                            </div>
                            <span className="dropdown-item-arrow">›</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

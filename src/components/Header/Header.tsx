import { useState, useEffect } from 'react';
import './Header.css';
import CommunityIcon from '../../assets/Logos/CommunityIcon.svg?react';
import LibraryIcon from '../../assets/Logos/LibraryIcon.svg?react';
import StudioIcon from '../../assets/Logos/StudioIcon.svg?react';
import knittedForYouLogo from '../../assets/Logos/KnittedForYouLogo.png';
// Updated to use the correct SVG file as requested
import AccountIcon from '../../assets/Logos/AccountIcon.svg?react';

const Header = () => {
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // Show header if scrolling up or at the very top
            if (currentScrollY < lastScrollY || currentScrollY < 50) {
                setIsVisible(true);
            } else if (currentScrollY > lastScrollY && currentScrollY > 50) {
                // Hide header if scrolling down and not at the top
                setIsVisible(false);
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [lastScrollY]);

    return (
        <header className={`header ${!isVisible ? 'header-hidden' : ''}`}>
            <div className="logo-container">
                <img src={knittedForYouLogo} alt="Logo" />
            </div>
            <div className="header-nav">
                <div className="nav-item">
                    <span>Community</span>
                    <CommunityIcon className="nav-icon" />
                </div>
                <div className="nav-item">
                    <span>Library</span>
                    <LibraryIcon className="nav-icon" />
                </div>
                <div className="nav-item">
                    <span>My Studio</span>
                    <StudioIcon className="nav-icon" />
                </div>
                <div className="user-icon">
                    <AccountIcon className="account-icon" />
                </div>
            </div>
        </header>
    );
};

export default Header;

import React from 'react';
import type { ReactNode } from 'react';
import './InfoSection.css'; // Using the same CSS for now to keep styles consistent

interface AccordionItemProps {
    id: number;
    title: string;
    content: ReactNode;
    isOpen: boolean;
    onToggle: () => void;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ id, title, content, isOpen, onToggle }) => {
    return (
        <div className={`accordion-item ${isOpen ? 'active' : ''}`}>
            <button
                className="accordion-header"
                onClick={onToggle}
                aria-expanded={isOpen}
                aria-controls={`accordion-content-${id}`}
            >
                <span>{title}</span>
                <div className="accordion-icon-wrapper">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="accordion-icon">
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                </div>
            </button>
            <div
                id={`accordion-content-${id}`}
                className={`accordion-content ${isOpen ? 'open' : ''}`}
                role="region"
            >
                <div className="accordion-content-inner">
                    {content}
                </div>
            </div>
        </div>
    );
};

export default AccordionItem;

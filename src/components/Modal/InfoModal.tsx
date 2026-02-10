import React from 'react';
import './InfoModal.css';

interface InfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    className?: string;
}

const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose, title, children, className = '' }) => {
    return (
        <div className={`modal-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
            <div className={`info-modal ${className}`} onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>
                <div className="modal-title-container">
                    <h2>{title}</h2>
                </div>
                <div className="modal-content">
                    <div className="modal-left">
                        {children}
                    </div>
                    <div className="modal-right">
                        <div className="video-placeholder">
                            <img src="/IconsImages/VideoIcon.png" alt="Video" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InfoModal;

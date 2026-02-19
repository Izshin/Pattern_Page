import { useState, useEffect, forwardRef } from 'react';
import './InfoSection.css';
import DownloadIcon from '../../assets/Logos/DownloadIcon.svg?react';
import EditIcon from '../../assets/Logos/EditIcon.svg?react';
import ArrowUpIcon from '../../assets/Logos/ArrowUpIcon.svg?react';
import InfoIcon from '../../assets/Logos/InfoIcon.svg?react';
import AccordionItem from './AccordionItem';
import KnittingChart from './KnittingChart';

interface InfoSectionProps {
    showFloatingButtons: boolean;
    accordionSections?: any[];
    isBabyBlanket?: boolean;
    hasMotif?: boolean;
    motifId?: string | null;
    onScrollToInfo?: () => void;
}

// Default data for sweater (fallback)
const ACCORDION_DATA = [
    {
        id: 0,
        title: 'Size',
        content: (
            <>
                <h3 className="content-section-title">Size calculations</h3>
                <div className="measurements-list">
                    <div className="measurement-labels">
                        <span>Sweater Width</span>
                        <span>Sweater Length</span>
                        <span>Arm Length</span>
                        <span>Sleeve Cuff</span>
                        <span>Sleeve Top</span>
                    </div>
                    <div className="measurement-values">
                        <span>59 cm</span>
                        <span>72 cm</span>
                        <span>55 cm</span>
                        <span>22 cm</span>
                        <span>41 cm</span>
                    </div>
                </div>
                <div className="measurements-list">
                    <div className="measurement-labels">
                        <span>Neck Width</span>
                        <span>Neck Depth</span>
                        <span>Wrist Ribbing</span>
                        <span>Armhole Length</span>
                        <span></span>
                    </div>
                    <div className="measurement-values">
                        <span>16 cm</span>
                        <span>9 cm</span>
                        <span>5 cm</span>
                        <span>25 cm</span>
                        <span></span>
                    </div>
                </div>
            </>
        )
    },
    {
        id: 1,
        title: 'Backside',
        content: (
            <>
                <h3>Back Side Instructions</h3>
                <p>Cast on 57 stitches and knit 19 rows wrist, p1 k1.<br />
                    Knit 152 rows in stockinette.<br />
                    Work the armholes and the neckline based on the instructions below.</p>
                <p>Decrease 5 stitches at the beginning and the end of the next row.<br />
                    Decrease 1 stitch at the beginning and the end of every 4th row 2 times.<br />
                    Knit 56 rows. Move 10 stitches from the middle to a stitch holder.</p>
                <p>Knit each side of the neckline separately.<br />
                    Cast off 1 stitch/stitches every 4th row 5 times. Cast off.<br />
                    Work the same on the other side of the neckline.</p>
            </>
        )
    },
    {
        id: 2,
        title: 'Frontside',
        content: (
            <>
                <h3>Front Side Instructions</h3>
                <p>Cast on 57 stitches and knit 19 rows wrist, 1a, 1r.<br />
                    Knit 11 rows in stockinette.</p>
                <p>Work according to your chosen motif in the middle of the garment. Knit 141 rows.<br />
                    You have now reached the armhole. Cast off 5 stitches. Knit 47 stitches and cast off 5 stitches.</p>
                <p>Decrease 1 stitch at the armhole in every 4th row 2 times.<br />
                    Knit 37 rows. Now you will knit the neckline. Move 10 stitches from the middle to a stitch holder. Knit each side of the neckline separately.</p>
                <p>Decrease 1 stitch at the neck every 8th row 5 times.<br />
                    Cast off remaining stitches.<br />
                    Work the same on the other side of the neckline.</p>
            </>
        )
    },
    {
        id: 3,
        title: 'Arms',
        content: (
            <>
                <h3>Arms Instructions</h3>
                <p>Cast on 22 stitches and knit 19 rows wrist, 1a, 1r.<br />
                    Knit in stockinette increasing 1 at the beginning and end of each 20th row 9 times.</p>
                <p>Shape the sleeve cap according to the instructions below:</p>
                <ul>
                    <li>Decrease 5 stitches at the beginning and the end of the next row.</li>
                    <li>Decrease 1 stitch at the beginning and the end of every 4th row 2 times.</li>
                    <li>Decrease 1 stitch at the beginning and the end of every 6th row 7 times.</li>
                    <li>Decrease 1 stitch at the beginning and the end of every 6th row 2 times.</li>
                    <li>Decrease 1 stitch at the beginning and the end of every 2nd row 2 times.</li>
                </ul>
                <p>Cast off the remaining stitches. Knit the second sleeve in the same way.</p>
            </>
        )
    },
    {
        id: 4,
        title: 'Neckline',
        content: (
            <>
                <h3>Neckline Assembly</h3>
                <p>Sew the shoulder seams.</p>
                <p>Transfer the stitches from the stitch holder at the front neckline to a circular needle. Pick up 13 stitches along the right neckline edge, transfer the stitches from the back neckline, and pick up 13 stitches along the left neckline edge.</p>
                <p>Work in rib stitch around until the neckline measures 2 cm. Cast off in rib stitch.</p>
                <p>Sew together the sides of the body and the sleeves. Attach the sleeves to the armholes.</p>
            </>
        )
    }
];

const InfoSection = forwardRef<HTMLDivElement, InfoSectionProps>(({ showFloatingButtons, accordionSections, isBabyBlanket, hasMotif = true, motifId, onScrollToInfo }, ref) => {
    const [openAccordions, setOpenAccordions] = useState<Set<number>>(new Set([0]));
    const [isDownloading, setIsDownloading] = useState(false);
    const [isNearTop, setIsNearTop] = useState(true);

    useEffect(() => {
        const handleScroll = () => {
            setIsNearTop(window.scrollY / document.body.scrollHeight < 0.3);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleCombinedButton = () => {
        if (isNearTop && onScrollToInfo) {
            setOpenAccordions(new Set([0]));
            onScrollToInfo();
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleDownloadPdf = async () => {
        if (!motifId || isDownloading) return;
        setIsDownloading(true);
        try {
            const res = await fetch('http://localhost:3001/pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ motifId })
            });
            if (!res.ok) throw new Error('PDF generation failed');
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `motif-${motifId}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('PDF download error:', err);
        } finally {
            setIsDownloading(false);
        }
    };

    const toggleAccordion = (index: number) => {
        setOpenAccordions(prev => {
            const next = new Set(prev);
            if (next.has(index)) {
                next.delete(index);
            } else {
                next.add(index);
            }
            return next;
        });
    };

    // Use dynamic accordion sections for baby blanket, fallback to default for sweater
    const baseAccordionData = isBabyBlanket && accordionSections && accordionSections.length > 0
        ? accordionSections.map(section => ({
            ...section,
            content: (
                <>
                    <h3>{section.title}</h3>
                    <div style={{ whiteSpace: 'pre-wrap' }}>
                        {section.content.split('\n\n').map((paragraph: string, idx: number) => (
                            <p key={idx}>{paragraph}</p>
                        ))}
                    </div>
                </>
            )
          }))
        : ACCORDION_DATA;

    const accordionData = [
        ...baseAccordionData,
        ...(hasMotif ? [{
            id: baseAccordionData.length,
            title: 'Chart',
            content: <KnittingChart />
        }] : [])
    ];

    const toggleAll = () => {
        if (openAccordions.size === accordionData.length) {
            setOpenAccordions(new Set());
        } else {
            const allIds = new Set(accordionData.map(section => section.id));
            setOpenAccordions(allIds);
        }
    };

    const isAllOpen = openAccordions.size === accordionData.length;

    return (
        <section ref={ref} className="info-section">
            <div className="instructions-header">
                <div className="header-content">
                    <div>
                        <h2>Knitting pattern</h2>
                        <p className="instructions-subtitle">Precise instructions about how to knit your motifs</p>
                    </div>
                    <button
                        className={`expand-all-button ${isAllOpen ? 'active' : ''}`}
                        onClick={toggleAll}
                        aria-label={isAllOpen ? 'Collapse All' : 'Expand All'}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="instructions-container">
                {accordionData.map((section) => (
                    <AccordionItem
                        key={section.id}
                        id={section.id}
                        title={section.title}
                        content={section.content}
                        isOpen={openAccordions.has(section.id)}
                        onToggle={() => toggleAccordion(section.id)}
                    />
                ))}
            </div>

            <div className={`floating-actions ${showFloatingButtons ? 'visible' : ''}`}>
                {motifId && (
                <div className="action-button-wrapper download-wrapper">
                    <div className="download-tooltip">
                        <div className="tooltip-header">
                            <strong>Download pdf pattern</strong>
                            <InfoIcon className="info-icon" />
                        </div>
                        <p>Pro tip: The PDF is locked to the specific settings provided. Stick to the interactive guide above if you want instructions that adapt as you work.</p>
                    </div>
                    <button
                        className="action-button download-button"
                        aria-label="Download PDF"
                        onClick={handleDownloadPdf}
                        disabled={isDownloading}
                    >
                        {isDownloading ? '…' : <DownloadIcon />}
                    </button>
                </div>
                )}
                <button
                    className="action-button combined-button"
                    onClick={handleCombinedButton}
                    aria-label={isNearTop ? 'Preview Instructions' : 'Scroll to Top'}
                >
                    <EditIcon />
                    <div className="vertical-divider"></div>
                    <ArrowUpIcon />
                </button>
            </div>
        </section>
    );
});

export default InfoSection;

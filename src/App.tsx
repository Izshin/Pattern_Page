import { useState, useRef, useEffect } from 'react'
import './App.css'
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import Header from './components/Header/Header';
import ClothingPreview from './components/ClothingPreview/ClothingPreview';
import Controls from './components/Controls/Controls';
import InfoSection from './components/InfoSection/InfoSection';
import InfoModal from './components/Modal/InfoModal';
import DocumentIcon from './assets/Logos/DocumentIcon.svg?react';

function App() {
  const [knittingTensionMin, setKnittingTensionMin] = useState(19)
  const [knittingTensionMax, setKnittingTensionMax] = useState(20)
  const [chestSize, setChestSize] = useState(2) // 0-4 for XS, S, M, L, XL
  const [activeModal, setActiveModal] = useState<'tension' | 'chest' | null>(null)

  // Info Section Scroll Logic
  const [showInfoSection, setShowInfoSection] = useState(false)
  const [isInInfoSection, setIsInInfoSection] = useState(false)
  const infoSectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Logic: if intersecting (visible) OR if the top of the element is above the viewport (scrolled past),
        // we consider the user "in" the section or past it?
        // Original logic: rect.top <= window.innerHeight / 2.
        // This means if the top of the section is in the top-half of the viewport or above it.

        // IntersectionObserver alone tells if *any* part is visible.
        // To match "scrolled past or into":
        // We can observe a sentinel or the section itself with threshold.

        // Let's stick to a simpler check inside the observer callback or use the entry data.
        // If we want to replicate specifically "top <= window.innerHeight/2":
        // We can check entry.boundingClientRect.top.

        if (entry) {
          setIsInInfoSection(entry.isIntersecting || entry.boundingClientRect.top < 0);
        }
      },
      {
        rootMargin: '-50% 0px 0px 0px' // This roughly emulates the "top <= innerHeight / 2" trigger point
      }
    );

    if (showInfoSection && infoSectionRef.current) {
      observer.observe(infoSectionRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [showInfoSection]); // Re-run if showInfoSection changes effectively enabling the check

  const scrollToInfo = () => {
    if (isInInfoSection) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setShowInfoSection(true);
      // Small timeout to allow render before scroll
      setTimeout(() => {
        infoSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  };

  return (
    <div className="app">
      <Header />

      <main className="main-content">
        <div className="left-section">
          <ClothingPreview />
        </div>

        <div className="right-section">
          <Controls
            tensionMin={knittingTensionMin}
            setTensionMin={setKnittingTensionMin}
            tensionMax={knittingTensionMax}
            setTensionMax={setKnittingTensionMax}
            chestSize={chestSize}
            setChestSize={setChestSize}
            onOpenInfo={setActiveModal}
          />
        </div>
      </main>

      {/* Preview Instructions Button */}
      <button
        className={`info-scroll-button ${isInInfoSection ? 'active' : ''}`}
        onClick={scrollToInfo}
        title={isInInfoSection ? "Back to top" : "View detailed information"}
      >
        <span>Preview instructions</span>
        <DocumentIcon className="info-doc-icon" />
      </button>

      {/* Detailed Information Section */}
      {showInfoSection && (
        <InfoSection ref={infoSectionRef} showFloatingButtons={isInInfoSection} />
      )}

      {/* Info Modals */}
      <InfoModal
        isOpen={activeModal === 'tension'}
        onClose={() => setActiveModal(null)}
        title="Knitting tension"
      >
        <h3>How does it work?</h3>
        <p>By pulling the handles above, you change the knitting tension.</p>
        <p>In the preview image, you will see how much the size of the motif in the middle changes. The knitting pattern of the sweater is recalculated depending on the selected knitting tension.</p>
        <p>Be sure to choose a yarn tension that reproduces the motif in the desired size.</p>
      </InfoModal>

      <InfoModal
        isOpen={activeModal === 'chest'}
        onClose={() => setActiveModal(null)}
        title="Chest / Bust"
      >
        <h3>How does it work?</h3>
        <p>By moving the slider, you can select the desired chest/bust size for your garment.</p>
        <p>The pattern will automatically adjust to fit the selected size, ensuring a perfect fit.</p>
        <p>Choose the size that best matches your measurements for optimal results.</p>
      </InfoModal>
    </div>
  )
}

export default App

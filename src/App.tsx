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
import { patternAPI } from './utils/api';
import type { Pattern } from './types/pattern';

function App() {
  const [knittingTensionMin, setKnittingTensionMin] = useState(18)
  const [knittingTensionMax, setKnittingTensionMax] = useState(32)
  const [chestSize, setChestSize] = useState(2) // 0-5 for sweater sizes
  const [sizeMin, setSizeMin] = useState(60) // Baby blanket width
  const [sizeMax, setSizeMax] = useState(80) // Baby blanket height
  const [activeModal, setActiveModal] = useState<'tension' | 'chest' | null>(null)
  const [pattern, setPattern] = useState<Pattern | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPattern, setCurrentPattern] = useState<string>('BabyBlanket')
  const [accordionSections, setAccordionSections] = useState<any[]>([])
  const [blanketDimensions, setBlanketDimensions] = useState({ width: 60, height: 80 })

  // Fixed tension range for all patterns
  const tensionRange = { min: 8, max: 40 };

  // Read pattern from URL on mount and watch for changes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const patternParam = params.get('pattern') || 'BabyBlanket';
    setCurrentPattern(patternParam);
  }, []);

  // Fetch pattern data based on current pattern type
  useEffect(() => {
    const loadPattern = async () => {
      try {
        setLoading(true);
        // Load pattern based on URL parameter
        const patternFile = currentPattern === 'BabyBlanket' ? 'babyblanket1.pat' : 'sweater1.pat';
        const data = await patternAPI.getPattern(patternFile);
        setPattern(data);
        
        // Calculate pattern with current slider values if baby blanket
        if (currentPattern === 'BabyBlanket') {
          await calculateBabyBlanketPattern();
        }
      } catch (error) {
        console.error('Failed to load pattern:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadPattern();
  }, [currentPattern]);

  // Calculate pattern whenever sliders change (for baby blanket)
  useEffect(() => {
    if (currentPattern === 'BabyBlanket' && !loading) {
      const debounce = setTimeout(() => {
        calculateBabyBlanketPattern();
      }, 500); // Debounce to avoid too many API calls
      
      return () => clearTimeout(debounce);
    }
  }, [knittingTensionMin, knittingTensionMax, sizeMin, sizeMax, currentPattern, loading]);

  const calculateBabyBlanketPattern = async () => {
    try {
      const result = await patternAPI.calculatePattern({
        patternFile: 'babyblanket1.pat',
        tensionX: knittingTensionMin,
        tensionY: knittingTensionMax,
        width: sizeMin,
        height: sizeMax
      });
      
      if (result.success) {
        setAccordionSections(result.sections);
        // Update blanket dimensions from backend calculations
        setBlanketDimensions({
          width: result.defaults['width-cm'] || sizeMin,
          height: result.defaults['height-cm'] || sizeMax
        });
      }
    } catch (error) {
      console.error('Failed to calculate pattern:', error);
    }
  };

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

  if (loading) {
    return (
      <div className="app">
        <Header />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <p>Loading pattern...</p>
        </div>
      </div>
    );
  }

  const isBabyBlanket = currentPattern === 'BabyBlanket';
  const sizeRange = isBabyBlanket 
    ? { min: 60, max: 140, step: 10 }
    : { min: 0, max: 5, step: 1 };

  return (
    <div className="app">
      <Header />

      <main className="main-content">
        <div className="left-section">
          <ClothingPreview blanketDimensions={blanketDimensions} />
        </div>

        <div className="right-section">
          <Controls
            tensionMin={knittingTensionMin}
            setTensionMin={setKnittingTensionMin}
            tensionMax={knittingTensionMax}
            setTensionMax={setKnittingTensionMax}
            chestSize={chestSize}
            setChestSize={setChestSize}
            sizeMin={sizeMin}
            setSizeMin={setSizeMin}
            sizeMax={sizeMax}
            setSizeMax={setSizeMax}
            onOpenInfo={setActiveModal}
            tensionRange={tensionRange}
            sizeRange={sizeRange}
            isBabyBlanket={isBabyBlanket}
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
        <InfoSection 
          ref={infoSectionRef} 
          showFloatingButtons={isInInfoSection}
          accordionSections={accordionSections}
          isBabyBlanket={isBabyBlanket}
        />
      )}

      {/* Info Modals */}
      <InfoModal
        isOpen={activeModal === 'tension'}
        onClose={() => setActiveModal(null)}
        title="Knitting tension"
      >
        <h3>How does it work?</h3>
        <p>By pulling the handles above, you change the knitting tension.</p>
        <p>In the preview image, you will see how much the size of the motif in the middle changes. The knitting pattern is recalculated depending on the selected knitting tension.</p>
        <p>Be sure to choose a yarn tension that reproduces the motif in the desired size.</p>
      </InfoModal>

      <InfoModal
        isOpen={activeModal === 'chest'}
        onClose={() => setActiveModal(null)}
        title={isBabyBlanket ? "Size" : "Chest / Bust"}
      >
        <h3>How does it work?</h3>
        {isBabyBlanket ? (
          <>
            <p>By pulling the handles above, you can adjust the width and height of your baby blanket.</p>
            <p>The left handle controls the width, and the right handle controls the height.</p>
            <p>The pattern will automatically adjust to fit your selected dimensions.</p>
          </>
        ) : (
          <>
            <p>By moving the slider, you can select the desired chest/bust size for your garment.</p>
            <p>The pattern will automatically adjust to fit the selected size, ensuring a perfect fit.</p>
            <p>Choose the size that best matches your measurements for optimal results.</p>
          </>
        )}
      </InfoModal>
    </div>
  )
}

export default App

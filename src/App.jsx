import { useState, useEffect, useRef, useMemo, memo } from 'react';
import HeartBackground from "./components/HeartBackground";
import RotatingText from "./components/RotatingText";
import ScrollReveal from "./components/ScrollReveal";
import DomeGallery from './components/DomeGallery';
import ScrollVelocity from './components/ScrollVelocity';

// Memoizziamo i componenti per evitare render superflui
const MemoizedHearts = memo(HeartBackground);
const MemoizedDomeGallery = memo(DomeGallery);
const MemoizedRotatingText = memo(RotatingText);

function App() {
  
  const [isGalleryActive, setIsGalleryActive] = useState(false);
  const [heroOpacity, setHeroOpacity] = useState(1);
  const [heroScale, setHeroScale] = useState(1);
  const [showContent, setShowContent] = useState(false);
  const [loadingText, setLoadingText] = useState("Rianimando i battiti...");

  const [noCount, setNoCount] = useState(0);
  const [isUnlocked, setIsUnlocked] = useState(false);

  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef(null);
  const scrollPosition = useRef(0);
  const secondSectionRef = useRef(null);

  const mysteryMessages = "Unlocking Memories...";

  const smoothScrollTo = (targetY, duration) => {
    const startY = window.pageYOffset;
    const difference = targetY - startY;
    let startTime = null;
    const easeInOutQuart = (t) => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const fraction = Math.min(progress / duration, 1);
      const ease = easeInOutQuart(fraction);
      window.scrollTo(0, startY + difference * ease);
      if (progress < duration) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  };

  const resetHeroVisuals = () => {
    setHeroOpacity(1);
    setHeroScale(1);
  };

  const handleNoClick = () => {
    resetHeroVisuals();
    setNoCount(prev => prev + 1);
    setIsUnlocked(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleYesClick = () => {
    resetHeroVisuals();
    setIsUnlocked(true);
    setTimeout(() => {
      if (secondSectionRef.current) {
        const targetPosition = secondSectionRef.current.offsetTop;
        smoothScrollTo(targetPosition, 1400);
      }
    }, 100);
    setTimeout(() => {
      setNoCount(0);
    }, 1600);
  };

  const isMaxedOut = noCount >= 4;
  const yesButtonSize = noCount * 45 + 16;

  useEffect(() => {
    if (isGalleryActive) {
      scrollPosition.current = window.pageYOffset;
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = isUnlocked ? '' : 'hidden';
    }
  }, [isGalleryActive, isUnlocked]);

  useEffect(() => {
    const handleScroll = () => {
      if (isGalleryActive || (isUnlocked && window.scrollY === 0)) return;
      const scrollY = window.scrollY;
      setHeroOpacity(Math.max(0, 1 - scrollY / 500));
      setHeroScale(Math.max(0.9, 1 - scrollY / 1000));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isGalleryActive, isUnlocked]);

  const handleActivateGallery = () => {
    setIsGalleryActive(true);
    const interval = setInterval(() => setLoadingText(mysteryMessages), 400);
    setTimeout(() => {
      clearInterval(interval);
      setShowContent(true);
    }, 1800);
  };

  const handleDeactivateGallery = () => {
    setShowContent(false);
    setIsGalleryActive(false);
    setDragX(0);
    setIsDragging(false);
    
  };

  const handleMove = (e) => {
    if (!isDragging || !sliderRef.current) return;
    if (e.cancelable) e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const rect = sliderRef.current.getBoundingClientRect();
    const thumbWidth = 56;
    const maxDrag = rect.width - thumbWidth - 8;
    let currentX = clientX - rect.left - thumbWidth / 2;
    currentX = Math.max(0, Math.min(currentX, maxDrag));
    setDragX(currentX);
    if (currentX >= maxDrag * 0.98) {
      setIsDragging(false);
      setDragX(maxDrag);
      handleActivateGallery();
    }
  };

  const handleRelease = () => {
    setIsDragging(false);
    if (!isGalleryActive) setDragX(0);
  };

  // Memoizziamo il testo rotante per evitare reset dell'animazione
  const rotatingTextElement = useMemo(() => (
    <MemoizedRotatingText
      texts={['Only', 'Partner', 'In Crime', 'Trouble', 'Always','Nurse', 'First Aid']}
      mainClassName="px-6 uppercase py-3 bg-red-600 text-white rounded-2xl font-bold text-2xl md:text-3xl inline-block shadow-xl"
      rotationInterval={2000}
    />
  ), []);

  return (
    <div className={`relative block w-full bg-slate-900 ${!isUnlocked ? 'h-screen overflow-hidden' : 'overflow-x-hidden'}`}>
      {useMemo(() => <MemoizedHearts svgPath="/heart.svg" />, [])}

      {/* 1. HERO SECTION */}
      <section
        className="relative z-10 h-screen w-full flex flex-col items-center justify-center text-center px-4 transition-all duration-700 ease-out"
        style={{
          opacity: isGalleryActive ? 0 : heroOpacity,
          transform: `scale(${heroScale})`,
          pointerEvents: isGalleryActive ? 'none' : 'auto'
        }}
      >
        <div className="space-y-4">
          <h1 className="text-4xl md:text-7xl font-black text-white italic uppercase tracking-tighter">Are you my</h1>
          {rotatingTextElement}
          <h1 className="text-4xl md:text-7xl font-black text-white italic uppercase tracking-tighter">valentine?</h1>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 mt-8 pb-20 md:pb-0 relative transition-all duration-700">
          <button
            onClick={handleYesClick}
            style={{
              fontSize: isMaxedOut ? 'clamp(4rem, 15vw, 10rem)' : `${Math.max(1, yesButtonSize / 16)}rem`,
              height: isMaxedOut ? '100dvh' : 'auto',
              transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            className={`bg-red-600 hover:bg-red-500 text-white font-black rounded-full uppercase tracking-widest shadow-xl z-50
              ${isMaxedOut
                ? 'fixed top-0 left-0 w-screen flex items-center justify-center !rounded-none m-0 p-0 shadow-none'
                : 'relative px-10 py-4 hover:scale-105 active:scale-95'}
            `}
          >
            YES
          </button>
          {!isMaxedOut && (
            <button
              onClick={handleNoClick}
              style={{
                transform: `scale(${Math.max(0.4, 1 - noCount * 0.15)})`,
                opacity: 1 - (noCount * 0.15),
                transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              className="px-8 py-3 bg-white/10 text-white rounded-full font-bold text-lg border border-white/20 hover:bg-white/20 active:scale-95 whitespace-nowrap"
            >
              No
            </button>
          )}
        </div>
      </section>

      {isUnlocked && (
        <>
          <section ref={secondSectionRef} className="relative z-10 w-full min-h-screen flex items-center justify-center px-6 text-center text-white/80" style={{ opacity: isGalleryActive ? 0 : 1 }}>
            <ScrollReveal baseOpacity={0.05} blurStrength={20} startView="60%">
             {`Since you've made it all the way here, I guess you are officially my Valentine...
              So, this is what it means to be mine! 
              Now let me show you the rewards, just a little further.`}
            </ScrollReveal>
          </section>

          <section className="relative z-20 h-[calc(100vh-80px)] w-full flex flex-col items-center">
            
            <div className="w-full h-screen flex items-center justify-center p-4 pb-0">
              <div
                className={`transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] flex items-center justify-center overflow-hidden ${isGalleryActive
                    ? 'fixed inset-0 z-[100] w-full h-full bg-slate-900/90 backdrop-blur-sm'
                    : 'relative w-full max-w-3xl h-[500px] border border-white/10 rounded-[40px] bg-white/5 backdrop-blur-md shadow-2xl'
                  }`}
              >
                {isGalleryActive && showContent && (
                  <button onClick={handleDeactivateGallery} className="absolute top-8 right-8 z-[110] px-6 py-2 bg-red-600 text-white text-[10px] font-black rounded-full uppercase tracking-widest shadow-xl transition-all active:scale-90">Close</button>
                )}

                <div className="w-full h-full flex items-center justify-center relative bg-transparent">
                  
                  {/* Gallery con controllo pointer-events e opacità */}
                  <div className={`w-full h-full transition-opacity duration-1000 ${(!isGalleryActive || showContent) ? 'opacity-100' : 'opacity-0'} ${!isGalleryActive ? 'pointer-events-none' : 'pointer-events-auto'}`}>
                    <MemoizedDomeGallery 
                    key={isGalleryActive ? 'active-gallery' : 'idle-gallery'}
                      fit={isGalleryActive ? 0.9 : 1.2} 
                      segments={25} 
                      minRadius={!isGalleryActive ? 500 : 600} 
                      grayscale={!isGalleryActive} 
                      maxVerticalRotationDeg={isGalleryActive ? 10 : undefined}
                    />
                  </div>

                  {!isGalleryActive && (
                    <div className="absolute inset-0 z-40 flex items-center justify-center">
                       <div
                        ref={sliderRef}
                        className="absolute bottom-12 w-[280px] h-16 bg-white/5 border border-white/10 backdrop-blur-md rounded-full p-1 shadow-inner overflow-hidden pointer-events-auto"
                        style={{ touchAction: 'none' }}
                        onMouseMove={handleMove} onTouchMove={handleMove} onMouseUp={handleRelease} onTouchEnd={handleRelease}
                      >
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none pl-6">
                          <span className="text-[11px] font-black uppercase tracking-[0.3em] bg-gradient-to-r from-white/10 via-white/80 to-white/10 bg-[length:200%_auto] animate-shimmer bg-clip-text text-transparent italic pl-2">Slide to remember</span>
                        </div>
                        <div
                          className="h-14 w-14 bg-red-600 rounded-full flex items-center justify-center shadow-lg cursor-grab active:cursor-grabbing relative z-[60]"
                          onMouseDown={() => setIsDragging(true)} onTouchStart={() => setIsDragging(true)}
                          style={{ transform: `translateX(${dragX}px)`, transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28)' }}
                        >
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M9 18l6-6-6-6" /></svg>
                        </div>
                      </div>
                    </div>
                  )}

                  {isGalleryActive && !showContent && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center space-y-8 z-50 bg-slate-900">
                      <svg className="w-20 h-20 text-red-600 fill-current animate-heart-pulse drop-shadow-[0_0_20px_rgba(220,38,38,0.6)]" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                      <p className="text-white/60 text-xs tracking-[0.4em] animate-pulse italic uppercase font-black">{loadingText}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {!isGalleryActive && (
              <div className="w-full py-4 transition-opacity duration-700">
                <ScrollVelocity 
                  texts={['F + S +', 'S + F +']} 
                  velocity={100} 
                  className="custom-scroll-text" 
                />
              </div>
            )}
          </section>
        </>
      )}

      <style>{`
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        .animate-shimmer { animation: shimmer 3s linear infinite; }
        @keyframes heart-pulse { 0%, 100% { transform: scale(1); } 15% { transform: scale(1.3); } 30% { transform: scale(1); } 45% { transform: scale(1.15); } }
        .animate-heart-pulse { animation: heart-pulse 1.2s infinite cubic-bezier(0.215, 0.61, 0.355, 1); }
        .custom-scroll-text { 
          font-size: clamp(2.5rem, 12vw, 10rem); 
          font-weight: 900; 
          font-style: italic; 
          text-transform: uppercase; 
          color: rgba(255, 255, 255, 0.2);
          line-height: 0.9!important;
          display: flex;
          align-items: center;
        }
      `}</style>
    </div>
  );
}

export default App;
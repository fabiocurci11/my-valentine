import { useEffect, useRef, useMemo } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const ScrollReveal = ({
  children,
  scrollContainerRef,
  enableBlur = true,
  baseOpacity = 0, // Portato a 0 per un effetto reveal più pulito
  baseRotation = 3,
  blurStrength = 10, // Aumentato per un effetto più visibile
  containerClassName = '',
  textClassName = '',
  // Modificati i default per assicurare che l'animazione finisca quando il testo è al centro
  rotationEnd = 'top 30%', 
  wordAnimationEnd = 'top 20%'
}) => {
  const containerRef = useRef(null);

  const splitText = useMemo(() => {
    const text = typeof children === 'string' ? children : '';
    return text.split(/(\s+)/).map((word, index) => {
      if (word.match(/^\s+$/)) return word;
      return (
        <span className="inline-block word" key={index} style={{ willChange: 'opacity, filter' }}>
          {word}
        </span>
      );
    });
  }, [children]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Se non passi un container specifico, usa la window (standard)
    const scroller = scrollContainerRef?.current || window;

    // Refresh ScrollTrigger per evitare calcoli errati dopo il caricamento delle particelle
    ScrollTrigger.refresh();

    const ctx = gsap.context(() => {
      // 1. Animazione della rotazione del blocco intero
      gsap.fromTo(el, 
        { transformOrigin: 'center center', rotate: baseRotation }, 
        {
          ease: 'none',
          rotate: 0,
          scrollTrigger: {
            trigger: el,
            scroller,
            start: 'top 90%', // Inizia quando il top del testo è al 90% della visuale
            end: rotationEnd,
            scrub: 0.5, // Aggiunto un piccolo smoothing (0.5s) per evitare l'errore di Firefox
          }
        }
      );

      const wordElements = el.querySelectorAll('.word');

      // 2. Animazione Opacità e Blur delle singole parole
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          scroller,
          start: 'top 85%', 
          end: wordAnimationEnd,
          scrub: 0.8, // Rende lo scroll più fluido e meno "scattoso"
        }
      });

      tl.fromTo(wordElements, 
        { 
          opacity: baseOpacity, 
          filter: enableBlur ? `blur(${blurStrength}px)` : 'blur(0px)',
          y: 10 // Aggiunto un piccolo movimento verso l'alto per un effetto più moderno
        }, 
        {
          ease: 'none',
          opacity: 1,
          filter: 'blur(0px)',
          y: 0,
          stagger: 0.1, // Distanzia leggermente l'apparizione delle parole
        }
      );
    }, el);

    return () => {
      ctx.revert(); // Pulisce tutto correttamente al dismount
    };
  }, [scrollContainerRef, enableBlur, baseRotation, baseOpacity, rotationEnd, wordAnimationEnd, blurStrength]);

  return (
    <div ref={containerRef} className={`my-10 w-full ${containerClassName}`}>
      <p className={`text-[clamp(1.5rem,5vw,3.5rem)] leading-[1.4] font-bold text-white ${textClassName}`}>
        {splitText}
      </p>
    </div>
  );
};

export default ScrollReveal;
import { useEffect, useRef, useMemo } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const ScrollReveal = ({
  children,
  scrollContainerRef,
  enableBlur = true,
  baseOpacity = 0,
  baseRotation = 3,
  blurStrength = 10,
  containerClassName = '',
  textClassName = '',
  // Parametri di controllo altezza
  startView = "85%",      // Quando inizia lo svelamento (es. 95% = subito, 50% = metà schermo)
  rotationEnd = 'top 30%', 
  wordAnimationEnd = 'top 0%'
}) => {
  const containerRef = useRef(null);

  const splitText = useMemo(() => {
    const text = typeof children === 'string' ? children : '';
    return text.split(/(\s+)/).map((word, index) => {
      if (word.match(/^\s+$/)) return word;

      // Pulizia per il controllo parole chiave
      const cleanWord = word.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").trim();
      
      // Definiamo quali parole devono essere rosse
      const isSpecial = cleanWord === 'valentine' || cleanWord === 'surprise' || cleanWord === 'valentino';

      return (
        <span 
          className="inline-block word" 
          key={index} 
          style={{ 
            willChange: 'opacity, filter',
            color: isSpecial ? '#ff0000' : 'inherit',
            fontWeight: isSpecial ? '900' : 'inherit',
            textShadow: isSpecial ? '0 0 15px rgba(255,0,0,0.3)' : 'none'
          }}
        >
          {word}
        </span>
      );
    });
  }, [children]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const scroller = scrollContainerRef?.current || window;
    ScrollTrigger.refresh();

    const ctx = gsap.context(() => {
      // 1. Rotazione del blocco
      gsap.fromTo(el, 
        { transformOrigin: 'center center', rotate: baseRotation }, 
        {
          ease: 'none',
          rotate: 0,
          scrollTrigger: {
            trigger: el,
            scroller,
            start: 'top 95%',
            end: rotationEnd,
            scrub: 0.5,
          }
        }
      );

      const wordElements = el.querySelectorAll('.word');

      // 2. Timeline per Opacità e Blur
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          scroller,
          start: `top ${startView}`, // Utilizzo della prop dinamica
          end: wordAnimationEnd,
          scrub: 0.8,
        }
      });

      tl.fromTo(wordElements, 
        { 
          opacity: baseOpacity, 
          filter: enableBlur ? `blur(${blurStrength}px)` : 'blur(0px)',
          y: 10 
        }, 
        {
          ease: 'none',
          opacity: 1,
          filter: 'blur(0px)',
          y: 0,
          stagger: 0.1,
        }
      );
    }, el);

    return () => {
      ctx.revert();
    };
  }, [scrollContainerRef, enableBlur, baseRotation, baseOpacity, rotationEnd, wordAnimationEnd, blurStrength, startView]);

  return (
    <div ref={containerRef} className={`my-10 w-full ${containerClassName}`}>
      <p 
        className={`text-[clamp(1.5rem,5vw,3.5rem)] text-center leading-[1.4] font-bold text-white ${textClassName}`}
        style={{ whiteSpace: 'pre-line' }} // Rispetta gli invii nel testo
      >
        {splitText}
      </p>
    </div>
  );
};

export default ScrollReveal;
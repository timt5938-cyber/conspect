import React, { useRef, useEffect, useMemo, useId } from 'react';

interface LiquidChromeLogoProps {
  text?: string;
  className?: string;
  subtitle?: string;
}

interface LetterPhysicsState {
  y: number;
  vy: number;
  rotX: number;
  vRotX: number;
  rotY: number;
  vRotY: number;
  rotZ: number;
  vRotZ: number;
  scale: number;
  vScale: number;
}

export const LiquidChromeLogo: React.FC<LiquidChromeLogoProps> = ({
  text = "КОНСПЕКТ",
  subtitle = "Студия реалистичных рукописных конспектов",
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const cachedCenters = useRef<{ x: number; y: number }[]>([]);

  const letters = useMemo(() => text.split(""), [text]);
  const letterCount = letters.length;

  const filterId = useId().replace(/:/g, '_') + '_liquid_chrome';
  const lightId = useId().replace(/:/g, '_') + '_point_light';
  const lightRef = useRef<SVGFEPointLightElement>(null);

  const mouse = useRef({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    currentX: 0,
    currentY: 0,
    isHovered: false,
    rect: { left: 0, top: 0, width: 1, height: 1 },
  });

  const physics = useRef<LetterPhysicsState[]>([]);

  if (physics.current.length !== letterCount) {
    physics.current = Array.from({ length: letterCount }, () => ({
      y: 0,
      vy: 0,
      rotX: 0,
      vRotX: 0,
      rotY: 0,
      vRotY: 0,
      rotZ: 0,
      vRotZ: 0,
      scale: 1,
      vScale: 0,
    }));
  }

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const measurePositions = () => {
      const containerRect = container.getBoundingClientRect();
      mouse.current.rect = containerRect;

      cachedCenters.current = letterRefs.current.map((el) => {
        if (!el) return { x: 0, y: 0 };
        const r = el.getBoundingClientRect();
        return {
          x: r.left + r.width / 2 - containerRect.left,
          y: r.top + r.height / 2 - containerRect.top,
        };
      });
    };

    measurePositions();
    window.addEventListener('resize', measurePositions);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = mouse.current.rect;
      mouse.current.x = e.clientX - rect.left;
      mouse.current.y = e.clientY - rect.top;

      const nx = (mouse.current.x / rect.width) * 2 - 1;
      const ny = (mouse.current.y / rect.height) * 2 - 1;
      mouse.current.targetX = Math.max(-1, Math.min(1, nx));
      mouse.current.targetY = Math.max(-1, Math.min(1, ny));
    };

    const handleMouseEnter = () => {
      mouse.current.isHovered = true;
    };

    const handleMouseLeave = () => {
      mouse.current.isHovered = false;
      mouse.current.targetX = 0;
      mouse.current.targetY = 0;
    };

    window.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);

    let rafId: number;

    const SPRING_K = 0.08;
    const DAMPING = 0.82;
    const DISP_SCALE = 18;
    const INFLUENCE_RADIUS_SQ = 240 * 240;

    const animate = () => {
      mouse.current.currentX += (mouse.current.targetX - mouse.current.currentX) * 0.1;
      mouse.current.currentY += (mouse.current.targetY - mouse.current.currentY) * 0.1;

      if (lightRef.current && mouse.current.isHovered) {
        const lx = mouse.current.x;
        const ly = mouse.current.y;
        lightRef.current.setAttribute('x', String(Math.round(lx)));
        lightRef.current.setAttribute('y', String(Math.round(ly)));
      }

      for (let i = 0; i < letterCount; i++) {
        const p = physics.current[i];
        const center = cachedCenters.current[i];
        const span = letterRefs.current[i];
        if (!center || !span) continue;

        let targetY = 0;
        let targetRotX = 0;
        let targetRotY = 0;
        let targetScale = 1;

        if (mouse.current.isHovered) {
          const dx = mouse.current.x - center.x;
          const dy = mouse.current.y - center.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < INFLUENCE_RADIUS_SQ) {
            const factor = 1 - Math.sqrt(distSq) / 240;
            const easeFactor = factor * factor * (3 - 2 * factor);

            targetY = -easeFactor * DISP_SCALE;
            targetRotY = (dx / 240) * 18 * easeFactor;
            targetRotX = -(dy / 240) * 18 * easeFactor;
            targetScale = 1 + easeFactor * 0.12;
          }
        }

        const forceY = (targetY - p.y) * SPRING_K;
        p.vy = (p.vy + forceY) * DAMPING;
        p.y += p.vy;

        const forceRotX = (targetRotX - p.rotX) * SPRING_K;
        p.vRotX = (p.vRotX + forceRotX) * DAMPING;
        p.rotX += p.vRotX;

        const forceRotY = (targetRotY - p.rotY) * SPRING_K;
        p.vRotY = (p.vRotY + forceRotY) * DAMPING;
        p.rotY += p.vRotY;

        const forceScale = (targetScale - p.scale) * SPRING_K;
        p.vScale = (p.vScale + forceScale) * DAMPING;
        p.scale += p.vScale;

        span.style.transform = `translate3d(0, ${p.y.toFixed(2)}px, 0) rotateX(${p.rotX.toFixed(2)}deg) rotateY(${p.rotY.toFixed(2)}deg) scale(${p.scale.toFixed(3)})`;
      }

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', measurePositions);
      window.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(rafId);
    };
  }, [letterCount]);

  return (
    <div
      ref={containerRef}
      className={`relative select-none flex flex-col items-center justify-center cursor-default py-4 sm:py-8 ${className}`}
      style={{ perspective: 1000 }}
    >
      {/* SVG Liquid Chrome Filter Definition */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.04 0.03" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" xChannelSelector="R" yChannelSelector="G" result="displaced" />
            <feGaussianBlur in="displaced" stdDeviation="0.8" result="blur" />
            <feSpecularLighting in="blur" surfaceScale="3" specularConstant="1.6" specularExponent="30" result="specular">
              <fePointLight ref={lightRef} x="300" y="50" z="180" />
            </feSpecularLighting>
            <feComposite in="specular" in2="displaced" operator="in" result="specular-composite" />
            <feMerge>
              <feMergeNode in="displaced" />
              <feMergeNode in="specular-composite" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      {/* Main Kinetic Letters Display */}
      <div 
        className="flex items-center justify-center tracking-widest sm:tracking-[0.25em] font-extrabold text-3xl min-[400px]:text-4xl sm:text-6xl md:text-7xl lg:text-8xl drop-shadow-[0_15px_35px_rgba(0,0,0,0.8)]"
        style={{ filter: `url(#${filterId})` }}
      >
        {letters.map((char, index) => (
          <span
            key={index}
            ref={(el) => (letterRefs.current[index] = el)}
            className="inline-block transition-colors duration-200 text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-400 font-black will-change-transform"
            style={{
              textShadow: '0 0 25px rgba(255,255,255,0.4), 0 2px 10px rgba(45,212,191,0.2)',
            }}
          >
            {char}
          </span>
        ))}
      </div>

      {/* Subtitle Badge */}
      {subtitle && (
        <div className="mt-4 sm:mt-6 px-4 py-1.5 rounded-full glass-pill border border-white/10 flex items-center gap-2 shadow-lg animate-float-1">
          <span className="w-2 h-2 rounded-full bg-[#2DD4BF] animate-ping" />
          <span className="font-mono text-xs sm:text-sm font-semibold tracking-wider text-slate-300">
            {subtitle}
          </span>
        </div>
      )}
    </div>
  );
};

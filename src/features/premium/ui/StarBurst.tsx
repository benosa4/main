import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { motion } from 'framer-motion';

type Particle = {
  id: string;
  x: number; // start x relative
  y: number; // start y relative
  size: number; // px
  angle: number; // deg
  dist: number; // px
  shape: 'dot' | 'cross' | 'star';
  duration: number; // ms
  delay: number; // ms
  rotation: number; // deg
  opacity: number; // 0.3..0.9
};

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function makeWave(count: number): Particle[] {
  return Array.from({ length: count }).map((_, i) => {
    const size = rand(2, 6);
    const angle = rand(-90, 270); // any direction
    const dist = rand(20, 60);
    const shapeRnd = Math.random();
    const shape: Particle['shape'] = shapeRnd < 0.5 ? 'dot' : shapeRnd < 0.8 ? 'cross' : 'star';
    return {
      id: `${Date.now()}-${i}-${Math.random().toString(36).slice(2)}`,
      x: rand(-80, 80),
      y: rand(-60, 60),
      size,
      angle,
      dist,
      shape,
      duration: rand(2000, 4000),
      delay: rand(0, 300),
      rotation: rand(-90, 90),
      opacity: rand(0.3, 0.9),
    };
  });
}

export interface StarBurstProps {
  className?: string;
  starSize?: number; // px for star icon (84..96)
}

export default function StarBurst({ className, starSize = 84 }: StarBurstProps) {
  const [parts, setParts] = useState<Particle[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    // initial wave
    setParts(makeWave(8));
    const tick = () => {
      setParts((prev) => {
        const aliveIds = new Set<string>();
        // Keep last 36 items max
        const next = prev.filter((p) => {
          // We don't track lifecycle timestamps; rely on CSS animations completing and remove by cap
          if (aliveIds.size < 36) {
            aliveIds.add(p.id);
            return true;
          }
          return false;
        });
        const wave = makeWave(Math.floor(rand(6, 8)));
        return [...next, ...wave].slice(-36);
      });
    };
    timerRef.current = window.setInterval(tick, 600) as unknown as number;
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const star = useMemo(() => (
    <motion.svg
      width={starSize}
      height={starSize}
      viewBox="0 0 100 100"
      aria-hidden
      className="select-none"
      animate={{ scale: [1, 1.06, 1], rotate: [-2, 2, -2] }}
      transition={{ duration: 2.8, ease: 'easeInOut', repeat: Infinity }}
    >
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6C5CE7" />
          <stop offset="60%" stopColor="#B06BF3" />
          <stop offset="100%" stopColor="#FF7AC8" />
        </linearGradient>
      </defs>
      <g filter="url(#glow)">
        <path
          d="M50 5 L60 40 L95 50 L60 60 L50 95 L40 60 L5 50 L40 40 Z"
          fill="url(#grad)"
          opacity="0.9"
        />
      </g>
    </motion.svg>
  ), [starSize]);

  return (
    <div className={className} style={{ position: 'relative', width: '100%', height: '100%' }} aria-hidden>
      <style>{`
        @keyframes starPulse {
          0% { transform: scale(1) rotate(-2deg); opacity: .85; }
          50% { transform: scale(1.06) rotate(2deg); opacity: 1; }
          100% { transform: scale(1) rotate(-2deg); opacity: .85; }
        }
        .star-pulse {
          animation: starPulse 2.8s ease-in-out infinite;
        }
        @keyframes sparkMove {
          0% { transform: translate(0,0) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: .6; }
          100% { transform: var(--to) rotate(var(--rot)); opacity: 0; }
        }
      `}</style>
      <div className="absolute inset-0 grid place-items-center">
        {star}
      </div>
      {/* particles area */}
      <div className="absolute inset-0 grid place-items-center">
        <div style={{ position: 'relative', width: 160, height: 120 }}>
          {parts.map((p) => {
            const dx = Math.cos((p.angle * Math.PI) / 180) * p.dist;
            const dy = Math.sin((p.angle * Math.PI) / 180) * p.dist;
            const base: CSSProperties = { position: 'absolute', left: 80 + p.x, top: 60 + p.y, width: p.size, height: p.size };
            return (
              <motion.div
                key={p.id}
                style={base}
                initial={{ opacity: 0, scale: 1, x: 0, y: 0 }}
                animate={{ opacity: [0, 1, 0], scale: [1, 1.05, 1], x: dx, y: -dy, rotate: p.rotation }}
                transition={{ duration: p.duration / 1000, ease: 'easeOut', delay: p.delay / 1000 }}
              >
                {p.shape === 'dot' ? (
                  <div style={{ width: '100%', height: '100%', borderRadius: '9999px', background: '#FF7AC8' }} />
                ) : p.shape === 'cross' ? (
                  <svg width={p.size} height={p.size} viewBox="0 0 10 10">
                    <path d="M1 5 H9 M5 1 V9" stroke="#6C5CE7" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg width={p.size} height={p.size} viewBox="0 0 10 10">
                    <path d="M5 0 L6 4 L10 5 L6 6 L5 10 L4 6 L0 5 L4 4 Z" fill="#B06BF3" />
                  </svg>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

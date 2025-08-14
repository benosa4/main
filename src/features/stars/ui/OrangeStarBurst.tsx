import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { motion } from 'framer-motion';

type Particle = {
  id: string;
  x: number;
  y: number;
  size: number;
  angle: number;
  dist: number;
  shape: 'dot' | 'cross' | 'star';
  duration: number;
  delay: number;
  rotation: number;
  opacity: number;
  color: string;
  scaleTo: number;
};

function rand(min: number, max: number) { return Math.random() * (max - min) + min; }

const COLORS = ['#FFC46B', '#FFD79A', '#FFA63D'];

function makeWave(count: number): Particle[] {
  return Array.from({ length: count }).map((_, i) => {
    const size = rand(2, 6);
    const angle = rand(-90, 270);
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
      color: COLORS[Math.floor(rand(0, COLORS.length))],
      scaleTo: rand(0.8, 1.1),
    };
  });
}

export default function OrangeStarBurst({ size = 96, intensity = 1, sparkles = true }: { size?: number; intensity?: number; sparkles?: boolean }) {
  const [parts, setParts] = useState<Particle[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!sparkles) return; // no particles
    setParts(makeWave(8));
    const tick = () => {
      setParts((prev) => {
        const wave = makeWave(Math.floor(rand(6, 8) * intensity));
        return [...prev.slice(-(36 - wave.length)), ...wave];
      });
    };
    timerRef.current = window.setInterval(tick, 600) as unknown as number;
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [intensity, sparkles]);

  const star = useMemo(() => (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      aria-hidden
      animate={{ scale: [1, 1.06, 1], rotate: [-2, 2, -2] }}
      transition={{ duration: 2.8, ease: 'easeInOut', repeat: Infinity }}
    >
      <defs>
        <filter id="oglow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="ograd" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFB64D">
            <animate attributeName="offset" values="0;0.2;0" dur="3.6s" repeatCount="indefinite" />
          </stop>
          <stop offset="100%" stopColor="#FF8A00" />
        </linearGradient>
      </defs>
      <g filter="url(#oglow)">
        <path d="M50 6 L61 40 L95 50 L61 60 L50 94 L39 60 L5 50 L39 40 Z" fill="url(#ograd)" />
        <circle cx="55" cy="35" r="10" fill="#FFE1A6" opacity="0.35" />
      </g>
    </motion.svg>
  ), [size]);

  return (
    <div className="relative w-full h-full" aria-hidden>
      <style>{`
        @keyframes oPulse {
          0% { transform: scale(1) rotate(-2deg); opacity: .85; }
          50% { transform: scale(1.06) rotate(2deg); opacity: 1; }
          100% { transform: scale(1) rotate(-2deg); opacity: .85; }
        }
        .o-star { animation: oPulse 2.8s ease-in-out infinite; }
        @keyframes oSpark {
          0% { transform: translate(0,0) scale(1); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: .7; }
          100% { transform: var(--to) scale(var(--s)); opacity: 0; }
        }
      `}</style>
      <div className="absolute inset-0 grid place-items-center">{star}</div>
      {sparkles && (
        <div className="absolute inset-0 grid place-items-center">
          <div style={{ position: 'relative', width: 160, height: 120 }}>
            {parts.map((p) => {
              const dx = Math.cos((p.angle * Math.PI) / 180) * p.dist;
              const dy = Math.sin((p.angle * Math.PI) / 180) * p.dist;
              const baseStyle: CSSProperties = { position: 'absolute', left: 80 + p.x, top: 60 + p.y, width: p.size, height: p.size, color: p.color };
              return (
                <motion.div
                  key={p.id}
                  style={baseStyle}
                  initial={{ opacity: 0, scale: 1, x: 0, y: 0 }}
                  animate={{ opacity: [0, 1, 0], scale: p.scaleTo, x: dx, y: -dy, rotate: p.rotation }}
                  transition={{ duration: p.duration / 1000, ease: 'easeOut', delay: p.delay / 1000 }}
                >
                  {p.shape === 'dot' ? (
                    <div style={{ width: '100%', height: '100%', borderRadius: 9999, background: p.color }} />
                  ) : p.shape === 'cross' ? (
                    <svg width={p.size} height={p.size} viewBox="0 0 10 10">
                      <path d="M1 5 H9 M5 1 V9" stroke={p.color} strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <svg width={p.size} height={p.size} viewBox="0 0 10 10">
                      <path d="M5 0 L6 4 L10 5 L6 6 L5 10 L4 6 L0 5 L4 4 Z" fill={p.color} />
                    </svg>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';

export interface AnimatedBadgeProps {
  text?: string;
  color?: string;
  href?: string;
  targetIconId?: string;
  onFlowComplete?: () => void;
  onFlowStart?: () => void;
}

function hexToRgba(hexColor: string, alpha: number): string {
  const hex = hexColor.replace('#', '');
  if (hex.length === 3) {
    const r = parseInt(hex[0] + hex[0], 16);
    const g = parseInt(hex[1] + hex[1], 16);
    const b = parseInt(hex[2] + hex[2], 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  if (hex.length === 6) {
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return hexColor;
}

const AnimatedBadge: React.FC<AnimatedBadgeProps> = ({
  text = 'Données en temps réel',
  color = '#0ea5e9',
  href,
  targetIconId = 'data-editor-nav',
  onFlowComplete,
  onFlowStart,
}) => {
  const badgeRef = useRef<HTMLDivElement>(null);
  const [flowPath, setFlowPath] = useState({ width: 120, height: 180 });
  const [animationPhase, setAnimationPhase] = useState<'idle' | 'flowing' | 'arrived'>('idle');
  const animationCycleRef = useRef<NodeJS.Timeout | null>(null);

  const calculatePath = useCallback(() => {
    if (!badgeRef.current) return;
    
    const badgeRect = badgeRef.current.getBoundingClientRect();
    const targetElement = document.getElementById(targetIconId);
    
    if (targetElement) {
      const targetRect = targetElement.getBoundingClientRect();
      const horizontalDistance = Math.max(50, targetRect.right - badgeRect.right + 40);
      const verticalDistance = Math.max(80, badgeRect.top - targetRect.bottom + 10);
      setFlowPath({ width: horizontalDistance, height: verticalDistance });
    }
  }, [targetIconId]);

  useEffect(() => {
    calculatePath();
    window.addEventListener('resize', calculatePath);
    window.addEventListener('scroll', calculatePath);
    
    const observer = new ResizeObserver(calculatePath);
    if (badgeRef.current) {
      observer.observe(badgeRef.current);
    }
    
    return () => {
      window.removeEventListener('resize', calculatePath);
      window.removeEventListener('scroll', calculatePath);
      observer.disconnect();
    };
  }, [calculatePath]);

  useEffect(() => {
    const runAnimationCycle = () => {
      setAnimationPhase('flowing');
      onFlowStart?.();

      setTimeout(() => {
        setAnimationPhase('arrived');
        onFlowComplete?.();
      }, 650);

      setTimeout(() => {
        setAnimationPhase('idle');
      }, 2150);
    };

    runAnimationCycle();
    animationCycleRef.current = setInterval(runAnimationCycle, 4000);

    return () => {
      if (animationCycleRef.current) {
        clearInterval(animationCycleRef.current);
      }
    };
  }, [onFlowComplete, onFlowStart]);

  const cornerRadius = 12;
  const pathD = `
    M 0 ${flowPath.height + cornerRadius}
    H ${flowPath.width - cornerRadius}
    Q ${flowPath.width} ${flowPath.height + cornerRadius} ${flowPath.width} ${flowPath.height}
    V 0
  `;

  const totalPathLength = flowPath.width + flowPath.height + cornerRadius * 1.5;

  const content = (
    <motion.div
      ref={badgeRef}
      initial={false}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.3, delay: 0.1, ease: 'easeInOut' }}
      viewport={{ once: true }}
      className="group relative flex max-w-fit items-center justify-center gap-3 rounded-full border border-neutral-200/80 bg-white/95 backdrop-blur-sm px-4 py-1.5 text-neutral-700 transition-all duration-300 dark:border-neutral-700/60 dark:bg-neutral-900/90 dark:text-zinc-300 shadow-sm hover:shadow-md"
    >
      <div
        className="pointer-events-none absolute overflow-visible"
        style={{
          right: '100%',
          bottom: '50%',
          width: flowPath.width + 20,
          height: flowPath.height + cornerRadius + 20,
        }}
        aria-hidden="true"
      >
        <svg
          className="absolute overflow-visible"
          style={{
            right: -10,
            bottom: -10,
            width: flowPath.width + 20,
            height: flowPath.height + cornerRadius + 20,
          }}
          viewBox={`-5 -5 ${flowPath.width + 15} ${flowPath.height + cornerRadius + 15}`}
          fill="none"
        >
          <defs>
            <linearGradient id="dataFlowGradient" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor={color} stopOpacity="0.2" />
              <stop offset="40%" stopColor={color} stopOpacity="0.6" />
              <stop offset="80%" stopColor={color} stopOpacity="0.9" />
              <stop offset="100%" stopColor={color} stopOpacity="1" />
            </linearGradient>
            <filter id="dataFlowGlow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="3" result="blur1" />
              <feGaussianBlur stdDeviation="6" result="blur2" />
              <feMerge>
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="particleGlow" x="-200%" y="-200%" width="500%" height="500%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <path
            d={pathD}
            stroke={color}
            strokeOpacity="0.08"
            strokeWidth="1"
            strokeLinecap="round"
            fill="none"
          />

          <path
            d={pathD}
            stroke="url(#dataFlowGradient)"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            filter="url(#dataFlowGlow)"
            style={{
              strokeDasharray: totalPathLength,
              strokeDashoffset: animationPhase === 'idle' ? totalPathLength : 0,
              transition: animationPhase === 'idle' 
                ? 'stroke-dashoffset 0ms' 
                : 'stroke-dashoffset 650ms cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />

          {animationPhase === 'arrived' && (
            <circle
              cx={flowPath.width}
              cy={0}
              r={5}
              fill={color}
              filter="url(#particleGlow)"
              className="animate-pulse-subtle"
            >
              <animate
                attributeName="r"
                values="4;7;4"
                dur="800ms"
                repeatCount="2"
              />
              <animate
                attributeName="opacity"
                values="1;0.7;1"
                dur="800ms"
                repeatCount="2"
              />
            </circle>
          )}
        </svg>
      </div>

      <div className="relative flex h-1.5 w-1.5 items-center justify-center rounded-full" style={{ backgroundColor: hexToRgba(color, 0.4) }}>
        <div 
          className="absolute h-3 w-3 animate-ping rounded-full"
          style={{ backgroundColor: hexToRgba(color, 0.4) }}
        />
        <div 
          className="absolute h-2 w-2 animate-ping rounded-full" 
          style={{ backgroundColor: hexToRgba(color, 0.6), animationDelay: '150ms' }}
        />
        <div
          className="absolute h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>

      <div className="mx-2 h-4 w-px bg-neutral-200 dark:bg-neutral-600/80" aria-hidden="true" />
      
      <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">{text}</span>
      
      <ChevronRight 
        className="ml-1 h-3.5 w-3.5 text-neutral-400 transition-transform duration-200 group-hover:translate-x-0.5 dark:text-neutral-500" 
        aria-hidden="true" 
      />
    </motion.div>
  );

  return (
    <>
      {href ? (
        <a href={href} className="inline-block" target="_blank" rel="noreferrer">
          {content}
        </a>
      ) : (
        content
      )}
      <style>
        {`
        @keyframes pulse-subtle {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.1);
          }
        }
        
        .animate-pulse-subtle {
          animation: pulse-subtle 800ms ease-in-out infinite;
        }
        `}
      </style>
    </>
  );
};

export default AnimatedBadge;

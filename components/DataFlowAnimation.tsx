import React, { useEffect, useState, useRef, useCallback } from 'react';

interface DataFlowAnimationProps {
  isActive?: boolean;
  onAnimationComplete?: () => void;
  onAnimationStart?: () => void;
  color?: string;
  duration?: number;
}

const DataFlowAnimation: React.FC<DataFlowAnimationProps> = ({
  isActive = true,
  onAnimationComplete,
  onAnimationStart,
  color = '#0ea5e9',
  duration = 650,
}) => {
  const [phase, setPhase] = useState<'idle' | 'horizontal' | 'vertical' | 'complete'>('idle');
  const [pathLength, setPathLength] = useState(0);
  const pathRef = useRef<SVGPathElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const updateDimensions = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDimensions({ width: rect.width, height: rect.height });
    }
  }, []);

  useEffect(() => {
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [updateDimensions]);

  useEffect(() => {
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength());
    }
  }, [dimensions]);

  useEffect(() => {
    if (!isActive) {
      setPhase('idle');
      return;
    }

    const runAnimation = () => {
      setPhase('idle');
      
      setTimeout(() => {
        onAnimationStart?.();
        setPhase('horizontal');
      }, 100);

      setTimeout(() => {
        setPhase('vertical');
      }, duration * 0.5);

      setTimeout(() => {
        setPhase('complete');
        onAnimationComplete?.();
      }, duration);

      setTimeout(() => {
        setPhase('idle');
      }, duration + 1500);
    };

    runAnimation();
    const interval = setInterval(runAnimation, duration + 3000);

    return () => {
      clearInterval(interval);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, duration, onAnimationComplete, onAnimationStart]);

  const horizontalLength = 60;
  const verticalLength = dimensions.height > 0 ? dimensions.height - 20 : 100;
  const cornerRadius = 8;

  const pathD = `
    M 0 ${verticalLength + cornerRadius}
    H ${horizontalLength - cornerRadius}
    Q ${horizontalLength} ${verticalLength + cornerRadius} ${horizontalLength} ${verticalLength}
    V 0
  `;

  const getStrokeDashoffset = () => {
    if (phase === 'idle') return pathLength;
    if (phase === 'horizontal') return pathLength * 0.6;
    if (phase === 'vertical' || phase === 'complete') return 0;
    return pathLength;
  };

  return (
    <div
      ref={containerRef}
      className="absolute pointer-events-none"
      style={{
        right: '100%',
        top: 0,
        bottom: 0,
        width: horizontalLength + 10,
        marginRight: -5,
      }}
    >
      <svg
        className="absolute w-full h-full overflow-visible"
        style={{ right: 0, top: 0 }}
        viewBox={`0 0 ${horizontalLength + 10} ${verticalLength + cornerRadius + 10}`}
        preserveAspectRatio="xMaxYMax meet"
      >
        <defs>
          <linearGradient id="flowGradient" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="50%" stopColor={color} stopOpacity="0.8" />
            <stop offset="100%" stopColor={color} stopOpacity="1" />
          </linearGradient>
          <filter id="flowGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="flowGlowStrong" x="-100%" y="-100%" width="300%" height="300%">
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
          fill="none"
          stroke={color}
          strokeOpacity="0.1"
          strokeWidth="1"
          strokeLinecap="round"
        />

        <path
          ref={pathRef}
          d={pathD}
          fill="none"
          stroke="url(#flowGradient)"
          strokeWidth="2"
          strokeLinecap="round"
          filter="url(#flowGlow)"
          style={{
            strokeDasharray: pathLength,
            strokeDashoffset: getStrokeDashoffset(),
            transition: `stroke-dashoffset ${duration * 0.5}ms cubic-bezier(0.4, 0, 0.2, 1)`,
          }}
        />

        {(phase === 'vertical' || phase === 'complete') && (
          <circle
            cx={horizontalLength}
            cy={4}
            r={phase === 'complete' ? 4 : 3}
            fill={color}
            filter="url(#flowGlowStrong)"
            style={{
              opacity: phase === 'complete' ? 1 : 0.8,
              transition: 'all 200ms ease-out',
            }}
          >
            <animate
              attributeName="r"
              values="3;5;3"
              dur="600ms"
              repeatCount="2"
            />
            <animate
              attributeName="opacity"
              values="0.8;1;0.8"
              dur="600ms"
              repeatCount="2"
            />
          </circle>
        )}
      </svg>
    </div>
  );
};

export default DataFlowAnimation;

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface DataFlowAnimationProps {
  isActive?: boolean;
  duration?: number;
  delay?: number;
}

const DataFlowAnimation: React.FC<DataFlowAnimationProps> = ({ 
  isActive = true,
  duration = 1.6,
  delay = 3
}) => {
  const [showAnimation, setShowAnimation] = useState(false);
  const [highlightEditor, setHighlightEditor] = useState(false);
  const [pathDimensions, setPathDimensions] = useState({ startX: 0, startY: 0, endX: 0, endY: 0 });
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cycleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isActive) return;

    const calculatePath = () => {
      const badge = document.querySelector('[data-flow-source="realtime-badge"]');
      const editorButton = document.querySelector('[data-flow-target="editor-nav"]');
      
      if (!badge || !editorButton) return;

      const badgeRect = badge.getBoundingClientRect();
      const editorRect = editorButton.getBoundingClientRect();

      const startX = badgeRect.right + 8;
      const startY = badgeRect.top + badgeRect.height / 2;
      const endX = editorRect.left + editorRect.width / 2;
      const endY = editorRect.top + editorRect.height / 2;

      setPathDimensions({ startX, startY, endX, endY });
    };

    const runCycle = () => {
      calculatePath();
      setShowAnimation(true);
      setHighlightEditor(false);

      animationTimeoutRef.current = setTimeout(() => {
        setHighlightEditor(true);
        
        setTimeout(() => {
          setShowAnimation(false);
          setHighlightEditor(false);
        }, 700);
      }, duration * 1000 - 100);

      cycleTimeoutRef.current = setTimeout(() => {
        runCycle();
      }, (duration + delay) * 1000);
    };

    const initialTimeout = setTimeout(() => {
      runCycle();
    }, 1500);

    window.addEventListener('resize', calculatePath);

    return () => {
      clearTimeout(initialTimeout);
      if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
      if (cycleTimeoutRef.current) clearTimeout(cycleTimeoutRef.current);
      window.removeEventListener('resize', calculatePath);
    };
  }, [isActive, duration, delay]);

  useEffect(() => {
    const editorButton = document.querySelector('[data-flow-target="editor-nav"]');
    if (!editorButton) return;

    if (highlightEditor) {
      editorButton.classList.add('data-flow-highlight');
    } else {
      editorButton.classList.remove('data-flow-highlight');
    }
  }, [highlightEditor]);

  const { startX, startY, endX, endY } = pathDimensions;
  
  const horizontalDistance = Math.min(120, Math.max(60, (endX - startX) * 0.25));
  const midX = startX + horizontalDistance;

  const pathD = `
    M ${startX} ${startY}
    L ${midX} ${startY}
    Q ${midX + 5} ${startY - 5} ${midX} ${startY - 10}
    L ${midX} ${endY + 10}
    Q ${midX} ${endY + 5} ${endX - 10} ${endY}
    L ${endX} ${endY}
  `;

  return (
    <>
      <AnimatePresence>
        {showAnimation && (
          <svg
            className="fixed inset-0 w-full h-full pointer-events-none z-50"
            style={{ mixBlendMode: 'normal' }}
          >
            <defs>
              <linearGradient id="data-flow-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(14, 165, 233, 0)" />
                <stop offset="20%" stopColor="rgba(56, 189, 248, 0.3)" />
                <stop offset="45%" stopColor="rgba(14, 165, 233, 0.9)" />
                <stop offset="55%" stopColor="rgba(14, 165, 233, 1)" />
                <stop offset="75%" stopColor="rgba(56, 189, 248, 0.5)" />
                <stop offset="100%" stopColor="rgba(125, 211, 252, 0)" />
              </linearGradient>
              
              <filter id="data-flow-glow">
                <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              <filter id="data-flow-glow-strong">
                <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              <radialGradient id="particle-gradient">
                <stop offset="0%" stopColor="rgba(14, 165, 233, 1)" />
                <stop offset="50%" stopColor="rgba(56, 189, 248, 0.6)" />
                <stop offset="100%" stopColor="rgba(125, 211, 252, 0)" />
              </radialGradient>
            </defs>

            <motion.path
              d={pathD}
              stroke="rgba(14, 165, 233, 0.15)"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.3, 0.3, 0] }}
              exit={{ opacity: 0 }}
              transition={{
                duration: duration,
                times: [0, 0.15, 0.85, 1],
                ease: "easeInOut"
              }}
            />

            <motion.path
              d={pathD}
              stroke="url(#data-flow-gradient)"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
              filter="url(#data-flow-glow)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ 
                pathLength: 1,
                opacity: [0, 1, 1, 0.6]
              }}
              exit={{ opacity: 0 }}
              transition={{
                pathLength: { 
                  duration: duration * 0.88,
                  ease: [0.45, 0.05, 0.15, 0.95]
                },
                opacity: { 
                  duration: duration * 0.92,
                  times: [0, 0.12, 0.8, 1],
                  ease: "easeOut"
                }
              }}
            />

            {[...Array(3)].map((_, i) => (
              <motion.circle
                key={`particle-${i}`}
                r="2.5"
                fill="url(#particle-gradient)"
                filter="url(#data-flow-glow-strong)"
                initial={{ 
                  offsetDistance: '0%',
                  scale: 0,
                  opacity: 0
                }}
                animate={{
                  offsetDistance: '100%',
                  scale: [0, 1.2, 1, 0.8, 0],
                  opacity: [0, 0.8, 1, 0.6, 0]
                }}
                transition={{
                  duration: duration * 0.9,
                  delay: i * 0.15,
                  ease: [0.45, 0.05, 0.15, 0.95]
                }}
                style={{
                  offsetPath: `path('${pathD}')`,
                  offsetRotate: '0deg'
                }}
              />
            ))}

            <motion.circle
              cx={endX}
              cy={endY}
              r="6"
              fill="rgba(14, 165, 233, 0.2)"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: [0, 1.8, 0],
                opacity: [0, 0.6, 0]
              }}
              transition={{
                duration: 0.6,
                delay: duration * 0.88,
                ease: [0.34, 1.56, 0.64, 1]
              }}
            />

            <motion.circle
              cx={endX}
              cy={endY}
              r="3.5"
              fill="#0ea5e9"
              filter="url(#data-flow-glow-strong)"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: [0, 1.3, 1, 0],
                opacity: [0, 1, 1, 0]
              }}
              transition={{
                duration: 0.7,
                delay: duration * 0.88,
                ease: "easeOut"
              }}
            />
          </svg>
        )}
      </AnimatePresence>

      <style>{`
        [data-flow-target="editor-nav"] {
          position: relative;
          transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
          will-change: transform, filter;
        }

        [data-flow-target="editor-nav"].data-flow-highlight {
          color: #0ea5e9 !important;
          transform: scale(1.035);
          filter: 
            drop-shadow(0 0 8px rgba(14, 165, 233, 0.35)) 
            drop-shadow(0 0 16px rgba(14, 165, 233, 0.2))
            drop-shadow(0 0 24px rgba(14, 165, 233, 0.1));
        }

        [data-flow-target="editor-nav"].data-flow-highlight svg {
          color: #0ea5e9 !important;
          filter: drop-shadow(0 0 4px rgba(14, 165, 233, 0.4));
        }

        [data-flow-target="editor-nav"].data-flow-highlight::before {
          content: '';
          position: absolute;
          inset: -8px;
          border-radius: 12px;
          background: radial-gradient(circle at center, rgba(14, 165, 233, 0.15), transparent 70%);
          pointer-events: none;
          animation: data-flow-pulse 0.6s ease-out;
        }

        @keyframes data-flow-pulse {
          0% {
            transform: scale(0.8);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: scale(1.2);
            opacity: 0;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          [data-flow-target="editor-nav"] {
            transition: color 0.3s ease !important;
          }
          [data-flow-target="editor-nav"].data-flow-highlight {
            transform: none !important;
            filter: none !important;
          }
          [data-flow-target="editor-nav"].data-flow-highlight::before {
            display: none;
          }
        }

        @media (max-width: 768px) {
          [data-flow-target="editor-nav"].data-flow-highlight {
            transform: scale(1.02);
          }
        }
      `}</style>
    </>
  );
};

export default DataFlowAnimation;

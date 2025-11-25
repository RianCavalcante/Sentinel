import React from 'react';
import { motion, MotionStyle, Transition } from 'framer-motion';

type BorderBeamProps = {
  children?: React.ReactNode;
  className?: string;
  beamClassName?: string;
  size?: number;
  delay?: number;
  duration?: number;
  colorFrom?: string;
  colorTo?: string;
  transition?: Transition;
  style?: React.CSSProperties;
  reverse?: boolean;
  initialOffset?: number;
  borderWidth?: number;
};

/**
 * Border beam animado com offset-path (mais suave/sutil que o conic-spin anterior).
 */
export const BorderBeam: React.FC<BorderBeamProps> = ({
  children,
  className,
  beamClassName,
  size = 50,
  delay = 0,
  duration = 6,
  colorFrom = '#ffaa40',
  colorTo = '#9c40ff',
  transition,
  style,
  reverse = false,
  initialOffset = 0,
  borderWidth = 1,
}) => {
  const clampedInitial = Math.max(0, Math.min(100, initialOffset));
  const containerStyle: React.CSSProperties = {
    ['--border-beam-width' as string]: `${borderWidth}px`,
  };

  const beamStyle: MotionStyle = {
    width: size,
    offsetPath: `rect(0 auto auto 0 round ${size}px)`,
    ['--color-from' as string]: colorFrom,
    ['--color-to' as string]: colorTo,
    ...style,
  };

  return (
    <div className={`relative rounded-3xl ${className ?? ''}`}>
      <div
        className="pointer-events-none absolute inset-0 rounded-[inherit] border-[length:var(--border-beam-width)] border-transparent [mask-image:linear-gradient(transparent,transparent),linear-gradient(#000,#000)] [mask-composite:intersect] [mask-clip:padding-box,border-box]"
        style={containerStyle}
      >
        <motion.div
          className={[
            'absolute aspect-square',
            'bg-gradient-to-l from-[var(--color-from)] via-[var(--color-to)] to-transparent',
            beamClassName,
          ]
            .filter(Boolean)
            .join(' ')}
          style={beamStyle}
          initial={{ offsetDistance: `${clampedInitial}%` }}
          animate={{
            offsetDistance: reverse
              ? [`${100 - clampedInitial}%`, `${-clampedInitial}%`]
              : [`${clampedInitial}%`, `${100 + clampedInitial}%`],
          }}
          transition={{
            repeat: Infinity,
            ease: 'linear',
            duration,
            delay: -delay,
            ...transition,
          }}
        />
      </div>

      {children && <div className="relative z-10 rounded-[inherit]">{children}</div>}
    </div>
  );
};

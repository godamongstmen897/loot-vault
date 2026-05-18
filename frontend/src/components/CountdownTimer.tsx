'use client';

import { useCountdown } from '../hooks/useCountdown';

interface CountdownTimerProps {
  /** End time as Unix timestamp in milliseconds */
  endTime: number;
  /** Optional start time for calculating full progress ring */
  startTime?: number;
  /** Ring diameter in pixels (default 200) */
  size?: number;
  /** Ring stroke width in pixels (default 8) */
  strokeWidth?: number;
  /** Label shown above the countdown */
  label?: string;
}

export default function CountdownTimer({
  endTime,
  startTime,
  size = 200,
  strokeWidth = 8,
  label = 'NEXT DRAW',
}: CountdownTimerProps) {
  const { formatted, isUrgent, isFinished, progress } = useCountdown(endTime, startTime);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  // Glow intensity scales up during final 10 seconds
  const glowIntensity = isUrgent ? 20 + 15 * Math.sin(Date.now() / 200) : 8;
  // Pick ring color: cyan normally, amber-ish during urgency
  const ringColor = isUrgent ? '#FFD700' : isFinished ? '#FF0066' : '#00D9FF';

  return (
    <div
      className="inline-flex flex-col items-center gap-3 select-none"
      role="timer"
      aria-label={`Countdown: ${formatted}`}
      aria-live="polite"
    >
      {label && (
        <span className="text-xs tracking-[0.3em] text-cyan-400/70 uppercase font-mono">
          {label}
        </span>
      )}

      <div className="relative" style={{ width: size, height: size }}>
        {/* Glow backdrop */}
        <div
          className="absolute inset-0 rounded-full transition-shadow duration-500"
          style={{
            boxShadow: `0 0 ${glowIntensity}px ${ringColor}66, inset 0 0 ${glowIntensity / 2}px ${ringColor}33`,
          }}
        />

        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="relative z-10 -rotate-90"
          aria-hidden="true"
        >
          {/* Background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#1a1a2e"
            strokeWidth={strokeWidth}
          />
          {/* Progress ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={ringColor}
            strokeWidth={strokeWidth}
            strokeLinecap="square"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="transition-[stroke-dashoffset] duration-1000 ease-linear"
            style={{
              filter: `drop-shadow(0 0 4px ${ringColor})`,
            }}
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
          <span
            className="font-mono font-bold text-white tabular-nums"
            style={{
              fontSize: size * 0.16,
              textShadow: `0 0 10px ${ringColor}`,
            }}
          >
            {isFinished ? 'DRAWING...' : formatted}
          </span>
        </div>
      </div>

      {/* Urgency indicator */}
      {isUrgent && !isFinished && (
        <span className="text-xs font-mono text-yellow-400 animate-pulse tracking-wider">
          ⚡ FINAL COUNTDOWN ⚡
        </span>
      )}

      {isFinished && (
        <span className="text-xs font-mono text-pink-400 animate-pulse tracking-wider">
          Winner selection in progress...
        </span>
      )}
    </div>
  );
}

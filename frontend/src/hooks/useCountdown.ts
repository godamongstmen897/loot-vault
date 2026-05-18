import { useState, useEffect, useRef, useCallback } from 'react';

export interface CountdownResult {
  /** Remaining time in milliseconds */
  remaining: number;
  /** Formatted string "HH:MM:SS" */
  formatted: string;
  /** Whether we're in the final 10 seconds */
  isUrgent: boolean;
  /** Whether the countdown has finished */
  isFinished: boolean;
  /** Progress as a fraction 0..1 (1 = full time left, 0 = done) */
  progress: number;
}

function formatTime(ms: number): string {
  if (ms <= 0) return '00:00:00';
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':');
}

/**
 * Custom hook that counts down to a given Unix timestamp (ms).
 * Updates every second. Memoizes the interval to avoid unnecessary re-renders.
 */
export function useCountdown(endTime: number, startTime?: number): CountdownResult {
  const computeRemaining = useCallback(() => {
    return Math.max(0, endTime - Date.now());
  }, [endTime]);

  const [remaining, setRemaining] = useState<number>(computeRemaining);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setRemaining(computeRemaining());

    intervalRef.current = setInterval(() => {
      const left = computeRemaining();
      setRemaining(left);
      if (left <= 0 && intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [computeRemaining]);

  const totalDuration = startTime ? endTime - startTime : endTime - Date.now();
  const progress = totalDuration > 0 ? Math.min(1, remaining / totalDuration) : 0;
  const isUrgent = remaining > 0 && remaining <= 10000;
  const isFinished = remaining <= 0;

  return {
    remaining,
    formatted: formatTime(remaining),
    isUrgent,
    isFinished,
    progress,
  };
}

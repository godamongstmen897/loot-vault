'use client';

import CountdownTimer from '../components/CountdownTimer';

export default function Home() {
  // Demo: draw ends in 2 hours, 34 minutes from now
  const now = Date.now();
  const endTime = now + (2 * 3600 + 34 * 60) * 1000;
  const startTime = now;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-12 p-8">
      <h1 className="text-2xl font-mono tracking-widest text-cyan-400/80 uppercase">
        Loot Vault
      </h1>

      <CountdownTimer
        endTime={endTime}
        startTime={startTime}
        size={240}
        strokeWidth={10}
      />

      <div className="flex flex-wrap justify-center gap-8 mt-8">
        {/* Small variant */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs text-gray-500 font-mono">Small (mobile)</span>
          <CountdownTimer
            endTime={endTime}
            startTime={startTime}
            size={140}
            strokeWidth={6}
          />
        </div>

        {/* Urgent demo: ends in 8 seconds */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs text-gray-500 font-mono">Urgent (8s left)</span>
          <CountdownTimer
            endTime={Date.now() + 8000}
            startTime={Date.now() - 2000}
            size={140}
            strokeWidth={6}
            label="ENDING SOON"
          />
        </div>

        {/* Finished demo */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs text-gray-500 font-mono">Finished</span>
          <CountdownTimer
            endTime={Date.now() - 5000}
            startTime={Date.now() - 60000}
            size={140}
            strokeWidth={6}
            label="COMPLETED"
          />
        </div>
      </div>

      <p className="text-xs text-gray-600 font-mono mt-4">
        Countdown timer demo — props: endTime, startTime, size, strokeWidth, label
      </p>
    </main>
  );
}

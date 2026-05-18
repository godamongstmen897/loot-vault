'use client';

import '../../styles/glitchEffects.css';

const effects = [
  { name: '.glitch', className: 'glitch', desc: 'Looping color shift + horizontal displacement' },
  { name: '.glitch--once', className: 'glitch--once', desc: 'One-shot glitch, plays once on mount' },
  { name: '.scan-lines', className: 'scan-lines', desc: 'Horizontal scan-line overlay scrolling down' },
  { name: '.screen-flicker', className: 'screen-flicker', desc: 'Subtle opacity flicker (300ms loop)' },
  { name: '.screen-flicker--heavy', className: 'screen-flicker--heavy', desc: 'Heavier opacity variation' },
  { name: '.distort', className: 'distort', desc: 'Looping skew / perspective warp' },
  { name: '.distort--once', className: 'distort--once', desc: 'One-shot perspective distortion' },
];

export default function DemoGlitch() {
  return (
    <main className="min-h-screen bg-[#0a0a12] text-gray-100 p-8 font-mono">
      <h1 className="text-xl text-cyan-400 tracking-widest mb-2 uppercase">
        Glitch Effects Demo
      </h1>
      <p className="text-sm text-gray-500 mb-10">
        CSS-only effects for the LitRPG visual language. All animations use @keyframes, no JavaScript.
      </p>

      <div className="grid gap-8 max-w-2xl">
        {effects.map(({ name, className, desc }) => (
          <div
            key={name}
            className="border border-cyan-900/40 p-6 bg-[#0d0d1a]"
          >
            <div className="text-xs text-gray-500 mb-1">{name}</div>
            <div className="text-xs text-gray-600 mb-4">{desc}</div>

            {/* Applied to text */}
            <div className={`text-2xl text-white mb-3 ${className}`}>
              SYSTEM ONLINE
            </div>

            {/* Applied to a box */}
            <div
              className={`inline-block w-40 h-16 border border-cyan-600/50 flex items-center justify-center text-sm text-cyan-300 ${className}`}
            >
              [ BOX ]
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-700 mt-12">
        Source: frontend/src/styles/glitchEffects.css
      </p>
    </main>
  );
}

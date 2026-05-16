import type { CSSProperties } from "react";

type EffectStyle = CSSProperties & Record<`--${string}`, string>;

const effectTiles = [
  {
    title: "Glitch",
    className: "glitch effect-high",
    style: { "--glitch-duration": "420ms" } as EffectStyle,
  },
  {
    title: "Scan Lines",
    className: "scan-lines",
    style: { "--scan-line-opacity": "0.24" } as EffectStyle,
  },
  {
    title: "Screen Flicker",
    className: "screen-flicker",
    style: { "--flicker-duration": "360ms" } as EffectStyle,
  },
  {
    title: "Distort",
    className: "distort",
    style: { "--distort-angle": "1.2deg" } as EffectStyle,
  },
];

const performanceCells = Array.from({ length: 12 }, (_, index) => index + 1);

export default function DemoGlitchPage() {
  return (
    <main className="min-h-screen bg-black px-5 py-10 text-white sm:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="space-y-4 border-b border-cyan-400/40 pb-6">
          <p className="text-sm uppercase text-cyan-300">Loot Vault UI Effects</p>
          <h1
            className="glitch text-4xl font-black uppercase text-white sm:text-6xl"
            data-glitch="System Startup"
          >
            System Startup
          </h1>
          <p className="max-w-2xl text-base leading-7 text-zinc-300">
            Reusable CSS utility classes for subtle LitRPG glitch, scan-line, flicker, and distortion effects.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          {effectTiles.map((effect) => (
            <article
              key={effect.title}
              className={`${effect.className} border border-cyan-400/45 bg-zinc-950 p-6 shadow-[0_0_28px_rgba(34,211,238,0.16)]`}
              style={effect.style}
            >
              <p className="mb-2 text-xs uppercase text-cyan-300">Effect Module</p>
              <h2 className="mb-4 text-2xl font-bold" data-glitch={effect.title}>
                {effect.title}
              </h2>
              <div className="h-24 border border-fuchsia-400/35 bg-black/60 p-4 text-sm text-zinc-300">
                Vault panel preview with pure CSS animation, no JavaScript timers, and no layout shift.
              </div>
            </article>
          ))}
        </section>

        <section className="scan-lines border border-zinc-700 bg-zinc-950 p-6">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase text-fuchsia-300">Performance Strip</p>
              <h2 className="text-2xl font-bold">Multiple animated elements</h2>
            </div>
            <button className="glitch-once border border-cyan-300 px-4 py-2 text-sm font-semibold text-cyan-100 hover:bg-cyan-400 hover:text-black">
              Boot Sequence
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {performanceCells.map((cell) => (
              <div
                key={cell}
                className="screen-flicker border border-cyan-400/35 bg-black p-4 text-center font-mono text-sm text-cyan-100"
                style={{ "--flicker-duration": `${320 + cell * 8}ms` } as EffectStyle}
              >
                NODE {String(cell).padStart(2, "0")}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

"use client";

import { useState } from "react";
import { Modal } from "@/src/components/Modal";

export default function ModalDemoPage() {
  const [activeModal, setActiveModal] = useState<"claim" | "job" | null>(null);

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-10">
        <div className="max-w-3xl">
          <p className="mb-3 font-mono text-sm uppercase tracking-[0.18em] text-cyan-300">
            Loot Vault UI
          </p>
          <h1 className="text-4xl font-semibold tracking-tight">
            Animated modal system
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
            Reusable modal primitives for wallet connection, job details, yield
            claims, confirmations, and error states.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <article className="border border-cyan-400/30 bg-slate-900/70 p-6 shadow-[0_0_32px_rgb(34_211_238_/_0.08)]">
            <h2 className="text-xl font-semibold text-cyan-200">
              Yield claim confirmation
            </h2>
            <p className="mt-3 min-h-20 text-sm leading-6 text-slate-300">
              Confirms an irreversible claim action with a compact summary and
              strong visual focus.
            </p>
            <button
              className="mt-6 h-11 rounded-full border border-cyan-300/50 bg-cyan-300 px-5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
              type="button"
              onClick={() => setActiveModal("claim")}
            >
              Open confirmation
            </button>
          </article>

          <article className="border border-rose-400/30 bg-slate-900/70 p-6 shadow-[0_0_32px_rgb(244_63_94_/_0.08)]">
            <h2 className="text-xl font-semibold text-rose-200">
              Mercenary job details
            </h2>
            <p className="mt-3 min-h-20 text-sm leading-6 text-slate-300">
              Shows a larger information state for job escrow, milestones, and
              participant requirements.
            </p>
            <button
              className="mt-6 h-11 rounded-full border border-rose-300/50 bg-rose-400 px-5 text-sm font-semibold text-slate-950 transition hover:bg-rose-300"
              type="button"
              onClick={() => setActiveModal("job")}
            >
              Open job details
            </button>
          </article>
        </div>
      </section>

      <Modal
        open={activeModal === "claim"}
        title="Confirm yield claim"
        onClose={() => setActiveModal(null)}
      >
        <div className="space-y-5 text-sm leading-6 text-slate-300">
          <p>
            Claiming moves the pending yield from the current pool draw to your
            connected Stellar wallet.
          </p>
          <dl className="grid grid-cols-2 gap-3 rounded-xl border border-cyan-300/20 bg-cyan-300/5 p-4">
            <dt className="text-slate-400">Pool</dt>
            <dd className="text-right font-medium text-slate-100">XLM Prime</dd>
            <dt className="text-slate-400">Yield</dt>
            <dd className="text-right font-medium text-cyan-200">42.8 XLM</dd>
          </dl>
          <button
            className="h-11 w-full rounded-full bg-cyan-300 font-semibold text-slate-950 transition hover:bg-cyan-200"
            type="button"
            onClick={() => setActiveModal(null)}
          >
            Confirm claim
          </button>
        </div>
      </Modal>

      <Modal
        open={activeModal === "job"}
        title="Mercenary contract"
        variant="danger"
        onClose={() => setActiveModal(null)}
      >
        <div className="space-y-4 text-sm leading-6 text-slate-300">
          <p>
            Review escrow scope before accepting. The modal supports arbitrary
            content through children, so the same shell can wrap forms, alerts,
            or long detail panels.
          </p>
          <ul className="space-y-2 rounded-xl border border-rose-300/20 bg-rose-300/5 p-4">
            <li>Milestone escrow: 1,200 XLM</li>
            <li>Dispute window: 72 hours</li>
            <li>Required reputation: Level 4</li>
          </ul>
        </div>
      </Modal>
    </main>
  );
}

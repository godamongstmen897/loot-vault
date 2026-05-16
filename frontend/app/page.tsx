"use client";

import { useState } from "react";
import { QuestBoardTable } from "./components/QuestBoardTable";
import { JobDetailModal } from "./components/JobDetailModal";
import type { Job } from "./types";

export default function Home() {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  return (
    <div className="min-h-screen bg-black text-zinc-100">
      <header className="border-b border-zinc-800 px-6 py-4">
        <h1 className="text-2xl font-bold tracking-tight">
          <span className="text-[#00e5ff]">⟐</span> Quest Board
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Active mercenary jobs — sort, filter, and claim your next contract.
        </p>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <QuestBoardTable onRowClick={setSelectedJob} />
      </main>

      <JobDetailModal
        job={selectedJob}
        onClose={() => setSelectedJob(null)}
      />
    </div>
  );
}

"use client";

import { useQuestBoard } from "../hooks/useQuestBoard";
import { StatusBadge } from "./StatusBadge";
import type { Job, JobStatus, SortConfig } from "../types";

interface QuestBoardTableProps {
  jobs?: Job[];
  onRowClick?: (job: Job) => void;
}

const STATUS_OPTIONS: (JobStatus | "All")[] = [
  "All",
  "Open",
  "In Progress",
  "Completed",
  "Disputed",
];

function SortIndicator({
  column,
  sortConfig,
}: {
  column: SortConfig["key"];
  sortConfig: SortConfig;
}) {
  if (sortConfig.key !== column) {
    return <span className="ml-1 text-zinc-600">⇅</span>;
  }
  return (
    <span className="ml-1 text-[#00e5ff]">
      {sortConfig.direction === "asc" ? "↑" : "↓"}
    </span>
  );
}

export function QuestBoardTable({ jobs, onRowClick }: QuestBoardTableProps) {
  const {
    jobs: paginatedJobs,
    allFilteredCount,
    sortConfig,
    toggleSort,
    statusFilter,
    setStatusFilter,
    currentPage,
    totalPages,
    setPage,
  } = useQuestBoard(jobs);

  return (
    <section
      aria-label="Quest Board"
      className="w-full"
    >
      {/* Filter pills */}
      <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Filter by status">
        {STATUS_OPTIONS.map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`border px-3 py-1 text-xs font-bold uppercase tracking-wider transition-all ${
              statusFilter === status
                ? "border-[#00e5ff] text-[#00e5ff] shadow-[0_0_8px_#00e5ff44]"
                : "border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:text-zinc-300"
            }`}
            aria-pressed={statusFilter === status}
          >
            {status}
          </button>
        ))}
        <span className="ml-auto self-center text-xs text-zinc-500">
          {allFilteredCount} quest{allFilteredCount !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto border border-zinc-800">
        <table className="w-full text-left text-sm" role="grid">
          <thead>
            <tr className="border-b border-zinc-800 bg-black/40 text-xs uppercase tracking-widest text-zinc-400">
              <th className="px-4 py-3">Quest</th>
              <th className="px-4 py-3">Client</th>
              <th>
                <button
                  onClick={() => toggleSort("bounty")}
                  className="flex items-center px-4 py-3 text-xs uppercase tracking-widest text-zinc-400 hover:text-[#00e5ff] transition-colors"
                  aria-label="Sort by bounty"
                >
                  Bounty
                  <SortIndicator column="bounty" sortConfig={sortConfig} />
                </button>
              </th>
              <th>
                <button
                  onClick={() => toggleSort("deadline")}
                  className="flex items-center px-4 py-3 text-xs uppercase tracking-widest text-zinc-400 hover:text-[#00e5ff] transition-colors"
                  aria-label="Sort by deadline"
                >
                  Deadline
                  <SortIndicator column="deadline" sortConfig={sortConfig} />
                </button>
              </th>
              <th>
                <button
                  onClick={() => toggleSort("status")}
                  className="flex items-center px-4 py-3 text-xs uppercase tracking-widest text-zinc-400 hover:text-[#00e5ff] transition-colors"
                  aria-label="Sort by status"
                >
                  Status
                  <SortIndicator column="status" sortConfig={sortConfig} />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedJobs.map((job) => (
              <tr
                key={job.id}
                tabIndex={0}
                onClick={() => onRowClick?.(job)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onRowClick?.(job);
                  }
                }}
                className="group cursor-pointer border-b border-zinc-800/60 transition-all hover:bg-[#00e5ff08] hover:shadow-[0_0_12px_#00e5ff22] hover:scale-[1.003] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00e5ff]"
                role="row"
                aria-label={`${job.title} — ${job.client} — $${job.bounty.toLocaleString()} — ${job.status}`}
              >
                <td className="px-4 py-3 font-medium text-zinc-100">
                  {job.title}
                </td>
                <td className="px-4 py-3 text-zinc-400">{job.client}</td>
                <td className="px-4 py-3 font-mono text-[#76ff03]">
                  ${job.bounty.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-zinc-300">
                  {new Date(job.deadline).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={job.status} />
                </td>
              </tr>
            ))}
            {paginatedJobs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                  No quests found matching this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile card view */}
      <div className="flex flex-col gap-3 md:hidden">
        {paginatedJobs.map((job) => (
          <button
            key={job.id}
            onClick={() => onRowClick?.(job)}
            className="group border border-zinc-800 p-4 text-left transition-all hover:border-[#00e5ff44] hover:shadow-[0_0_10px_#00e5ff22] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00e5ff]"
            aria-label={`${job.title} — ${job.client} — $${job.bounty.toLocaleString()} — ${job.status}`}
          >
            <div className="mb-2 flex items-start justify-between gap-2">
              <h3 className="font-medium text-zinc-100">{job.title}</h3>
              <StatusBadge status={job.status} />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-400">{job.client}</span>
              <span className="font-mono text-[#76ff03]">
                ${job.bounty.toLocaleString()}
              </span>
            </div>
            <div className="mt-1 text-xs text-zinc-500">
              Due{" "}
              {new Date(job.deadline).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </div>
          </button>
        ))}
        {paginatedJobs.length === 0 && (
          <p className="py-8 text-center text-zinc-500">
            No quests found matching this filter.
          </p>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2" role="navigation" aria-label="Pagination">
          <button
            onClick={() => setPage(currentPage - 1)}
            disabled={currentPage <= 1}
            className="border border-zinc-700 px-3 py-1 text-xs text-zinc-400 transition-colors hover:border-[#00e5ff] hover:text-[#00e5ff] disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Previous page"
          >
            ← Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setPage(page)}
              className={`border px-3 py-1 text-xs transition-all ${
                currentPage === page
                  ? "border-[#00e5ff] text-[#00e5ff] shadow-[0_0_8px_#00e5ff44]"
                  : "border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:text-zinc-300"
              }`}
              aria-current={currentPage === page ? "page" : undefined}
              aria-label={`Page ${page}`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="border border-zinc-700 px-3 py-1 text-xs text-zinc-400 transition-colors hover:border-[#00e5ff] hover:text-[#00e5ff] disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Next page"
          >
            Next →
          </button>
        </div>
      )}
    </section>
  );
}

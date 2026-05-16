"use client";

import { useEffect, useCallback } from "react";
import type { Job } from "../types";
import { StatusBadge } from "./StatusBadge";

interface JobDetailModalProps {
  job: Job | null;
  onClose: () => void;
}

export function JobDetailModal({ job, onClose }: JobDetailModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (job) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [job, handleKeyDown]);

  if (!job) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Quest details: ${job.title}`}
    >
      <div
        className="relative mx-4 w-full max-w-lg border border-zinc-700 bg-zinc-900 p-6 shadow-[0_0_24px_#00e5ff22]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 border border-zinc-700 px-2 py-0.5 text-xs text-zinc-500 transition-colors hover:border-[#e040fb] hover:text-[#e040fb]"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Header */}
        <h2 className="mb-1 text-xl font-bold text-zinc-100">{job.title}</h2>
        <div className="mb-4 flex items-center gap-3">
          <span className="text-sm text-zinc-400">{job.client}</span>
          <StatusBadge status={job.status} />
        </div>

        {/* Bounty */}
        <div className="mb-4 border-l-2 border-[#76ff03] pl-3">
          <span className="text-xs uppercase tracking-widest text-zinc-500">
            Bounty
          </span>
          <p className="font-mono text-2xl text-[#76ff03]">
            ${job.bounty.toLocaleString()}
          </p>
        </div>

        {/* Description */}
        {job.description && (
          <p className="mb-4 text-sm leading-relaxed text-zinc-300">
            {job.description}
          </p>
        )}

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-xs uppercase tracking-widest text-zinc-500">
              Deadline
            </span>
            <p className="text-zinc-200">
              {new Date(job.deadline).toLocaleDateString("en-US", {
                weekday: "short",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
          {job.tags && job.tags.length > 0 && (
            <div>
              <span className="text-xs uppercase tracking-widest text-zinc-500">
                Tags
              </span>
              <div className="mt-1 flex flex-wrap gap-1">
                {job.tags.map((tag) => (
                  <span
                    key={tag}
                    className="border border-zinc-700 px-2 py-0.5 text-xs text-zinc-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

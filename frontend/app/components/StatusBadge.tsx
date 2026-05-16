import type { JobStatus } from "../types";

const STATUS_STYLES: Record<JobStatus, string> = {
  Open: "text-[#00e5ff] border-[#00e5ff] shadow-[0_0_6px_#00e5ff66]",
  Completed: "text-[#76ff03] border-[#76ff03] shadow-[0_0_6px_#76ff0366]",
  Disputed: "text-[#e040fb] border-[#e040fb] shadow-[0_0_6px_#e040fb66]",
  "In Progress": "text-[#ffab00] border-[#ffab00] shadow-[0_0_6px_#ffab0066]",
};

interface StatusBadgeProps {
  status: JobStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-block border px-2 py-0.5 text-xs font-bold uppercase tracking-wider ${STATUS_STYLES[status]}`}
      role="status"
      aria-label={`Status: ${status}`}
    >
      {status}
    </span>
  );
}

export type JobStatus = "Open" | "In Progress" | "Completed" | "Disputed";

export interface Job {
  id: string;
  title: string;
  client: string;
  bounty: number;
  status: JobStatus;
  deadline: string; // ISO date string
  description?: string;
  tags?: string[];
}

export type SortDirection = "asc" | "desc";

export interface SortConfig {
  key: keyof Pick<Job, "bounty" | "deadline" | "status">;
  direction: SortDirection;
}

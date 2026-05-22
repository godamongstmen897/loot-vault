export type JobStatus = 'Open' | 'In Progress' | 'Completed' | 'Disputed';

export interface Job {
  id: string;
  title: string;
  client: string;
  bounty: number;
  status: JobStatus;
  deadline: string;
}

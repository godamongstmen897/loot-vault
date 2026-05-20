"use client";

import { useState, useCallback, useMemo } from "react";
import type { Job, JobStatus, SortConfig, SortDirection } from "../types";

// Mock data for development
const MOCK_JOBS: Job[] = [
  {
    id: "1",
    title: "Build Authentication Module",
    client: "CyberCorp",
    bounty: 2500,
    status: "Open",
    deadline: "2026-06-15T00:00:00Z",
    description: "Implement OAuth2 + 2FA authentication flow for the mercenary portal.",
    tags: ["security", "backend"],
  },
  {
    id: "2",
    title: "Design Dashboard UI",
    client: "NeonLabs",
    bounty: 1800,
    status: "In Progress",
    deadline: "2026-06-10T00:00:00Z",
    description: "Create a LitRPG-styled dashboard with real-time stats.",
    tags: ["frontend", "design"],
  },
  {
    id: "3",
    title: "Fix Payment Gateway Bug",
    client: "ByteForge",
    bounty: 500,
    status: "Completed",
    deadline: "2026-05-20T00:00:00Z",
    description: "Resolve timeout issues in the escrow payment system.",
    tags: ["bugfix", "payments"],
  },
  {
    id: "4",
    title: "Implement Chat System",
    client: "GhostNet",
    bounty: 3200,
    status: "Open",
    deadline: "2026-07-01T00:00:00Z",
    description: "Real-time encrypted messaging between clients and freelancers.",
    tags: ["fullstack", "websocket"],
  },
  {
    id: "5",
    title: "Optimize Database Queries",
    client: "DataStream",
    bounty: 900,
    status: "Disputed",
    deadline: "2026-05-30T00:00:00Z",
    description: "Performance tuning for the quest search index.",
    tags: ["backend", "database"],
  },
  {
    id: "6",
    title: "Mobile App Landing Page",
    client: "PixelDrift",
    bounty: 1200,
    status: "Open",
    deadline: "2026-06-20T00:00:00Z",
    description: "Responsive landing page with animated hero section.",
    tags: ["frontend", "mobile"],
  },
  {
    id: "7",
    title: "API Rate Limiter",
    client: "VaultTech",
    bounty: 750,
    status: "In Progress",
    deadline: "2026-06-05T00:00:00Z",
    description: "Token bucket rate limiter middleware for the public API.",
    tags: ["backend", "security"],
  },
  {
    id: "8",
    title: "Write Integration Tests",
    client: "IronClad",
    bounty: 600,
    status: "Open",
    deadline: "2026-06-25T00:00:00Z",
    description: "End-to-end test suite covering escrow creation and resolution.",
    tags: ["testing", "qa"],
  },
  {
    id: "9",
    title: "Deploy Kubernetes Cluster",
    client: "CloudNine",
    bounty: 4000,
    status: "Open",
    deadline: "2026-07-15T00:00:00Z",
    description: "Set up production K8s cluster with auto-scaling and monitoring.",
    tags: ["devops", "infrastructure"],
  },
  {
    id: "10",
    title: "Refactor Legacy Payment Module",
    client: "OldGuard",
    bounty: 1100,
    status: "Disputed",
    deadline: "2026-06-08T00:00:00Z",
    description: "Migrate from callback-based payment processing to async/await.",
    tags: ["refactor", "payments"],
  },
  {
    id: "11",
    title: "Build Notification Service",
    client: "SignalPoint",
    bounty: 2000,
    status: "Open",
    deadline: "2026-06-18T00:00:00Z",
    description: "Push notification microservice with email and SMS channels.",
    tags: ["backend", "microservices"],
  },
  {
    id: "12",
    title: "Create Onboarding Flow",
    client: "NeonLabs",
    bounty: 1400,
    status: "In Progress",
    deadline: "2026-06-12T00:00:00Z",
    description: "Multi-step onboarding wizard for new mercenaries.",
    tags: ["frontend", "ux"],
  },
  {
    id: "13",
    title: "Audit Smart Contracts",
    client: "VaultTech",
    bounty: 5500,
    status: "Open",
    deadline: "2026-07-20T00:00:00Z",
    description: "Security audit of all escrow and payment smart contracts.",
    tags: ["security", "blockchain"],
  },
];

const ROWS_PER_PAGE = 10;

export function useQuestBoard(initialJobs?: Job[]) {
  const jobs = initialJobs ?? MOCK_JOBS;
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "deadline",
    direction: "asc",
  });
  const [statusFilter, setStatusFilter] = useState<JobStatus | "All">("All");
  const [currentPage, setCurrentPage] = useState(1);

  const toggleSort = useCallback(
    (key: SortConfig["key"]) => {
      setSortConfig((prev) => {
        if (prev.key === key) {
          const direction: SortDirection =
            prev.direction === "asc" ? "desc" : "asc";
          return { key, direction };
        }
        return { key, direction: "asc" };
      });
      setCurrentPage(1);
    },
    []
  );

  const filtered = useMemo(() => {
    if (statusFilter === "All") return jobs;
    return jobs.filter((job) => job.status === statusFilter);
  }, [jobs, statusFilter]);

  const sorted = useMemo(() => {
    const sorted = [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortConfig.key === "bounty") {
        cmp = a.bounty - b.bounty;
      } else if (sortConfig.key === "deadline") {
        cmp =
          new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      } else if (sortConfig.key === "status") {
        const order: Record<JobStatus, number> = {
          Open: 0,
          "In Progress": 1,
          Completed: 2,
          Disputed: 3,
        };
        cmp = order[a.status] - order[b.status];
      }
      return sortConfig.direction === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [filtered, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / ROWS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);

  const paginated = useMemo(() => {
    const start = (safePage - 1) * ROWS_PER_PAGE;
    return sorted.slice(start, start + ROWS_PER_PAGE);
  }, [sorted, safePage]);

  return {
    jobs: paginated,
    allFilteredCount: sorted.length,
    sortConfig,
    toggleSort,
    statusFilter,
    setStatusFilter: (s: JobStatus | "All") => {
      setStatusFilter(s);
      setCurrentPage(1);
    },
    currentPage: safePage,
    totalPages,
    setPage: setCurrentPage,
  };
}

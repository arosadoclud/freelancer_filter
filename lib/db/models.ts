export type ProjectStatus = "new" | "applied" | "discarded";

export interface StoredProject {
  /** Freelancer.com project id — used as the dedupe key */
  freelancerId: number;
  seoUrl: string;
  title: string;
  description: string;
  currencyCode: string;
  budgetMin?: number;
  budgetMax?: number;
  isHourly: boolean;
  bidCount: number;
  submitDate: string; // ISO timestamp of the original posting
  ownerId: number;
  employerRating?: number;
  employerPaymentVerified: boolean;
  skills: string[];

  score: number;
  scoreBreakdown: Record<string, number>;

  proposalDraft?: string;
  status: ProjectStatus;

  firstSeenAt: string; // ISO timestamp, when we first ingested it
  updatedAt: string;
}

export const PROJECTS_COLLECTION = "projects";

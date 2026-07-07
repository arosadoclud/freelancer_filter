export interface FreelancerJob {
  id: number;
  name: string;
  seo_url: string;
}

export interface FreelancerBudget {
  minimum: number;
  maximum: number | null;
}

export interface FreelancerBidStats {
  bid_count: number;
  bid_avg: number | null;
}

export interface FreelancerUserReputation {
  entire_history?: {
    overall?: number; // 0-5 rating
    reviews?: number;
  };
}

export interface FreelancerUserStatus {
  payment_verified?: boolean;
}

export interface FreelancerUser {
  id: number;
  username?: string;
  reputation?: FreelancerUserReputation;
  employer_reputation?: FreelancerUserReputation;
  status?: FreelancerUserStatus;
}

export interface FreelancerProject {
  id: number;
  owner_id: number | null;
  title: string;
  seo_url: string;
  description: string;
  currency: { code: string };
  type: "fixed" | "hourly";
  budget: FreelancerBudget;
  bid_stats: FreelancerBidStats;
  submitdate: number; // unix seconds
  time_submitted: number; // unix seconds
  jobs: FreelancerJob[];
  frontend_project_status: string;
}

export interface FreelancerActiveProjectsResponse {
  status: "success" | "error";
  result: {
    projects: FreelancerProject[];
    users?: Record<string, FreelancerUser>;
    total_count: number;
  };
}

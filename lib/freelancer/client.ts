import { FreelancerActiveProjectsResponse, FreelancerProject, FreelancerUser } from "./types";

const API_BASE = "https://www.freelancer.com/api";

function getAccessToken(): string {
  const token = process.env.FREELANCER_ACCESS_TOKEN;
  if (!token) {
    throw new Error("Missing FREELANCER_ACCESS_TOKEN environment variable");
  }
  return token;
}

export interface FetchActiveProjectsOptions {
  limit?: number;
  offset?: number;
  /** Only projects submitted after this unix timestamp (seconds) */
  fromTimeSubmitted?: number;
}

export interface ActiveProjectsResult {
  projects: FreelancerProject[];
  users: Record<string, FreelancerUser>;
  totalCount: number;
}

export async function fetchActiveProjects(
  options: FetchActiveProjectsOptions = {}
): Promise<ActiveProjectsResult> {
  const { limit = 50, offset = 0, fromTimeSubmitted } = options;

  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
    full_description: "true",
    job_details: "true",
    user_details: "true",
    "project_types[]": "fixed",
    compact: "false",
  });
  params.append("project_types[]", "hourly");
  if (fromTimeSubmitted) {
    params.set("from_time", String(fromTimeSubmitted));
  }

  const response = await fetch(
    `${API_BASE}/projects/0.1/projects/active/?${params.toString()}`,
    {
      headers: {
        "Freelancer-OAuth-V1": getAccessToken(),
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      `Freelancer API request failed: ${response.status} ${response.statusText}`
    );
  }

  const data = (await response.json()) as FreelancerActiveProjectsResponse;

  if (data.status !== "success") {
    throw new Error("Freelancer API returned an error response");
  }

  return {
    projects: data.result.projects ?? [],
    users: data.result.users ?? {},
    totalCount: data.result.total_count ?? 0,
  };
}

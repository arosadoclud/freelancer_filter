import { FreelancerProject, FreelancerUser } from "../freelancer/types";
import { SKILL_KEYWORDS } from "./profile";

export interface ScoringOptions {
  /** Minimum budget in USD (applies to fixed budget.minimum or hourly rate) */
  minBudgetUsd: number;
}

export interface ScoreResult {
  score: number; // 0-100
  breakdown: Record<string, number>;
  passesBudgetFloor: boolean;
}

const WEIGHTS = {
  keywordMatch: 35,
  budget: 20,
  competition: 20,
  clientQuality: 15,
  recency: 10,
};

function scoreKeywordMatch(project: FreelancerProject): number {
  const haystack = [
    project.title,
    project.description,
    ...project.jobs.map((j) => j.name),
  ]
    .join(" ")
    .toLowerCase();

  const coreHits = SKILL_KEYWORDS.core.filter((kw) => haystack.includes(kw)).length;
  const generalHits = SKILL_KEYWORDS.general.filter((kw) =>
    haystack.includes(kw)
  ).length;

  // Core (niche DBA/ERP) skills are worth 2x a general web-dev skill.
  const raw = coreHits * 2 + generalHits;
  const maxRaw = SKILL_KEYWORDS.core.length * 2 + SKILL_KEYWORDS.general.length;

  return Math.min(1, raw / Math.min(maxRaw, 8)) * WEIGHTS.keywordMatch;
}

/** Approximate USD value regardless of currency/rate type, using currency code as a rough proxy. */
function budgetInUsd(project: FreelancerProject): number {
  const amount = project.budget.maximum ?? project.budget.minimum;
  if (project.currency.code === "USD") return amount;
  // Without live FX rates we treat non-USD budgets conservatively.
  return amount * 0.85;
}

function scoreBudget(project: FreelancerProject, minBudgetUsd: number): number {
  const usd = budgetInUsd(project);
  if (usd < minBudgetUsd) return 0;
  // Scale up to 3x the floor for full marks, cap at 1.
  const ratio = Math.min(1, (usd - minBudgetUsd) / (minBudgetUsd * 2));
  return (0.5 + 0.5 * ratio) * WEIGHTS.budget;
}

function scoreCompetition(project: FreelancerProject): number {
  const bids = project.bid_stats?.bid_count ?? 0;
  if (bids <= 5) return WEIGHTS.competition;
  if (bids >= 50) return 0;
  return WEIGHTS.competition * (1 - bids / 50);
}

function scoreClientQuality(owner: FreelancerUser | undefined): number {
  if (!owner) return WEIGHTS.clientQuality * 0.4; // unknown client, neutral-low

  const rating = owner.employer_reputation?.entire_history?.overall ?? 0;
  const verified = owner.status?.payment_verified ?? false;

  const ratingScore = Math.min(1, rating / 5) * 0.7;
  const verifiedScore = verified ? 0.3 : 0;

  return (ratingScore + verifiedScore) * WEIGHTS.clientQuality;
}

function scoreRecency(project: FreelancerProject): number {
  const ageHours = (Date.now() / 1000 - project.time_submitted) / 3600;
  if (ageHours <= 1) return WEIGHTS.recency;
  if (ageHours >= 48) return 0;
  return WEIGHTS.recency * (1 - ageHours / 48);
}

export function scoreProject(
  project: FreelancerProject,
  owner: FreelancerUser | undefined,
  options: ScoringOptions
): ScoreResult {
  const keywordMatch = scoreKeywordMatch(project);
  const budget = scoreBudget(project, options.minBudgetUsd);
  const competition = scoreCompetition(project);
  const clientQuality = scoreClientQuality(owner);
  const recency = scoreRecency(project);

  const usd = budgetInUsd(project);

  return {
    score: Math.round(keywordMatch + budget + competition + clientQuality + recency),
    breakdown: {
      keywordMatch: Math.round(keywordMatch),
      budget: Math.round(budget),
      competition: Math.round(competition),
      clientQuality: Math.round(clientQuality),
      recency: Math.round(recency),
    },
    passesBudgetFloor: usd >= options.minBudgetUsd,
  };
}

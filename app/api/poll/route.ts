import { NextRequest, NextResponse } from "next/server";
import { fetchActiveProjects } from "@/lib/freelancer/client";
import { scoreProject } from "@/lib/scoring/score";
import { generateProposalDraft } from "@/lib/gemini/generateProposal";
import { hasSeenProject, upsertProject } from "@/lib/db/projects";
import { StoredProject } from "@/lib/db/models";

export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const minBudgetUsd = Number(process.env.MIN_BUDGET_USD ?? "100");
  const minScoreThreshold = Number(process.env.MIN_SCORE_THRESHOLD ?? "60");

  const { projects, users } = await fetchActiveProjects({ limit: 50 });

  let processed = 0;
  let saved = 0;

  for (const project of projects) {
    if (await hasSeenProject(project.id)) continue;
    processed++;

    const owner = project.owner_id ? users[String(project.owner_id)] : undefined;
    const { score, breakdown, passesBudgetFloor } = scoreProject(project, owner, {
      minBudgetUsd,
    });

    if (!passesBudgetFloor || score < minScoreThreshold) {
      const skipped: StoredProject = {
        freelancerId: project.id,
        seoUrl: project.seo_url,
        title: project.title,
        description: project.description,
        currencyCode: project.currency.code,
        budgetMin: project.budget.minimum,
        budgetMax: project.budget.maximum ?? undefined,
        isHourly: project.type === "hourly",
        bidCount: project.bid_stats?.bid_count ?? 0,
        submitDate: new Date(project.time_submitted * 1000).toISOString(),
        ownerId: project.owner_id ?? 0,
        employerRating: owner?.employer_reputation?.entire_history?.overall,
        employerPaymentVerified: owner?.status?.payment_verified ?? false,
        skills: project.jobs.map((j) => j.name),
        score,
        scoreBreakdown: breakdown,
        status: "discarded",
        firstSeenAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await upsertProject(skipped);
      continue;
    }

    const proposalDraft = await generateProposalDraft(project);

    const stored: StoredProject = {
      freelancerId: project.id,
      seoUrl: project.seo_url,
      title: project.title,
      description: project.description,
      currencyCode: project.currency.code,
      budgetMin: project.budget.minimum,
      budgetMax: project.budget.maximum ?? undefined,
      isHourly: project.type === "hourly",
      bidCount: project.bid_stats?.bid_count ?? 0,
      submitDate: new Date(project.time_submitted * 1000).toISOString(),
      ownerId: project.owner_id ?? 0,
      employerRating: owner?.employer_reputation?.entire_history?.overall,
      employerPaymentVerified: owner?.status?.payment_verified ?? false,
      skills: project.jobs.map((j) => j.name),
      score,
      scoreBreakdown: breakdown,
      proposalDraft,
      status: "new",
      firstSeenAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await upsertProject(stored);
    saved++;
  }

  return NextResponse.json({ processed, saved });
}

import { NextRequest, NextResponse } from "next/server";
import { updateProjectDraft, updateProjectStatus } from "@/lib/db/projects";
import { StoredProject } from "@/lib/db/models";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const freelancerId = Number(id);
  const body = await request.json();

  if (typeof body.status === "string") {
    await updateProjectStatus(freelancerId, body.status as StoredProject["status"]);
  }

  if (typeof body.proposalDraft === "string") {
    await updateProjectDraft(freelancerId, body.proposalDraft);
  }

  return NextResponse.json({ ok: true });
}

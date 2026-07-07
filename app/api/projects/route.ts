import { NextRequest, NextResponse } from "next/server";
import { listProjects } from "@/lib/db/projects";
import { StoredProject } from "@/lib/db/models";

export async function GET(request: NextRequest) {
  const status = request.nextUrl.searchParams.get("status") as
    | StoredProject["status"]
    | null;

  const projects = await listProjects(status ?? "new");
  return NextResponse.json(
    projects.map(({ _id, ...rest }) => rest)
  );
}

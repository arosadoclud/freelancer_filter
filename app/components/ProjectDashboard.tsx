"use client";

import { useEffect, useState } from "react";
import { StoredProject } from "@/lib/db/models";

export default function ProjectDashboard() {
  const [projects, setProjects] = useState<StoredProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState<Record<number, string>>({});

  async function load() {
    setLoading(true);
    const res = await fetch("/api/projects?status=new");
    const data: StoredProject[] = await res.json();
    setProjects(data);
    setDrafts(
      Object.fromEntries(data.map((p) => [p.freelancerId, p.proposalDraft ?? ""]))
    );
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(freelancerId: number, status: "applied" | "discarded") {
    await fetch(`/api/projects/${freelancerId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setProjects((prev) => prev.filter((p) => p.freelancerId !== freelancerId));
  }

  async function saveDraft(freelancerId: number) {
    await fetch(`/api/projects/${freelancerId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ proposalDraft: drafts[freelancerId] }),
    });
  }

  if (loading) return <p className="p-8 text-gray-500">Cargando proyectos...</p>;

  if (projects.length === 0) {
    return <p className="p-8 text-gray-500">No hay proyectos nuevos por revisar.</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Proyectos por revisar</h1>
      {projects.map((project) => (
        <div key={project.freelancerId} className="border rounded-lg p-4 space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <a
                href={`https://www.freelancer.com/projects/${project.seoUrl}`}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-lg hover:underline"
              >
                {project.title}
              </a>
              <p className="text-sm text-gray-500">
                {project.currencyCode} {project.budgetMin}-{project.budgetMax ?? "?"}{" "}
                {project.isHourly ? "/hora" : "fijo"} &middot; {project.bidCount} propuestas
                &middot; rating {project.employerRating ?? "N/A"}
                {project.employerPaymentVerified ? " (pago verificado)" : ""}
              </p>
            </div>
            <span className="text-sm font-semibold bg-gray-100 text-gray-900 rounded px-2 py-1">
              Score: {project.score}
            </span>
          </div>

          <p className="text-sm text-gray-700 line-clamp-3">{project.description}</p>

          <textarea
            className="w-full border rounded p-2 text-sm"
            rows={6}
            value={drafts[project.freelancerId] ?? ""}
            onChange={(e) =>
              setDrafts((prev) => ({ ...prev, [project.freelancerId]: e.target.value }))
            }
            onBlur={() => saveDraft(project.freelancerId)}
          />

          <div className="flex gap-2">
            <button
              onClick={() => updateStatus(project.freelancerId, "applied")}
              className="bg-green-600 text-white text-sm px-3 py-1.5 rounded hover:bg-green-700"
            >
              Marcar como aplicado
            </button>
            <button
              onClick={() => updateStatus(project.freelancerId, "discarded")}
              className="bg-gray-200 text-gray-900 text-sm px-3 py-1.5 rounded hover:bg-gray-300"
            >
              Descartar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

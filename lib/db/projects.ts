import { getDb } from "./mongodb";
import { PROJECTS_COLLECTION, StoredProject } from "./models";

export async function getProjectsCollection() {
  const db = await getDb();
  const collection = db.collection<StoredProject>(PROJECTS_COLLECTION);
  await collection.createIndex({ freelancerId: 1 }, { unique: true });
  return collection;
}

export async function hasSeenProject(freelancerId: number): Promise<boolean> {
  const collection = await getProjectsCollection();
  const existing = await collection.findOne(
    { freelancerId },
    { projection: { _id: 1 } }
  );
  return existing !== null;
}

export async function upsertProject(project: StoredProject): Promise<void> {
  const collection = await getProjectsCollection();
  await collection.updateOne(
    { freelancerId: project.freelancerId },
    { $set: project },
    { upsert: true }
  );
}

export async function listProjects(status?: StoredProject["status"]) {
  const collection = await getProjectsCollection();
  const filter = status ? { status } : {};
  return collection.find(filter).sort({ score: -1, firstSeenAt: -1 }).toArray();
}

export async function updateProjectStatus(
  freelancerId: number,
  status: StoredProject["status"]
) {
  const collection = await getProjectsCollection();
  await collection.updateOne(
    { freelancerId },
    { $set: { status, updatedAt: new Date().toISOString() } }
  );
}

export async function updateProjectDraft(
  freelancerId: number,
  proposalDraft: string
) {
  const collection = await getProjectsCollection();
  await collection.updateOne(
    { freelancerId },
    { $set: { proposalDraft, updatedAt: new Date().toISOString() } }
  );
}

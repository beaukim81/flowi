import { db } from "./db";

const tables = ["childProfiles", "settings", "avatars", "emotions", "needs", "calmStrategies", "parentPhrases", "emotionHistory", "tasks", "taskTemplates", "dailyPlans", "taskCompletions", "rewards", "practiceExercises", "practiceProgress", "backupMetadata"] as const;

export async function exportBackup() {
  const data: Record<string, unknown[]> = {};
  for (const tableName of tables) {
    data[tableName] = await db.table(tableName).toArray();
  }
  const exportedAt = new Date().toISOString();
  await db.backupMetadata.put({ id: "backup", lastBackupAt: exportedAt });
  return { app: "Flowi", version: 1, exportedAt, data };
}

export async function importBackup(payload: unknown) {
  if (!payload || typeof payload !== "object" || (payload as { app?: string }).app !== "Flowi" || !(payload as { data?: unknown }).data) {
    throw new Error("Dit lijkt geen Flowi-backup.");
  }
  const data = (payload as { data: Record<string, unknown[]> }).data;
  await db.transaction("rw", tables.map((tableName) => db.table(tableName)), async () => {
    for (const tableName of tables) {
      await db.table(tableName).clear();
      if (Array.isArray(data[tableName])) await db.table(tableName).bulkPut(data[tableName]);
    }
  });
}

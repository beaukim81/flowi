import Dexie, { type Table } from "dexie";
import type { Avatar, BackupMetadata, CalmStrategy, ChildProfile, DailyPlan, Emotion, EmotionHistoryEntry, Need, PracticeExercise, Reward, Settings, Task, TaskCompletion, TaskTemplate } from "../types/schema";

export class FlowiDatabase extends Dexie {
  childProfiles!: Table<ChildProfile, string>;
  settings!: Table<Settings, string>;
  avatars!: Table<Avatar, string>;
  emotions!: Table<Emotion, string>;
  needs!: Table<Need, string>;
  calmStrategies!: Table<CalmStrategy, string>;
  parentPhrases!: Table<{ id: string; text: string }, string>;
  emotionHistory!: Table<EmotionHistoryEntry, string>;
  tasks!: Table<Task, string>;
  taskTemplates!: Table<TaskTemplate, string>;
  dailyPlans!: Table<DailyPlan, string>;
  taskCompletions!: Table<TaskCompletion, string>;
  rewards!: Table<Reward, string>;
  practiceExercises!: Table<PracticeExercise, string>;
  practiceProgress!: Table<{ id: string; exerciseId: string; completedAt: string }, string>;
  backupMetadata!: Table<BackupMetadata, string>;

  constructor() {
    super("FlowiDB");
    this.version(1).stores({
      childProfiles: "id",
      settings: "id",
      avatars: "id",
      emotions: "id",
      needs: "id",
      calmStrategies: "id, *linkedEmotionTypes, *linkedNeedTypes",
      parentPhrases: "id",
      emotionHistory: "id, childProfileId, createdAt",
      tasks: "id, childProfileId, dayPart, isEnabled, sortOrder",
      taskTemplates: "id, ageGroup, category",
      dailyPlans: "id, childProfileId, date",
      taskCompletions: "id, childProfileId, taskId, date",
      rewards: "id, childProfileId, earnedAt",
      practiceExercises: "id, category",
      practiceProgress: "id, exerciseId, completedAt",
      backupMetadata: "id"
    });
  }
}

export const db = new FlowiDatabase();

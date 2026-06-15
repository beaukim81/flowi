import { avatarAssets } from "../data/avatars";
import { calmStrategies } from "../data/calmStrategies";
import { emotions } from "../data/emotions";
import { needs } from "../data/needs";
import { parentPhrases } from "../data/parentPhrases";
import { practiceExercises } from "../data/practiceExercises";
import { taskTemplates } from "../data/taskTemplates";
import type { ChildProfile, Settings, Task } from "../types/schema";
import { db } from "./db";

const id = () => crypto.randomUUID();
const now = () => new Date().toISOString();

export async function seedDatabase() {
  const settingsCount = await db.settings.count();
  if (settingsCount > 0) return;

  const profile: ChildProfile = {
    id: "default-child",
    name: "Flowi vriend",
    age: 7,
    selectedAvatarId: "giraffe",
    theme: "zacht",
    caregiverLabel: "ouder",
    visibleEmotionTypes: emotions.map((emotion) => emotion.id),
    visibleNeedTypes: needs.map((need) => need.id),
    safePlaceName: "rustige plek",
    createdAt: now(),
    updatedAt: now()
  };

  const settings: Settings = {
    id: "app",
    selectedTheme: "zacht",
    reducedMotion: false,
    soundEnabled: false,
    onboardingSeen: false,
    timeOptionalEnabled: true,
    rewardsEnabled: true,
    backupReminderEnabled: true
  };

  const defaultTasks: Task[] = [
    ["Aankleden", "👕", "ochtend", ["Pak je kleren.", "Trek je broek aan.", "Trek je shirt aan.", "Sokken aan.", "Klaar."]],
    ["Ontbijten", "🥣", "ochtend", ["Ga aan tafel.", "Neem een hap.", "Neem een slok.", "Klaar."]],
    ["Tandenpoetsen", "🪥", "ochtend", ["Pak je tandenborstel.", "Tandpasta erop.", "Poets boven en onder.", "Spoel.", "Klaar."]],
    ["Tas pakken", "🎒", "ochtend", ["Pak je tas.", "Doe je spullen erin.", "Zet hem klaar."]],
    ["Jas ophangen", "🧥", "naSchool", ["Doe je jas uit.", "Hang hem op.", "Goed gedaan."]],
    ["Even rust", "🍃", "naSchool", ["Kies een rustige plek.", "Adem zacht.", "Doe even niets."]],
    ["Douchen", "🚿", "avond", ["Leg je spullen klaar.", "Douche rustig.", "Droog je af."]],
    ["Scherm uit", "🌙", "bedtijd", ["Zet je scherm uit.", "Leg hem weg.", "Kies iets rustigs."]]
  ].map(([title, icon, dayPart, steps]) => ({
    id: id(),
    childProfileId: profile.id,
    title: title as string,
    icon: icon as string,
    category: "Dag",
    ageGroup: "6-7",
    dayPart: dayPart as Task["dayPart"],
    steps: steps as string[],
    repeatPattern: "elkeDag",
    rewardEnabled: true,
    requiresHelp: false,
    isDefault: true,
    isEnabled: true,
    createdAt: now(),
    updatedAt: now()
  }));

  await db.transaction("rw", [db.childProfiles, db.settings, db.avatars, db.emotions, db.needs, db.calmStrategies, db.parentPhrases, db.taskTemplates, db.practiceExercises, db.tasks, db.backupMetadata], async () => {
    await db.childProfiles.add(profile);
    await db.settings.add(settings);
    await db.avatars.bulkAdd(avatarAssets);
    await db.emotions.bulkAdd(emotions);
    await db.needs.bulkAdd(needs);
    await db.calmStrategies.bulkAdd(calmStrategies);
    await db.parentPhrases.bulkAdd(parentPhrases.map((text, index) => ({ id: `phrase-${index}`, text })));
    await db.taskTemplates.bulkAdd(taskTemplates);
    await db.practiceExercises.bulkAdd(practiceExercises);
    await db.tasks.bulkAdd(defaultTasks);
    await db.backupMetadata.add({ id: "backup" });
  });
}

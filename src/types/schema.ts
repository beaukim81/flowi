export type AvatarId = "giraffe" | "koala" | "vos" | "konijn" | "panda" | "dino";
export type EmotionType = "rustig" | "verdrietig" | "boos" | "teVeel" | "superDruk" | "inDeWar" | "moe" | "weetIkNiet";
export type NeedType = "knuffel" | "rustigePlek" | "bewegen" | "evenAlleen" | "praatMetOuder" | "ademen" | "koptelefoon" | "creatief";
export type DayPart = "ochtend" | "naSchool" | "avond" | "bedtijd" | "vrij";
export type RepeatPattern = "elkeDag" | "weekdagen" | "weekend" | "aangepast";
export type CompletionStatus = "done" | "skipped" | "needsHelp" | "tooHard";

export interface Avatar {
  id: AvatarId;
  label: string;
  icon: string;
  defaultImage: string;
  emotionImages?: Partial<Record<EmotionType, string>>;
  isDefault: boolean;
  isEnabled: boolean;
}

export interface ChildProfile {
  id: string;
  name: string;
  age: number;
  selectedAvatarId: AvatarId;
  theme: string;
  caregiverLabel: string;
  caregiverName?: string;
  visibleEmotionTypes: EmotionType[];
  visibleNeedTypes: NeedType[];
  safePlaceName: string;
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  id: string;
  selectedTheme: string;
  reducedMotion: boolean;
  soundEnabled: boolean;
  onboardingSeen: boolean;
  timeOptionalEnabled: boolean;
  rewardsEnabled: boolean;
  backupReminderEnabled: boolean;
  lastBackupAt?: string;
}

export interface Emotion {
  id: EmotionType;
  label: string;
  shortText: string;
  colors: string;
  marks: string;
}

export interface Need {
  id: NeedType;
  label: string;
  icon: string;
}

export interface CalmStrategy {
  id: string;
  title: string;
  childText: string;
  parentText: string;
  linkedEmotionTypes: EmotionType[];
  linkedNeedTypes: NeedType[];
  icon: string;
  durationSeconds?: number;
  isDefault: boolean;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmotionHistoryEntry {
  id: string;
  childProfileId: string;
  emotionType: EmotionType;
  needType: NeedType;
  actionId: string;
  helpedRating: string;
  note?: string;
  createdAt: string;
}

export interface Task {
  id: string;
  childProfileId: string;
  title: string;
  icon: string;
  category: string;
  ageGroup: string;
  dayPart: DayPart;
  sortOrder: number;
  steps: string[];
  repeatPattern: RepeatPattern;
  optionalTime?: string;
  estimatedMinutes?: number;
  rewardEnabled: boolean;
  requiresHelp: boolean;
  isDefault: boolean;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaskTemplate {
  id: string;
  title: string;
  icon: string;
  category: string;
  ageGroup: string;
  defaultDayPart: DayPart;
  suggestedSteps: string[];
  estimatedMinutes?: number;
}

export interface DailyPlan {
  id: string;
  childProfileId: string;
  date: string;
  dayParts: DayPart[];
  createdAt: string;
  updatedAt: string;
}

export interface TaskCompletion {
  id: string;
  childProfileId: string;
  taskId: string;
  date: string;
  status: CompletionStatus;
  completedAt?: string;
  moodBefore?: EmotionType;
  note?: string;
}

export interface Reward {
  id: string;
  childProfileId: string;
  label: string;
  icon: string;
  reason: string;
  earnedAt: string;
}

export interface PracticeExercise {
  id: string;
  title: string;
  description: string;
  steps: string[];
  category: string;
  durationSeconds?: number;
  defaultRounds?: number;
  minSeconds?: number;
  maxSeconds?: number;
  rewardLabel?: string;
}

export interface BackupMetadata {
  id: string;
  lastBackupAt?: string;
}

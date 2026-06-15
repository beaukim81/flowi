import type { PracticeExercise } from "../types/schema";

export const practiceExercises: PracticeExercise[] = [
  { id: "adem-blaadje", title: "Blaadjesadem", description: "Adem rustig alsof een blaadje beweegt.", steps: ["Adem in.", "Blaas zacht uit.", "Doe dit 5 keer."], category: "Ademen", durationSeconds: 90, rewardLabel: "Ik oefende rust" },
  { id: "hand-hart", title: "Hand op je hart", description: "Voel dat jij er mag zijn.", steps: ["Leg je hand op je hart.", "Adem zacht.", "Zeg: ik mag er zijn."], category: "Rust", durationSeconds: 60, rewardLabel: "Ik koos rust" },
  { id: "start-stap", title: "Eerste stapje", description: "Maak iets groots klein.", steps: ["Kies één taak.", "Doe alleen de eerste stap.", "Goed geprobeerd."], category: "Starten", rewardLabel: "Ik begon" },
  { id: "vraag-hulp", title: "Hulpzin oefenen", description: "Hulp vragen is sterk.", steps: ["Zeg: wil je mij helpen?", "Wijs aan wat lastig is.", "Doe het samen."], category: "Samen", rewardLabel: "Ik vroeg hulp" }
];

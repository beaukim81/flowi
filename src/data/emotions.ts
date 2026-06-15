import type { Emotion } from "../types/schema";

export const emotions: Emotion[] = [
  { id: "rustig", label: "Rustig", shortText: "Mijn lijf is zacht.", colors: "from-emerald-100 to-yellow-100", marks: "🍃" },
  { id: "verdrietig", label: "Verdrietig", shortText: "Er mogen tranen zijn.", colors: "from-blue-100 to-sky-200", marks: "💧" },
  { id: "boos", label: "Boos", shortText: "Boos mag er zijn.", colors: "from-orange-100 to-rose-200", marks: "🔥" },
  { id: "teVeel", label: "Te veel", shortText: "Alles voelt vol.", colors: "from-violet-100 to-purple-200", marks: "🌀" },
  { id: "superDruk", label: "Super druk", shortText: "Veel energie.", colors: "from-amber-100 to-orange-200", marks: "⭐" },
  { id: "inDeWar", label: "In de war", shortText: "Even zoeken.", colors: "from-slate-100 to-blue-100", marks: "?" },
  { id: "moe", label: "Moe", shortText: "Mijn lijf wil rustig.", colors: "from-blue-900 to-indigo-500", marks: "🌙" },
  { id: "weetIkNiet", label: "Weet ik niet", shortText: "Dat mag.", colors: "from-blue-50 to-violet-100", marks: "?" }
];

import type { Emotion } from "../types/schema";

export const emotions: Emotion[] = [
  { id: "rustig", label: "Rustig", shortText: "Mijn lijf is zacht.", colors: "from-emerald-100 to-yellow-100", marks: "leaf" },
  { id: "blij", label: "Blij", shortText: "Het voelt fijn.", colors: "from-yellow-100 to-lime-100", marks: "heart" },
  { id: "verdrietig", label: "Verdrietig", shortText: "Er mogen tranen zijn.", colors: "from-blue-100 to-sky-200", marks: "drop" },
  { id: "boos", label: "Boos", shortText: "Boos mag er zijn.", colors: "from-orange-100 to-rose-200", marks: "fire" },
  { id: "spannend", label: "Spannend", shortText: "Ik voel kriebels.", colors: "from-violet-100 to-blue-100", marks: "spark" },
  { id: "overprikkeld", label: "Overprikkeld", shortText: "Alles komt hard binnen.", colors: "from-violet-100 to-purple-200", marks: "swirl" },
  { id: "druk", label: "Druk", shortText: "Veel energie.", colors: "from-amber-100 to-orange-200", marks: "star" },
  { id: "moe", label: "Moe", shortText: "Mijn lijf wil rustig.", colors: "from-blue-900 to-indigo-500", marks: "moon" },
  { id: "weetIkNiet", label: "Weet ik niet", shortText: "Dat mag.", colors: "from-blue-50 to-violet-100", marks: "question" }
];

export const unsureEmotions: Emotion[] = [
  { id: "teVeel", label: "Het is te veel", shortText: "Alles voelt vol.", colors: "from-violet-100 to-purple-200", marks: "swirl" },
  { id: "snapNiet", label: "Ik snap het niet", shortText: "Even uitleg nodig.", colors: "from-slate-100 to-blue-100", marks: "question" },
  { id: "durfNiet", label: "Ik durf niet", shortText: "Het voelt spannend.", colors: "from-violet-100 to-blue-100", marks: "spark" },
  { id: "wilHulp", label: "Ik wil hulp", shortText: "Samen is fijner.", colors: "from-blue-50 to-violet-100", marks: "help" }
];

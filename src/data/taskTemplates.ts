import type { DayPart, TaskTemplate } from "../types/schema";

const byAge = {
  "4-5": ["speelgoed opruimen", "jas ophangen met hulp", "handen wassen", "pyjama aan met hulp", "tandenpoetsen met hulp", "knuffel pakken", "was in wasmand", "beker naar aanrecht", "boekjes opruimen", "schoenen klaarzetten"],
  "6-7": ["aankleden", "ontbijten", "tandenpoetsen", "handen wassen", "tas pakken", "broodtrommel naar keuken", "jas ophangen", "schoenen aan", "pyjama aan", "douchen/in bad met begeleiding", "speelgoed opruimen", "tafel dekken", "bord naar keuken brengen", "planten water geven met hulp", "scherm uit met timer", "rustige plek kiezen"],
  "8-9": ["schooltas inpakken", "kleding klaarleggen", "tandenpoetsen", "haren kammen", "douchen met herinnering", "bed rechttrekken", "kamer 5 minuten opruimen", "tafel afruimen", "vaatwasser helpen", "broodtrommel klaarmaken met hulp", "sportspullen klaarleggen", "was sorteren", "huisdier eten geven met hulp", "rustkaart kiezen"],
  "10-12": ["ochtendroutine volgen", "avondroutine volgen", "agenda checken", "tas volledig inpakken", "sportspullen klaarleggen", "douchen plannen", "kleding kiezen", "lunch maken met hulp", "kamer stofzuigen", "bed verschonen met hulp", "vaatwasser in/uitruimen", "afval wegbrengen", "huisdier verzorgen", "weekplanning bekijken", "pauze plannen", "schermtijd afronden"]
};

const iconFor = (title: string) => {
  if (title.includes("tanden")) return "🪥";
  if (title.includes("tas") || title.includes("school")) return "🎒";
  if (title.includes("handen")) return "🧼";
  if (title.includes("pyjama") || title.includes("bed")) return "🌙";
  if (title.includes("tafel") || title.includes("bord")) return "🍽️";
  if (title.includes("plant")) return "🌱";
  if (title.includes("rust") || title.includes("pauze")) return "🍃";
  if (title.includes("schoenen")) return "👟";
  if (title.includes("douchen")) return "🚿";
  return "⭐";
};

const dayPartFor = (title: string): DayPart => {
  if (title.includes("pyjama") || title.includes("bed") || title.includes("scherm")) return "bedtijd";
  if (title.includes("avond")) return "avond";
  if (title.includes("jas ophangen") || title.includes("broodtrommel") || title.includes("rust")) return "naSchool";
  if (title.includes("ochtend") || title.includes("aankleden") || title.includes("ontbijten") || title.includes("tas") || title.includes("schoenen")) return "ochtend";
  return "vrij";
};

export const taskTemplates: TaskTemplate[] = Object.entries(byAge).flatMap(([ageGroup, titles]) =>
  titles.map((title, index) => ({
    id: `${ageGroup}-${index}-${title.replaceAll(" ", "-")}`,
    title,
    icon: iconFor(title),
    category: title.includes("rust") || title.includes("pauze") ? "Rust" : title.includes("tafel") || title.includes("was") || title.includes("kamer") ? "Helpen" : "Zelfzorg",
    ageGroup,
    defaultDayPart: dayPartFor(title),
    suggestedSteps: title === "aankleden" ? ["Pak je kleren.", "Trek je broek aan.", "Trek je shirt aan.", "Sokken aan.", "Klaar."] : [`Begin met ${title}.`, "Vraag hulp als het nodig is.", "Klaar."],
    estimatedMinutes: 5
  }))
);

import type { DayPart, TaskTemplate } from "../types/schema";
import { getTaskVisualKey } from "../utils/taskVisuals";

type TemplateSeed = {
  title: string;
  category: string;
  ageGroups: string[];
  dayPart: DayPart;
  steps: string[];
  minutes?: number;
};

const templates: TemplateSeed[] = [
  { title: "Wakker worden", category: "Ochtend", ageGroups: ["4-5", "6-7"], dayPart: "ochtend", steps: ["Doe je ogen open.", "Rek je uit.", "Kom rustig uit bed."] },
  { title: "Bed opmaken", category: "Slaapkamer", ageGroups: ["8-9", "10-12"], dayPart: "ochtend", steps: ["Trek je dekbed recht.", "Leg je kussen goed.", "Klaar."] },
  { title: "Gordijnen open", category: "Ochtend", ageGroups: ["4-5", "6-7", "8-9"], dayPart: "ochtend", steps: ["Loop naar het raam.", "Doe de gordijnen open.", "Zeg goedemorgen dag."] },
  { title: "Aankleden", category: "Zelfzorg", ageGroups: ["4-5", "6-7", "8-9"], dayPart: "ochtend", steps: ["Pak je kleren.", "Trek je broek aan.", "Trek je shirt aan.", "Sokken aan.", "Klaar."] },
  { title: "Kleding klaarleggen", category: "Voorbereiden", ageGroups: ["8-9", "10-12"], dayPart: "avond", steps: ["Kies kleding.", "Leg alles klaar.", "Check sokken en ondergoed."] },
  { title: "Ontbijten", category: "Eten & drinken", ageGroups: ["4-5", "6-7", "8-9", "10-12"], dayPart: "ochtend", steps: ["Ga aan tafel.", "Eet rustig.", "Neem een slok.", "Klaar."] },
  { title: "Fruit eten", category: "Eten & drinken", ageGroups: ["4-5", "6-7", "8-9", "10-12"], dayPart: "ochtend", steps: ["Ga zitten.", "Kies fruit.", "Eet rustig.", "Klaar."] },
  { title: "Bord naar de keuken", category: "Helpen", ageGroups: ["4-5", "6-7", "8-9"], dayPart: "ochtend", steps: ["Pak je bord.", "Loop naar de keuken.", "Zet het op het aanrecht."] },
  { title: "Naar de wc voor vertrek", category: "Zelfzorg", ageGroups: ["4-5", "6-7", "8-9"], dayPart: "ochtend", steps: ["Ga naar de wc.", "Was je handen.", "Kom terug."] },
  { title: "Tandenpoetsen ochtend", category: "Zelfzorg", ageGroups: ["4-5", "6-7", "8-9", "10-12"], dayPart: "ochtend", steps: ["Pak je tandenborstel.", "Tandpasta erop.", "Poets boven.", "Poets onder.", "Spoel."] },
  { title: "Haren kammen", category: "Zelfzorg", ageGroups: ["6-7", "8-9", "10-12"], dayPart: "ochtend", steps: ["Pak je kam.", "Kam rustig.", "Vraag hulp bij klitten."] },
  { title: "Gezicht wassen", category: "Zelfzorg", ageGroups: ["6-7", "8-9", "10-12"], dayPart: "ochtend", steps: ["Maak washand nat.", "Was je gezicht.", "Droog af."] },
  { title: "Medicijn of vitamine met ouder", category: "Zelfzorg", ageGroups: ["4-5", "6-7", "8-9", "10-12"], dayPart: "ochtend", steps: ["Vraag je ouder.", "Neem het samen.", "Klaar."], minutes: 2 },
  { title: "Tas pakken", category: "School", ageGroups: ["6-7", "8-9"], dayPart: "ochtend", steps: ["Pak je tas.", "Doe je spullen erin.", "Zet hem klaar."] },
  { title: "Schooltas checken", category: "School", ageGroups: ["8-9", "10-12"], dayPart: "ochtend", steps: ["Check boeken.", "Check drinken.", "Check lunch.", "Rits dicht."] },
  { title: "Broodtrommel pakken", category: "School", ageGroups: ["6-7", "8-9", "10-12"], dayPart: "ochtend", steps: ["Pak je broodtrommel.", "Doe hem in je tas.", "Klaar."] },
  { title: "Drinkbeker pakken", category: "School", ageGroups: ["4-5", "6-7", "8-9"], dayPart: "ochtend", steps: ["Pak je beker.", "Doe hem in je tas.", "Klaar."] },
  { title: "Schoenen aan", category: "Ochtend", ageGroups: ["4-5", "6-7", "8-9"], dayPart: "ochtend", steps: ["Pak je schoenen.", "Trek ze aan.", "Sluit ze of vraag hulp."] },
  { title: "Jas aan", category: "Ochtend", ageGroups: ["4-5", "6-7"], dayPart: "ochtend", steps: ["Pak je jas.", "Trek hem aan.", "Rits dicht."] },
  { title: "Zonnebrand smeren", category: "Zelfzorg", ageGroups: ["4-5", "6-7", "8-9"], dayPart: "ochtend", steps: ["Vraag je ouder.", "Smeer armen en gezicht.", "Laat het even intrekken."], minutes: 3 },
  { title: "Fietsen naar school", category: "School", ageGroups: ["6-7", "8-9", "10-12"], dayPart: "ochtend", steps: ["Zet je helm op.", "Pak je fiets.", "Fiets rustig mee."] },
  { title: "Naar school gaan", category: "School", ageGroups: ["4-5", "6-7", "8-9", "10-12"], dayPart: "ochtend", steps: ["Pak je tas.", "Zeg dag.", "Ga rustig mee."] },

  { title: "Jas ophangen", category: "Na school", ageGroups: ["4-5", "6-7", "8-9"], dayPart: "naSchool", steps: ["Doe je jas uit.", "Hang hem op.", "Klaar."] },
  { title: "Schoenen uit", category: "Na school", ageGroups: ["4-5", "6-7"], dayPart: "naSchool", steps: ["Doe je schoenen uit.", "Zet ze op hun plek.", "Klaar."] },
  { title: "Handen wassen na school", category: "Zelfzorg", ageGroups: ["4-5", "6-7", "8-9"], dayPart: "naSchool", steps: ["Kraan aan.", "Zeep.", "Wassen.", "Afdrogen."] },
  { title: "Tas uitpakken", category: "School", ageGroups: ["6-7", "8-9", "10-12"], dayPart: "naSchool", steps: ["Open je tas.", "Haal eten en drinken eruit.", "Leg post op tafel."] },
  { title: "Broodtrommel naar keuken", category: "School", ageGroups: ["6-7", "8-9", "10-12"], dayPart: "naSchool", steps: ["Pak je broodtrommel.", "Breng hem naar de keuken.", "Klaar."] },
  { title: "Drinkbeker naar keuken", category: "School", ageGroups: ["4-5", "6-7", "8-9"], dayPart: "naSchool", steps: ["Pak je beker.", "Zet hem op het aanrecht.", "Klaar."] },
  { title: "Iets drinken", category: "Eten & drinken", ageGroups: ["4-5", "6-7", "8-9", "10-12"], dayPart: "naSchool", steps: ["Pak drinken.", "Neem rustig een slok.", "Zet beker terug."] },
  { title: "Snack eten", category: "Eten & drinken", ageGroups: ["4-5", "6-7", "8-9"], dayPart: "naSchool", steps: ["Ga zitten.", "Eet rustig.", "Ruim op."] },
  { title: "Even landen", category: "Rust", ageGroups: ["4-5", "6-7", "8-9", "10-12"], dayPart: "naSchool", steps: ["Zit op een rustige plek.", "Adem zacht.", "Je hoeft even niets."] },
  { title: "Koptelefoon rust", category: "Rust", ageGroups: ["4-5", "6-7", "8-9", "10-12"], dayPart: "naSchool", steps: ["Pak je koptelefoon.", "Zet hem op.", "Rust 5 minuten."] },
  { title: "Naar de BSO", category: "Na school", ageGroups: ["4-5", "6-7", "8-9", "10-12"], dayPart: "naSchool", steps: ["Pak je tas.", "Ga mee naar de opvang.", "Kies rustig een plek."] },
  { title: "Speelafspraak", category: "Sociaal", ageGroups: ["4-5", "6-7", "8-9", "10-12"], dayPart: "naSchool", steps: ["Zeg hallo.", "Kies samen iets om te doen.", "Vraag hulp als het lastig is."] },
  { title: "Buiten spelen", category: "Bewegen", ageGroups: ["4-5", "6-7", "8-9"], dayPart: "naSchool", steps: ["Doe jas of schoenen aan.", "Speel buiten.", "Kom terug als het tijd is."] },
  { title: "Beweegpauze", category: "Bewegen", ageGroups: ["6-7", "8-9", "10-12"], dayPart: "naSchool", steps: ["Spring 10 keer.", "Schud je armen.", "Adem uit."] },
  { title: "Sporten", category: "Bewegen", ageGroups: ["4-5", "6-7", "8-9", "10-12"], dayPart: "naSchool", steps: ["Trek sportspullen aan.", "Doe mee met de training.", "Drink daarna wat water."], minutes: 45 },
  { title: "Zwemles", category: "Bewegen", ageGroups: ["4-5", "6-7", "8-9"], dayPart: "naSchool", steps: ["Pak je zwemspullen.", "Luister naar de juf of meester.", "Droog je af na het zwemmen."], minutes: 45 },
  { title: "Muziekles", category: "Creatief", ageGroups: ["6-7", "8-9", "10-12"], dayPart: "naSchool", steps: ["Pak je instrument.", "Oefen rustig mee.", "Ruim je spullen op."], minutes: 30 },
  { title: "Huiswerk starten", category: "School", ageGroups: ["8-9", "10-12"], dayPart: "naSchool", steps: ["Leg spullen klaar.", "Doe één opdracht.", "Vraag hulp als nodig."] },
  { title: "Lezen", category: "School", ageGroups: ["6-7", "8-9", "10-12"], dayPart: "naSchool", steps: ["Pak een boek.", "Lees een stukje.", "Leg je boek terug."] },
  { title: "Knutselen", category: "Creatief", ageGroups: ["4-5", "6-7", "8-9", "10-12"], dayPart: "naSchool", steps: ["Pak papier.", "Pak lijm of kleurtjes.", "Maak iets.", "Ruim op."] },

  { title: "Speelgoed opruimen", category: "Opruimen", ageGroups: ["4-5", "6-7", "8-9"], dayPart: "avond", steps: ["Pak één ding.", "Leg het op zijn plek.", "Doe nog één ding."] },
  { title: "Kamer 5 minuten opruimen", category: "Opruimen", ageGroups: ["8-9", "10-12"], dayPart: "avond", steps: ["Zet timer.", "Ruim 5 minuten op.", "Stop als de timer gaat."] },
  { title: "Was in wasmand", category: "Opruimen", ageGroups: ["4-5", "6-7", "8-9"], dayPart: "avond", steps: ["Pak vieze was.", "Doe het in de mand.", "Klaar."] },
  { title: "Tafel dekken", category: "Helpen", ageGroups: ["6-7", "8-9", "10-12"], dayPart: "avond", steps: ["Pak borden.", "Pak bestek.", "Leg alles op tafel."] },
  { title: "Avond eten", category: "Eten & drinken", ageGroups: ["4-5", "6-7", "8-9", "10-12"], dayPart: "avond", steps: ["Ga aan tafel.", "Neem een hap.", "Neem een slok.", "Blijf zitten tot je klaar bent."] },
  { title: "Tafel afruimen", category: "Helpen", ageGroups: ["6-7", "8-9", "10-12"], dayPart: "avond", steps: ["Pak je bord.", "Breng het weg.", "Help met nog één ding."] },
  { title: "Vaatwasser helpen", category: "Helpen", ageGroups: ["8-9", "10-12"], dayPart: "avond", steps: ["Vraag wat mag.", "Zet spullen erin.", "Klaar."] },
  { title: "Planten water geven", category: "Helpen", ageGroups: ["6-7", "8-9", "10-12"], dayPart: "avond", steps: ["Pak water.", "Geef een beetje.", "Zet terug."] },
  { title: "Huisdier eten geven met hulp", category: "Helpen", ageGroups: ["6-7", "8-9", "10-12"], dayPart: "avond", steps: ["Vraag je ouder.", "Pak voer.", "Geef het samen."] },
  { title: "Sportspullen klaarleggen", category: "Voorbereiden", ageGroups: ["8-9", "10-12"], dayPart: "avond", steps: ["Pak tas.", "Leg kleding klaar.", "Check schoenen."] },
  { title: "Lunch klaarmaken", category: "Voorbereiden", ageGroups: ["8-9", "10-12"], dayPart: "avond", steps: ["Pak brood of bakje.", "Maak je lunch met hulp.", "Zet het klaar voor morgen."] },
  { title: "Agenda checken", category: "Voorbereiden", ageGroups: ["10-12"], dayPart: "avond", steps: ["Open agenda.", "Kijk naar morgen.", "Vraag hulp als iets onduidelijk is."] },
  { title: "Weekplanning bekijken", category: "Voorbereiden", ageGroups: ["10-12"], dayPart: "avond", steps: ["Kijk naar de planning.", "Noem één ding voor morgen.", "Klaar."] },
  { title: "Douchen", category: "Zelfzorg", ageGroups: ["6-7", "8-9", "10-12"], dayPart: "avond", steps: ["Leg spullen klaar.", "Douche rustig.", "Droog je af."] },
  { title: "In bad", category: "Zelfzorg", ageGroups: ["4-5", "6-7"], dayPart: "avond", steps: ["Ga in bad met hulp.", "Was je lijf.", "Droog af."] },
  { title: "Pyjama aan", category: "Bedtijd", ageGroups: ["4-5", "6-7", "8-9"], dayPart: "bedtijd", steps: ["Pak pyjama.", "Trek hem aan.", "Leg kleren weg."] },
  { title: "Tandenpoetsen avond", category: "Bedtijd", ageGroups: ["4-5", "6-7", "8-9", "10-12"], dayPart: "bedtijd", steps: ["Pak tandenborstel.", "Poets rustig.", "Spoel."] },
  { title: "Scherm uit", category: "Bedtijd", ageGroups: ["6-7", "8-9", "10-12"], dayPart: "bedtijd", steps: ["Zet scherm uit.", "Leg hem weg.", "Kies iets rustigs."] },
  { title: "Boekje lezen", category: "Bedtijd", ageGroups: ["4-5", "6-7", "8-9"], dayPart: "bedtijd", steps: ["Pak boek.", "Lees of luister.", "Leg boek weg."] },
  { title: "Knuffel pakken", category: "Bedtijd", ageGroups: ["4-5", "6-7"], dayPart: "bedtijd", steps: ["Pak je knuffel.", "Leg hem bij je.", "Klaar."] },
  { title: "Rustkaart kiezen", category: "Rust", ageGroups: ["6-7", "8-9", "10-12"], dayPart: "bedtijd", steps: ["Kies een rustkaart.", "Doe één oefening.", "Goed geprobeerd."] },
  { title: "Adem rustig in bed", category: "Rust", ageGroups: ["4-5", "6-7", "8-9", "10-12"], dayPart: "bedtijd", steps: ["Lig rustig.", "Adem in.", "Adem zacht uit."] },
  { title: "Licht zachter", category: "Bedtijd", ageGroups: ["4-5", "6-7", "8-9"], dayPart: "bedtijd", steps: ["Maak licht zachter.", "Kruip in bed.", "Klaar."] },
  { title: "Naar bed", category: "Bedtijd", ageGroups: ["4-5", "6-7", "8-9", "10-12"], dayPart: "bedtijd", steps: ["Ga naar bed.", "Pak je deken.", "Slaap lekker."] },

  { title: "Vraag hulp", category: "Emotieregulatie", ageGroups: ["4-5", "6-7", "8-9", "10-12"], dayPart: "vrij", steps: ["Zeg: wil je mij helpen?", "Wijs aan wat lastig is.", "Doe het samen."] },
  { title: "Rustige plek kiezen", category: "Emotieregulatie", ageGroups: ["4-5", "6-7", "8-9", "10-12"], dayPart: "vrij", steps: ["Kies je rustige plek.", "Ga erheen.", "Adem zacht."] },
  { title: "Duw tegen de muur", category: "Emotieregulatie", ageGroups: ["6-7", "8-9", "10-12"], dayPart: "vrij", steps: ["Zet voeten stevig.", "Duw 5 keer.", "Adem uit."] },
  { title: "Spring 10 keer", category: "Bewegen", ageGroups: ["4-5", "6-7", "8-9"], dayPart: "vrij", steps: ["Sta stevig.", "Spring 10 keer.", "Voel je voeten."] },
  
];

const iconFor = (title: string) => {
  const text = title.toLowerCase();
  if (text.includes("zwem")) return "🏊";
  if (text.includes("sport") || text.includes("training")) return "⚽";
  if (text.includes("fiets")) return "🚲";
  if (text.includes("muziek")) return "🎵";
  if (text.includes("speelafspraak")) return "🤝";
  if (text.includes("bso") || text.includes("opvang")) return "🏫";
  if (text.includes("wc") || text.includes("toilet")) return "🚽";
  if (text.includes("zonnebrand")) return "☀️";
  if (text.includes("fruit")) return "🍎";
  if (text.includes("lunch")) return "🥪";
  if (title.includes("tanden")) return "🪥";
  if (title.includes("tas") || title.includes("school")) return "🎒";
  if (title.includes("handen") || title.includes("wassen")) return "🧼";
  if (title.includes("pyjama") || title.includes("bed") || title.includes("slaap")) return "🌙";
  if (title.includes("tafel") || title.includes("bord") || title.includes("eten")) return "🍽️";
  if (title.includes("plant")) return "🌱";
  if (title.includes("rust") || title.includes("pauze") || title.includes("adem")) return "🍃";
  if (title.includes("schoenen") || title.includes("spring")) return "👟";
  if (title.includes("douche") || title.includes("bad")) return "🚿";
  if (title.includes("aankleden") || title.includes("kleding")) return "👕";
  if (title.includes("ontbijt")) return "🥣";
  if (title.includes("boek") || title.includes("lezen")) return "📚";
  if (title.includes("teken")) return "✏️";
  return "⭐";
};

const slug = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export const taskTemplates: TaskTemplate[] = templates.flatMap((template) =>
  template.ageGroups.map((ageGroup) => ({
    id: `${ageGroup}-${slug(template.title)}`,
    title: template.title,
    icon: iconFor(template.title),
    visualKey: getTaskVisualKey(template.title),
    category: template.category,
    ageGroup,
    defaultDayPart: template.dayPart,
    suggestedSteps: template.steps,
    estimatedMinutes: template.minutes ?? 5
  }))
);

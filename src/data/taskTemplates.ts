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
  { title: "Buiten spelen", category: "Bewegen", ageGroups: ["4-5", "6-7", "8-9"], dayPart: "naSchool", steps: ["Doe jas of schoenen aan.", "Speel buiten.", "Kom terug als het tijd is."] },
  { title: "Beweegpauze", category: "Bewegen", ageGroups: ["6-7", "8-9", "10-12"], dayPart: "naSchool", steps: ["Spring 10 keer.", "Schud je armen.", "Adem uit."] },
  { title: "Sporten", category: "Bewegen", ageGroups: ["4-5", "6-7", "8-9", "10-12"], dayPart: "naSchool", steps: ["Trek sportspullen aan.", "Doe mee met de training.", "Drink daarna wat water."], minutes: 45 },
  { title: "Zwemles", category: "Bewegen", ageGroups: ["4-5", "6-7", "8-9"], dayPart: "naSchool", steps: ["Pak je zwemspullen.", "Luister naar de juf of meester.", "Droog je af na het zwemmen."], minutes: 45 },
  { title: "Muziekles", category: "Creatief", ageGroups: ["6-7", "8-9", "10-12"], dayPart: "naSchool", steps: ["Pak je instrument.", "Oefen rustig mee.", "Ruim je spullen op."], minutes: 30 },
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

const extraSteps = {
  samen: ["Ga samen.", "Doe rustig mee.", "Klaar."],
  afspraak: ["Ga samen naar binnen.", "Luister of wacht rustig.", "Ga weer mee naar huis."],
  eropuit: ["Pak wat nodig is.", "Ga samen op pad.", "Kom weer terug."],
  spelen: ["Kies iets om te doen.", "Speel rustig.", "Ruim samen op."],
  school: ["Luister goed.", "Doe stap voor stap mee.", "Vraag hulp als nodig."],
  sport: ["Pak je spullen.", "Doe mee.", "Drink daarna wat water."],
  scherm: ["Spreek tijd af.", "Kijk of speel rustig.", "Stop als het tijd is."]
};

const extraTask = (
  title: string,
  category: string,
  dayPart: DayPart = "vrij",
  steps: string[] = extraSteps.samen,
  minutes = 20
): TemplateSeed => ({ title, category, ageGroups: ["alle"], dayPart, steps, minutes });

const extraTemplates: TemplateSeed[] = [
  extraTask("Hond uitlaten met ouder", "Eropuit", "vrij", extraSteps.eropuit, 15),
  extraTask("Boodschappen", "Eropuit", "vrij", extraSteps.eropuit, 30),
  extraTask("Kapper", "Afspraken", "vrij", extraSteps.afspraak, 30),
  extraTask("Tandarts", "Afspraken", "vrij", extraSteps.afspraak, 30),
  extraTask("Huisarts", "Afspraken", "vrij", extraSteps.afspraak, 30),
  extraTask("Logopedie", "Afspraken", "vrij", extraSteps.afspraak, 30),
  extraTask("Fysio", "Afspraken", "vrij", extraSteps.afspraak, 30),
  extraTask("Therapie", "Afspraken", "vrij", extraSteps.afspraak, 45),
  extraTask("Kleding kopen", "Eropuit", "vrij", extraSteps.eropuit, 45),
  extraTask("Schoenen kopen", "Eropuit", "vrij", extraSteps.eropuit, 45),
  extraTask("Pakketje ophalen", "Eropuit", "vrij", extraSteps.eropuit, 15),
  extraTask("Auto/fiets naar garage", "Eropuit", "vrij", extraSteps.eropuit, 30),
  extraTask("Afspraak ouder", "Afspraken", "vrij", extraSteps.afspraak, 45),

  extraTask("Pretpark", "Uitjes", "vrij", extraSteps.eropuit, 120),
  extraTask("Binnenspeeltuin", "Uitjes", "vrij", extraSteps.spelen, 90),
  extraTask("Trampolinepark", "Uitjes", "vrij", extraSteps.sport, 60),
  extraTask("Zwembad", "Uitjes", "vrij", extraSteps.sport, 60),
  extraTask("Kermis", "Uitjes", "vrij", extraSteps.eropuit, 60),
  extraTask("Festival", "Uitjes", "vrij", extraSteps.eropuit, 90),
  extraTask("Winkelcentrum", "Uitjes", "vrij", extraSteps.eropuit, 60),
  extraTask("Stad in", "Uitjes", "vrij", extraSteps.eropuit, 60),
  extraTask("Restaurant", "Uitjes", "vrij", ["Ga mee naar tafel.", "Eet of drink rustig.", "Blijf bij je ouder."], 60),
  extraTask("Bioscoop", "Uitjes", "vrij", ["Ga zitten.", "Kijk de film.", "Loop rustig mee naar buiten."], 90),
  extraTask("Bowling", "Uitjes", "vrij", extraSteps.spelen, 60),
  extraTask("Arcade/speelhal", "Uitjes", "vrij", extraSteps.spelen, 45),

  extraTask("Bij vriendje spelen", "Sociaal", "vrij", extraSteps.spelen, 60),
  extraTask("Logeren", "Sociaal", "vrij", ["Pak je logeerspullen.", "Ga samen naar binnen.", "Slaap daar."], 120),
  extraTask("Kinderfeestje", "Sociaal", "vrij", extraSteps.spelen, 90),
  extraTask("Verjaardag", "Sociaal", "vrij", extraSteps.samen, 90),
  extraTask("Familiefeest", "Sociaal", "vrij", extraSteps.samen, 90),
  extraTask("Op bezoek", "Sociaal", "vrij", extraSteps.eropuit, 60),
  extraTask("Bezoek krijgen", "Sociaal", "vrij", ["Zeg hallo.", "Speel of doe rustig mee.", "Zeg dag."], 60),
  extraTask("Naar opa en oma", "Familie", "vrij", extraSteps.eropuit, 60),
  extraTask("Naar neef/nicht", "Familie", "vrij", extraSteps.eropuit, 60),
  extraTask("Naar buren", "Sociaal", "vrij", extraSteps.eropuit, 30),
  extraTask("Gastouder", "Opvang", "naSchool", extraSteps.samen, 60),
  extraTask("Oppas", "Opvang", "vrij", extraSteps.samen, 60),
  extraTask("Bij opa/oma na school", "Opvang", "naSchool", extraSteps.samen, 60),

  extraTask("Schoolreisje", "School", "vrij", extraSteps.school, 120),
  extraTask("Studiedag", "School", "vrij", ["Vandaag is anders.", "Kijk wat op de planning staat.", "Doe stap voor stap mee."], 60),
  extraTask("Toets", "School", "vrij", extraSteps.school, 30),
  extraTask("Spreekbeurt", "School", "vrij", extraSteps.school, 30),
  extraTask("Sportdag", "School", "vrij", extraSteps.sport, 90),
  extraTask("Schoolfeest", "School", "vrij", extraSteps.samen, 90),
  extraTask("Rapport", "School", "vrij", ["Neem je rapport mee.", "Vraag kort wat je gedaan hebt.", "Klaar."], 10),
  extraTask("Huiswerk", "School", "naSchool", ["Leg spullen klaar.", "Doe een stukje.", "Vraag hulp als nodig."], 20),

  extraTask("Tijd met mama", "Familie", "vrij", extraSteps.samen, 30),
  extraTask("Tijd met papa", "Familie", "vrij", extraSteps.samen, 30),
  extraTask("Tijd met broer/zus", "Familie", "vrij", extraSteps.spelen, 30),
  extraTask("Tijd met bonusouder", "Familie", "vrij", extraSteps.samen, 30),
  extraTask("Tijd met opa/oma", "Familie", "vrij", extraSteps.samen, 30),
  extraTask("Familiebezoek", "Familie", "vrij", extraSteps.eropuit, 60),
  extraTask("Samen eten", "Familie", "vrij", ["Ga aan tafel.", "Eet samen.", "Ruim mee op."], 30),
  extraTask("Samen spelletje doen", "Familie", "vrij", extraSteps.spelen, 30),
  // Removed: "Samen koken" moved to bedtime routine tasks in the parent workflow.
  extraTask("Samen opruimen", "Familie", "vrij", ["Pak een ding.", "Leg het op zijn plek.", "Doe samen nog iets."], 15),
  extraTask("Naar mama", "Familie", "vrij", extraSteps.eropuit, 20),
  extraTask("Naar papa", "Familie", "vrij", extraSteps.eropuit, 20),

  extraTask("Speeltuin", "Buiten spelen", "vrij", extraSteps.spelen, 45),
  extraTask("Fietsen", "Buiten spelen", "vrij", extraSteps.sport, 30),
  extraTask("Game tijd", "Scherm", "vrij", extraSteps.scherm, 20),
  extraTask("TV kijken", "Scherm", "vrij", extraSteps.scherm, 20),
  extraTask("Film kijken", "Scherm", "vrij", extraSteps.scherm, 60),
  extraTask("Telefoon tijd", "Scherm", "vrij", extraSteps.scherm, 15),
  extraTask("Schermtijd", "Scherm", "vrij", extraSteps.scherm, 20),
  extraTask("Steppen", "Buiten spelen", "vrij", extraSteps.sport, 30),
  extraTask("Skateboarden", "Buiten spelen", "vrij", extraSteps.sport, 30),
  // Removed duplicate outdoor football entry; keep basketball/voetbal in sports category.
  extraTask("Stoepkrijten", "Buiten spelen", "vrij", extraSteps.spelen, 20),
  extraTask("Bellenblaas", "Buiten spelen", "vrij", extraSteps.spelen, 15),
  extraTask("Trampoline", "Buiten spelen", "vrij", extraSteps.sport, 20),
  extraTask("Zandbak", "Buiten spelen", "vrij", extraSteps.spelen, 30),
  extraTask("Water spelen", "Buiten spelen", "vrij", extraSteps.spelen, 30),
  extraTask("Hut bouwen buiten", "Buiten spelen", "vrij", extraSteps.spelen, 45),
  extraTask("Natuur zoeken", "Buiten spelen", "vrij", extraSteps.spelen, 30),
  extraTask("Takken/bladeren zoeken", "Buiten spelen", "vrij", extraSteps.spelen, 20),
  extraTask("Naar park", "Buiten spelen", "vrij", extraSteps.eropuit, 45),
  extraTask("Naar schoolplein", "Buiten spelen", "vrij", extraSteps.eropuit, 45),
  extraTask("Rondje fietsen", "Buiten spelen", "vrij", extraSteps.sport, 30),

  extraTask("Scouting", "Clubs", "naSchool", extraSteps.samen, 60),
  extraTask("Zangles", "Clubs", "naSchool", extraSteps.samen, 30),
  extraTask("Pianoles", "Clubs", "naSchool", extraSteps.samen, 30),
  extraTask("Gitaarles", "Clubs", "naSchool", extraSteps.samen, 30),
  extraTask("Drumles", "Clubs", "naSchool", extraSteps.samen, 30),
  extraTask("Tekenles", "Clubs", "naSchool", extraSteps.samen, 45),
  extraTask("Schilderles", "Clubs", "naSchool", extraSteps.samen, 45),
  extraTask("Dansles", "Clubs", "naSchool", extraSteps.samen, 45),
  extraTask("Schaakclub", "Clubs", "naSchool", extraSteps.samen, 45),
  extraTask("Techniekclub", "Clubs", "naSchool", extraSteps.samen, 45),
  extraTask("Kookclub", "Clubs", "naSchool", extraSteps.samen, 45),
  extraTask("Bibliotheek", "Clubs", "vrij", extraSteps.samen, 45),
  extraTask("Kinderkoor", "Clubs", "naSchool", extraSteps.samen, 45),

  extraTask("Skiën", "Sport", "vrij", extraSteps.sport, 60),
  extraTask("Zelfverdediging", "Sport", "naSchool", extraSteps.sport, 45),
  extraTask("Tennis", "Sport", "naSchool", extraSteps.sport, 45),
  extraTask("Badminton", "Sport", "naSchool", extraSteps.sport, 45),
  // Removed: tafeltennis is merged with tennis in the sport icon set.
  extraTask("Atletiek", "Sport", "naSchool", extraSteps.sport, 45),
  extraTask("Hardlopen", "Sport", "vrij", extraSteps.sport, 30),
  extraTask("Turnen", "Sport", "naSchool", extraSteps.sport, 45),
  // Removed: gymnastic variant merged with turnen.
  extraTask("Ballet", "Sport", "naSchool", extraSteps.sport, 45),
  extraTask("Streetdance", "Sport", "naSchool", extraSteps.sport, 45),
  extraTask("Freerunning", "Sport", "naSchool", extraSteps.sport, 45),
  extraTask("Klimmen", "Sport", "naSchool", extraSteps.sport, 45),
  extraTask("Paardrijden", "Sport", "naSchool", extraSteps.sport, 60),
  extraTask("Skeeleren", "Sport", "vrij", extraSteps.sport, 30),
  extraTask("Mountainbiken", "Sport", "vrij", extraSteps.sport, 45),
  extraTask("Voetbal", "Sport", "naSchool", extraSteps.sport, 45),
  extraTask("Hockey", "Sport", "naSchool", extraSteps.sport, 45),
  extraTask("Basketbal", "Sport", "naSchool", extraSteps.sport, 45),
  extraTask("Handbal", "Sport", "naSchool", extraSteps.sport, 45),
  extraTask("Volleybal", "Sport", "naSchool", extraSteps.sport, 45),
  extraTask("Korfbal", "Sport", "naSchool", extraSteps.sport, 45),
  extraTask("Rugby", "Sport", "naSchool", extraSteps.sport, 45),
  extraTask("Honkbal", "Sport", "naSchool", extraSteps.sport, 45),
  extraTask("Softbal", "Sport", "naSchool", extraSteps.sport, 45),
  extraTask("Waterpolo", "Sport", "naSchool", extraSteps.sport, 45)
];

const blockedTemplateTitles = new Set([
  "Schooltas checken",
  "Broodtrommel pakken",
  "Rustkaart kiezen",
  "Adem rustig in bed",
  "Vraag hulp",
  "Rustige plek kiezen",
  "Duw tegen de muur",
  "Spring 10 keer",
  "Surfskaten",
  "Game tijd",
  "Telefoon tijd",
  "Theaterles",
  "Dansen",
  "Natuurclub",
  "Knutselclub",
  "Toneelclub",
  "Programmeerclub",
  "Leesclub",
  "Jeugdclub",
  "Naar de kerk",
  "Robotica",
  "Lego-club",
  "Judo",
  "Karate",
  "Taekwondo",
  "Krav maga",
  "Kickboksen",
  "Boksen",
  "Aikido",
  "Jiujitsu",
  "Dans"
]);

const titleOverrides = new Map([
  ["Sporten", "Voetbal"],
  ["Naar school gaan", "Naar school"],
  ["Geloofsactiviteit", "Naar de kerk"]
]);

const normalizeCategory = (category: string, title: string) => {
  const lowerTitle = title.toLowerCase();
  if (["voetbal", "basketbal", "basketballen", "zwemles", "sport", "voetballen buiten", "basketballen buiten", "hockey", "tennis", "badminton", "tafeltennis", "atletiek", "hardlopen", "turnen", "gymnastiek", "ballet", "streetdance", "freerunning", "paardrijden", "ski", "waterpolo", "rugby", "korfbal", "honkbal", "softbal", "handbal", "volleybal", "judo", "karate", "taekwondo", "krav maga", "kickboksen", "boksen", "aikido", "jiujitsu"].some((word) => lowerTitle.includes(word))) return "Sport";
  if (lowerTitle.includes("zelfverdediging")) return "Sport";
  if (["Ochtend", "Slaapkamer", "Zelfzorg", "Voorbereiden", "Eten & drinken", "Helpen", "Na school", "Opruimen", "Bedtijd", "Rust", "Bewegen", "Creatief"].includes(category)) return "Dagelijkse taken";
  if (["School", "Opvang"].includes(category)) return "School & opvang";
  if (category === "Afspraken") return "Afspraken";
  if (["Sport"].includes(category)) return "Sport";
  if (category === "Clubs") return "Clubs";
  return "Vrije tijd";
};

const preparedTemplates = [...templates, ...extraTemplates]
  .filter((template) => !blockedTemplateTitles.has(template.title))
  .map((template) => ({
    ...template,
    title: titleOverrides.get(template.title) ?? template.title,
    category: normalizeCategory(template.category, titleOverrides.get(template.title) ?? template.title)
  }));

const uniqueTemplates = preparedTemplates.filter((template, index, all) => {
  const key = `${template.title.toLowerCase()}|${template.category.toLowerCase()}|${template.dayPart}`;
  return all.findIndex((item) => `${item.title.toLowerCase()}|${item.category.toLowerCase()}|${item.dayPart}` === key) === index;
});

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

export const taskTemplates: TaskTemplate[] = uniqueTemplates.flatMap((template) =>
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

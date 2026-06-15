export type TaskVisualKey =
  | "wake" | "dress" | "breakfast" | "teeth" | "school" | "coat" | "hands" | "rest" | "study" | "shower" | "pajamas" | "sleep"
  | "makeBed" | "curtains" | "hair" | "faceWash" | "medicine" | "lunchbox" | "drinkBottle" | "shoesOn" | "coatOn" | "coatHang" | "shoesOff" | "unpackBag"
  | "drinkWater" | "snack" | "outsidePlay" | "moveBreak" | "homework" | "reading" | "creative" | "toysClean" | "roomClean" | "laundry" | "setTable" | "clearTable"
  | "dishwasher" | "waterPlants" | "petFood" | "sportsBag" | "agenda" | "weekPlan" | "screenOff" | "calmCard" | "breatheBed" | "dimLight" | "askHelp" | "wallPush"
  | "outsidePlayGiraffe" | "craftGiraffe" | "drinkCupKitchen" | "headphonesRest";

const has = (text: string, words: string[]) => words.some((word) => text.includes(word));

export function getTaskVisualKey(title: string, fallback: TaskVisualKey = "rest"): TaskVisualKey {
  const text = title.toLowerCase();

  if (has(text, ["bed opmaken"])) return "makeBed";
  if (has(text, ["gordijn"])) return "curtains";
  if (has(text, ["haren", "kammen"])) return "hair";
  if (has(text, ["gezicht wassen"])) return "faceWash";
  if (has(text, ["medicijn", "vitamine"])) return "medicine";
  if (has(text, ["broodtrommel pakken"])) return "lunchbox";
  if (has(text, ["drinkbeker pakken"])) return "drinkBottle";
  if (has(text, ["drinkbeker naar keuken"])) return "drinkCupKitchen";
  if (has(text, ["schoenen aan"])) return "shoesOn";
  if (has(text, ["jas aan"])) return "coatOn";
  if (has(text, ["jas ophangen"])) return "coatHang";
  if (has(text, ["schoenen uit"])) return "shoesOff";
  if (has(text, ["tas uitpakken"])) return "unpackBag";
  if (has(text, ["tandenpoetsen", "tanden poetsen", "poetsen"])) return "teeth";
  if (has(text, ["handen wassen"])) return "hands";
  if (has(text, ["koptelefoon"])) return "headphonesRest";
  if (has(text, ["drink water", "iets drinken", "water drinken"])) return "drinkWater";
  if (has(text, ["snack"])) return "snack";
  if (has(text, ["buiten spelen"])) return "outsidePlayGiraffe";
  if (has(text, ["beweegpauze", "spring", "springen"])) return "moveBreak";
  if (has(text, ["huiswerk"])) return "homework";
  if (has(text, ["boekje lezen", "lezen"])) return "reading";
  if (has(text, ["knutselen"])) return "craftGiraffe";
  if (has(text, ["tekenen", "teken je gevoel"])) return "creative";
  if (has(text, ["speelgoed"])) return "toysClean";
  if (has(text, ["kamer 5", "kamer opruimen"])) return "roomClean";
  if (has(text, ["was in wasmand", "wasmand"])) return "laundry";
  if (has(text, ["tafel dekken"])) return "setTable";
  if (has(text, ["tafel afruimen", "bord naar de keuken"])) return "clearTable";
  if (has(text, ["vaatwasser"])) return "dishwasher";
  if (has(text, ["planten", "plant water"])) return "waterPlants";
  if (has(text, ["huisdier"])) return "petFood";
  if (has(text, ["sportspullen", "sporttas"])) return "sportsBag";
  if (has(text, ["agenda"])) return "agenda";
  if (has(text, ["weekplanning"])) return "weekPlan";
  if (has(text, ["scherm uit"])) return "screenOff";
  if (has(text, ["rustkaart"])) return "calmCard";
  if (has(text, ["adem rustig in bed"])) return "breatheBed";
  if (has(text, ["licht zachter"])) return "dimLight";
  if (has(text, ["vraag hulp"])) return "askHelp";
  if (has(text, ["duw tegen de muur"])) return "wallPush";

  if (has(text, ["ochtend", "opstaan", "wakker"])) return "wake";
  if (has(text, ["aankleden", "kleding", "shirt", "broek"])) return "dress";
  if (has(text, ["ontbijt", "eten", "drinken", "beker"])) return "breakfast";
  if (has(text, ["tanden", "poets"])) return "teeth";
  if (has(text, ["school", "tas", "broodtrommel"])) return "school";
  if (has(text, ["jas", "schoenen"])) return "coat";
  if (has(text, ["handen", "wassen"])) return "hands";
  if (has(text, ["rust", "pauze", "koptelefoon", "rustige plek"])) return "rest";
  if (has(text, ["boek", "lezen", "teken"])) return "study";
  if (has(text, ["douche", "douchen", "bad"])) return "shower";
  if (has(text, ["pyjama", "avond"])) return "pajamas";
  if (has(text, ["bed", "slapen", "bedtijd"])) return "sleep";
  return fallback;
}

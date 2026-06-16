export type TaskVisualKey =
  | "wake" | "dress" | "breakfast" | "teeth" | "school" | "coat" | "hands" | "rest" | "study" | "shower" | "pajamas" | "sleep"
  | "makeBed" | "curtains" | "hair" | "faceWash" | "medicine" | "lunchbox" | "drinkBottle" | "shoesOn" | "coatOn" | "coatHang" | "shoesOff" | "unpackBag"
  | "packBag" | "schoolBagCheck" | "lunchboxKitchen"
  | "drinkWater" | "snack" | "outsidePlay" | "moveBreak" | "homework" | "reading" | "creative" | "toysClean" | "roomClean" | "laundry" | "setTable" | "clearTable"
  | "dishwasher" | "waterPlants" | "petFood" | "sportsBag" | "agenda" | "weekPlan" | "screenOff" | "calmCard" | "breatheBed" | "dimLight" | "askHelp" | "wallPush"
  | "outsidePlayGiraffe" | "craftGiraffe" | "drinkCupKitchen" | "headphonesRest"
  | "dinner" | "sports" | "swimming" | "musicLesson" | "playdate" | "toilet" | "bsoCare" | "sunscreen" | "bike" | "fruit" | "lunchPrep"
  | "dogWalk" | "groceries" | "hairdresser" | "dentist" | "doctor" | "speechTherapy" | "physio" | "therapy" | "clothesShop" | "shoeShop" | "packagePickup" | "garage" | "parentAppointment" | "carRide" | "cityTrip" | "waitingRoom"
  | "amusementPark" | "indoorPlay" | "trampolinePark" | "pool" | "fair" | "festival" | "mall" | "restaurant" | "cinema" | "bowling" | "arcade" | "playground" | "park" | "libraryActivity" | "museum" | "theaterShow"
  | "friendVisit" | "playAtFriend" | "sleepover" | "birthdayParty" | "familyParty" | "grandparents" | "visitorsHome" | "familyVisit" | "babysitter" | "grandparentsAfterSchool" | "schoolTrip" | "studyDay" | "test" | "presentation" | "sportsDay" | "schoolParty"
  | "momTime" | "dadTime" | "siblingTime" | "bonusParentTime" | "familyDinner" | "familyWalk" | "boardGame" | "readTogether" | "cookTogether" | "tidyTogether" | "toMom" | "toDad" | "gameTime" | "movieTogether" | "phoneTime" | "dance"
  | "soccerOutside" | "basketballOutside" | "sidewalkChalk" | "bubbles" | "trampolineOutdoor" | "sandbox" | "waterPlay" | "hutBuild" | "natureSearch" | "sticksLeaves" | "scooter" | "skating" | "skateboard" | "bikeLoop" | "climbing" | "schoolyard"
  | "scouting" | "singingLesson" | "pianoLesson" | "guitarLesson" | "drumLesson" | "drawingLesson" | "paintingLesson" | "craftClub" | "dramaLesson" | "chessClub" | "techClub" | "roboticsClub" | "legoClub" | "cookingClub" | "natureClub" | "faithActivity"
  | "volleyball" | "handball" | "fieldHockey" | "tennisSport" | "tableTennis" | "badmintonSport" | "athletics" | "gymnastics" | "balletSport" | "streetdanceSport" | "freerunningSport" | "skiingSport" | "horseRiding" | "waterPoloSport" | "rugbySport" | "korfballSport" | "baseballSport" | "selfDefenseSport"
  | "soccerSport" | "basketballSport" | "readingClub" | "youthClub";

const has = (text: string, words: string[]) => words.some((word) => text.includes(word));

export function getTaskVisualKey(title: string, fallback: TaskVisualKey = "rest"): TaskVisualKey {
  const text = title.toLowerCase();

  if (has(text, ["hond uitlaten"])) return "dogWalk";
  if (has(text, ["boodschap"])) return "groceries";
  if (has(text, ["kapper"])) return "hairdresser";
  if (has(text, ["tandarts"])) return "dentist";
  if (has(text, ["huisarts", "dokter"])) return "doctor";
  if (has(text, ["logopedie"])) return "speechTherapy";
  if (has(text, ["fysio"])) return "physio";
  if (has(text, ["mee naar afspraak"])) return "parentAppointment";
  if (has(text, ["therapie", "afspraak"])) return "therapy";
  if (has(text, ["kleding kopen"])) return "clothesShop";
  if (has(text, ["schoenen kopen"])) return "shoeShop";
  if (has(text, ["pakketje"])) return "packagePickup";
  if (has(text, ["garage"])) return "garage";
  if (has(text, ["auto", "autorijden"])) return "carRide";
  if (has(text, ["stad in"])) return "cityTrip";

  if (has(text, ["pretpark"])) return "amusementPark";
  if (has(text, ["binnenspeeltuin"])) return "indoorPlay";
  if (has(text, ["trampolinepark"])) return "trampolinePark";
  if (has(text, ["zwembad"])) return "pool";
  if (has(text, ["kermis"])) return "fair";
  if (has(text, ["festival"])) return "festival";
  if (has(text, ["winkelcentrum"])) return "mall";
  if (has(text, ["restaurant"])) return "restaurant";
  if (has(text, ["bioscoop"])) return "cinema";
  if (has(text, ["bowling"])) return "bowling";
  if (has(text, ["arcade", "speelhal"])) return "arcade";
  if (has(text, ["speeltuin"])) return "playground";
  if (has(text, ["naar park"])) return "park";
  if (has(text, ["bibliotheekactiviteit"])) return "libraryActivity";

  if (has(text, ["vriendje komt", "vriendje spelen thuis"])) return "friendVisit";
  if (has(text, ["bij vriendje"])) return "playAtFriend";
  if (has(text, ["logeren"])) return "sleepover";
  if (has(text, ["kinderfeestje", "verjaardag"])) return "birthdayParty";
  if (has(text, ["familiefeest"])) return "familyParty";
  if (has(text, ["bij opa/oma na school"])) return "grandparentsAfterSchool";
  if (has(text, ["opa", "oma"])) return "grandparents";
  if (has(text, ["bezoek krijgen"])) return "visitorsHome";
  if (has(text, ["op bezoek", "familiebezoek", "neef", "nicht", "buren"])) return "familyVisit";
  if (has(text, ["gastouder", "oppas"])) return "babysitter";
  if (has(text, ["schoolreisje"])) return "schoolTrip";
  if (has(text, ["studiedag"])) return "studyDay";
  if (has(text, ["toets"])) return "test";
  if (has(text, ["spreekbeurt"])) return "presentation";
  if (has(text, ["sportdag"])) return "sportsDay";
  if (has(text, ["schoolfeest", "rapport"])) return "schoolParty";
  if (has(text, ["studiedag"])) return "studyDay";
  if (has(text, ["naar de kerk", "geloofsactiviteit", "kerk", "moskee", "tempel"])) return "faithActivity";

  if (has(text, ["tijd met mama"])) return "momTime";
  if (has(text, ["tijd met papa"])) return "dadTime";
  if (has(text, ["broer", "zus"])) return "siblingTime";
  if (has(text, ["bonusouder"])) return "bonusParentTime";
  if (has(text, ["samen eten"])) return "familyDinner";
  if (has(text, ["samen wandelen"])) return "familyWalk";
  if (has(text, ["spelletje"])) return "boardGame";
  if (has(text, ["samen lezen"])) return "readTogether";
  if (has(text, ["samen koken"])) return "cookTogether";
  if (has(text, ["samen opruimen"])) return "tidyTogether";
  if (has(text, ["naar mama"])) return "toMom";
  if (has(text, ["naar papa"])) return "toDad";
  if (has(text, ["game tijd"])) return "gameTime";
  if (has(text, ["film kijken", "tv kijken"])) return "movieTogether";
  if (has(text, ["telefoon tijd", "schermtijd"])) return "phoneTime";
  if (has(text, ["dansen"])) return "dance";

  if (has(text, ["voetbal"])) return "soccerSport";
  if (has(text, ["basketbal"])) return "basketballSport";
  if (has(text, ["basketballen buiten"])) return "basketballSport";
  if (has(text, ["basketbal buiten"])) return "basketballSport";
  if (has(text, ["volleyball"])) return "volleyball";
  if (has(text, ["handbal"])) return "handball";
  if (has(text, ["hockey"])) return "fieldHockey";
  if (has(text, ["tennis"])) return "tennisSport";
  if (has(text, ["tafeltennis"])) return "tableTennis";
  if (has(text, ["badminton"])) return "badmintonSport";
  if (has(text, ["atletiek", "hardlopen"])) return "athletics";
  if (has(text, ["turnen", "gymnastiek"])) return "gymnastics";
  if (has(text, ["ballet"])) return "balletSport";
  if (has(text, ["streetdance"])) return "streetdanceSport";
  if (has(text, ["freerunning"])) return "freerunningSport";
  if (has(text, ["ski", "skiën"])) return "skiingSport";
  if (has(text, ["paardrijden"])) return "horseRiding";
  if (has(text, ["waterpolo"])) return "waterPoloSport";
  if (has(text, ["rugby"])) return "rugbySport";
  if (has(text, ["korfbal"])) return "korfballSport";
  if (has(text, ["honkbal", "softbal"])) return "baseballSport";
  if (has(text, ["zelfverdediging", "judo", "karate", "taekwondo", "krav maga", "kickboksen", "boksen", "aikido", "jiujitsu"])) return "selfDefenseSport";
  if (has(text, ["stoepkrijt"])) return "sidewalkChalk";
  if (has(text, ["bellenblaas"])) return "bubbles";
  if (has(text, ["trampoline"])) return "trampolineOutdoor";
  if (has(text, ["zandbak"])) return "sandbox";
  if (has(text, ["water spelen"])) return "waterPlay";
  if (has(text, ["hut bouwen"])) return "hutBuild";
  if (has(text, ["natuur zoeken"])) return "natureSearch";
  if (has(text, ["takken", "bladeren"])) return "sticksLeaves";
  if (has(text, ["steppen"])) return "scooter";
  if (has(text, ["skaten", "skeeleren", "schaatsen"])) return "skating";
  if (has(text, ["skateboard", "surfskaten"])) return "skateboard";
  if (has(text, ["rondje fietsen", "mountainbiken"])) return "bikeLoop";
  if (has(text, ["klimmen", "boulderen"])) return "climbing";
  if (has(text, ["schoolplein"])) return "schoolyard";

  if (has(text, ["scouting"])) return "scouting";
  if (has(text, ["zangles", "kinderkoor"])) return "singingLesson";
  if (has(text, ["pianoles"])) return "pianoLesson";
  if (has(text, ["gitaarles"])) return "guitarLesson";
  if (has(text, ["drumles"])) return "drumLesson";
  if (has(text, ["tekenles"])) return "drawingLesson";
  if (has(text, ["schilderles"])) return "paintingLesson";
  if (has(text, ["knutselclub"])) return "craftClub";
  if (has(text, ["theaterles", "toneelclub"])) return "dramaLesson";
  if (has(text, ["schaakclub"])) return "chessClub";
  if (has(text, ["techniekclub"])) return "techClub";
  if (has(text, ["lego"])) return "legoClub";
  if (has(text, ["kookclub"])) return "cookingClub";
  if (has(text, ["natuurclub"])) return "natureClub";
  if (has(text, ["geloofsactiviteit", "kerk", "moskee", "tempel"])) return "faithActivity";
  if (has(text, ["leesclub"])) return "readingClub";
  if (has(text, ["jeugdclub"])) return "youthClub";
  if (has(text, ["vader/bonusouder", "bonusouder"])) return "bonusParentTime";
  if (has(text, ["programmeerclub", "robotica"])) return "roboticsClub";
  if (has(text, ["dansles"])) return "dance";
  if (has(text, ["wandelen"])) return "familyWalk";
  
  if (has(text, ["tennis", "badminton", "tafeltennis", "hockey", "handbal", "volleybal", "korfbal", "rugby", "honkbal", "softbal", "waterpolo"])) return "sports";
  if (has(text, ["atletiek", "hardlopen", "turnen", "gymnastiek", "ballet", "streetdance", "hiphop", "freerunning", "paardrijden", "ski"])) return "sports";

  if (has(text, ["bed opmaken"])) return "makeBed";
  if (has(text, ["gordijn"])) return "curtains";
  if (has(text, ["haren", "kammen"])) return "hair";
  if (has(text, ["gezicht wassen"])) return "faceWash";
  if (has(text, ["medicijn", "vitamine"])) return "medicine";
  if (has(text, ["schooltas checken"])) return "schoolBagCheck";
  if (has(text, ["tas pakken"])) return "packBag";
  if (has(text, ["broodtrommel naar keuken"])) return "lunchboxKitchen";
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
  if (has(text, ["avond eten", "avondeten", "warm eten", "diner"])) return "dinner";
  if (has(text, ["sporten", "training", "voetbal", "hockey", "gymles", "turnen", "dansen"])) return "sports";
  if (has(text, ["zwemles", "zwemmen"])) return "swimming";
  if (has(text, ["muziekles", "pianoles", "gitaarles", "drumles", "muziek oefenen"])) return "musicLesson";
  if (has(text, ["speelafspraak", "spelen bij", "vriendje", "vriendinnetje"])) return "playdate";
  if (has(text, ["wc", "toilet", "plassen", "poepen"])) return "toilet";
  if (has(text, ["bso", "opvang", "naschoolse opvang"])) return "bsoCare";
  if (has(text, ["zonnebrand", "insmeren"])) return "sunscreen";
  if (has(text, ["fietsen", "fiets", "helm op"])) return "bike";
  if (has(text, ["fruit eten", "fruit"])) return "fruit";
  if (has(text, ["lunch maken", "brood smeren", "sandwich", "lunch klaarmaken"])) return "lunchPrep";
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

import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { registerSW } from "virtual:pwa-register";
import { ArrowLeft, BookOpen, CalendarDays, Check, Database, HeartHandshake, HelpCircle, Minus, Palette, Pause, Play, Plus, RotateCcw, ShieldCheck, Sparkles, Trash2, X } from "lucide-react";
import { avatarAssets } from "../data/avatars";
import { calmStrategies } from "../data/calmStrategies";
import { emotions, unsureEmotions } from "../data/emotions";
import { needs } from "../data/needs";
import { exportBackup, importBackup } from "../db/backup";
import { db } from "../db/db";
import { seedDatabase } from "../db/seed";
import { useLiveData } from "../hooks/useLiveData";
import { useCurrentFlow } from "../state/appStore";
import "../styles/index.css";
import type { Avatar, CalmStrategy, DayPart, EmotionType, NeedType, PracticeExercise, Reward, Task, TaskTemplate, WeekDay } from "../types/schema";
import { AppShell, AvatarMascot, ChildTaskCard, DayPartCard, EmotionCard, ExerciseArt, icons, NeedCard, PageHeader, ParentCard, PrimaryButton, SecondaryButton, TaskArt, TaskCard } from "../components/ui";
import type { TaskVisualKey } from "../utils/taskVisuals";

const dayParts: Record<DayPart, { title: string; icon: string }> = {
  ochtend: { title: "Ochtend", icon: "\u2600\uFE0F" },
  naSchool: { title: "Na school", icon: "\uD83C\uDF92" },
  avond: { title: "Avond", icon: "\uD83C\uDF19" },
  bedtijd: { title: "Bedtijd", icon: "\uD83D\uDECC" },
  vrij: { title: "Vrij", icon: "\u2B50" }
};

const isDayPart = (value: string | null): value is DayPart => Boolean(value && value in dayParts);
const safeReturnPath = (value: string | null) => value?.startsWith("/") ? value : null;
const weekDays: { id: WeekDay; label: string; short: string }[] = [
  { id: "maandag", label: "Maandag", short: "Ma" },
  { id: "dinsdag", label: "Dinsdag", short: "Di" },
  { id: "woensdag", label: "Woensdag", short: "Wo" },
  { id: "donderdag", label: "Donderdag", short: "Do" },
  { id: "vrijdag", label: "Vrijdag", short: "Vr" },
  { id: "zaterdag", label: "Zaterdag", short: "Za" },
  { id: "zondag", label: "Zondag", short: "Zo" }
];
const isWeekDay = (value: string | null): value is WeekDay => Boolean(value && weekDays.some((day) => day.id === value));
const currentWeekDay = (): WeekDay => weekDays[((new Date().getDay() || 7) - 1)].id;
const weekDayLabel = (day: WeekDay) => weekDays.find((item) => item.id === day)?.label ?? "Vandaag";
const isWeekendWeekDay = (day: WeekDay | null) => day === "zaterdag" || day === "zondag";
const dayPartTitle = (part: DayPart, weekDay: WeekDay | null = null) =>
  part === "naSchool" && isWeekendWeekDay(weekDay) ? "Middag" : dayParts[part].title;
const taskRunsOnDay = (task: Task, weekDay: WeekDay | null) => !weekDay || !task.weekDays?.length || task.weekDays.includes(weekDay);
const weekDayQuery = (weekDay: WeekDay | null) => weekDay ? `?weekDay=${weekDay}` : "";
const returnToWithWeekDay = (path: string, weekDay: WeekDay | null) => `${path}${weekDayQuery(weekDay)}`;
const parentUnlockKey = "flowi:parentUnlockedAt";
const parentUnlockWindowMs = 15 * 60 * 1000;
const normalizeTaskTitle = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const blockedLibraryTaskTitles = new Set([
  "schooltas checken",
  "broodtrommel pakken",
  "rustkaart kiezen",
  "adem rustig in bed",
  "vraag hulp",
  "rustige plek kiezen",
  "duw tegen de muur",
  "spring 10 keer",
  "surfskaten",
  "game tijd",
  "telefoon tijd",
  "theaterles",
  "dansen",
  "natuurclub",
  "knutselclub",
  "toneelclub",
  "programmeerclub",
  "leesclub",
  "jeugdclub",
  "naar de kerk",
  "robotica",
  "lego-club",
  "judo",
  "karate",
  "taekwondo",
  "krav maga",
  "kickboksen",
  "boksen",
  "aikido",
  "jiujitsu"
].map((value) => normalizeTaskTitle(value)));
const shortExerciseTitle = (title: string) => ({
  "Ruik bloem, blaas kaars": "Bloem & kaars",
  "Maak je lijf zwaar": "Lijf zwaar",
  "Kijk naar \u00E9\u00E9n ding": "Kijk naar 1 ding",
  "5 dingen zien": "5 dingen",
  "Schud je armen los": "Armen los",
  "Maak \u00E9\u00E9n kleine keuze": "Kleine keuze",
  "Hulpzin oefenen": "Hulpzin",
  "Maak je gezicht zacht": "Gezicht zacht",
  "Robot en lappenpop": "Robot/lappenpop",
  "Handen tegen elkaar": "Handen duwen",
  "Boos op veilige plek": "Veilig boos",
  "Kies uit je rustdoos": "Rustdoos",
  "Ga naar je rustige plek": "Rustige plek",
  "Zeg: stop, ik heb hulp nodig": "Vraag hulp",
  "Pak iets zachts": "Iets zachts"
} as Record<string, string>)[title] ?? title;
const normalizeWeekDaySelection = (selection?: WeekDay[]) => selection?.length ? selection : weekDays.map((day) => day.id);
const weekDaySelectionsOverlap = (left?: WeekDay[], right?: WeekDay[]) => {
  const leftDays = normalizeWeekDaySelection(left);
  const rightDays = normalizeWeekDaySelection(right);
  return leftDays.some((day) => rightDays.includes(day));
};
const duplicateTaskDaysLabel = (days: WeekDay[]) => {
  if (!days.length) return "deze dag";
  if (days.length === 1) return weekDayLabel(days[0]).toLowerCase();
  if (days.length === weekDays.length) return "meerdere dagen";
  return days.map((day) => weekDayLabel(day).toLowerCase()).join(", ");
};
const findDuplicateTask = (tasks: Task[], input: { title: string; dayPart: DayPart; weekDays?: WeekDay[]; excludeTaskId?: string }) => {
  const normalizedTitle = normalizeTaskTitle(input.title);
  return tasks.find((task) =>
    task.id !== input.excludeTaskId &&
    task.dayPart === input.dayPart &&
    normalizeTaskTitle(task.title) === normalizedTitle &&
    weekDaySelectionsOverlap(task.weekDays, input.weekDays)
  );
};
const confirmDuplicateTask = (existingTask: Task, input: { title: string; dayPart: DayPart; weekDays?: WeekDay[] }) => {
  const inputDays = normalizeWeekDaySelection(input.weekDays);
  const overlappingDays = normalizeWeekDaySelection(existingTask.weekDays).filter((day) => inputDays.includes(day));
  return window.confirm(
    `"${input.title}" staat al bij ${dayPartTitle(input.dayPart)} op ${duplicateTaskDaysLabel(overlappingDays)}. Wil je deze taak daar toch nog een keer toevoegen?`
  );
};
const exerciseCaregiverTip = (exercise: PracticeExercise) => ({
  blaadjesadem: "Je kunt rustig meeademen en het tempo laag houden. Samen vertragen is hier vaak belangrijker dan precies goed ademen.",
  ballonadem: "Het helpt vaak om samen te voelen wat de buik doet. Een hand op de buik en jouw rustige voordoen is meestal al genoeg.",
  "bloem-kaars": "Veel kinderen snappen deze oefening meteen als je hem eerst even voordoet. Kort en speels werkt hier vaak het fijnst.",
  "hand-op-hart": "Als de woorden niet passen, is dat helemaal niet erg. Alleen de hand op het hart en rustig ademen kan al helpend zijn.",
  "zware-deken": "Kijk samen welke houding prettig voelt. Rustig benoemen wat zwaar mag worden is vaak al voldoende.",
  "kijk-een-ding": "Je kunt samen één vast punt kiezen als dat helpt. Hoe minder er verder hoeft, hoe rustiger deze oefening meestal werkt.",
  "vijf-dingen-zien": "Als vijf stappen veel voelt, mag het ook kleiner. Samen drie dingen zien kan net zo goed passend zijn.",
  "muur-duwen": "Het helpt vaak als je even voordoet hoe stevig maar veilig duwen eruitziet. Je kunt stoppen zodra je merkt dat de spanning zakt.",
  "spring-ster": "Een beetje ruimte en zacht landen helpt hier vaak goed. Deze oefening werkt vooral fijn om energie eruit te laten, zonder extra drukte te maken.",
  "armen-schudden": "Je kunt samen groot beginnen en langzaam naar stil gaan. Juist dat rustige afbouwen maakt deze oefening vaak helpend.",
  dierenloop: "Eén dier tegelijk is meestal al genoeg. Rustig meedoen of nadoen houdt het overzichtelijk.",
  "eerste-stap": "Het helpt vaak als alleen stap één in beeld blijft. Zo voelt beginnen kleiner en beter te overzien.",
  "mini-keuze": "Twee eenvoudige opties zijn hier vaak al genoeg. Minder woorden en minder keuzes geven meestal meer rust.",
  "vraag-hulp": "Je kunt de zin samen oefenen zonder druk. Als er daarna meteen helpend gereageerd wordt, voelt hulp vragen vaak veiliger.",
  "stop-zin": "Deze zin oefenen op een rustig moment helpt vaak voor later. Een korte, voorspelbare reactie maakt hem nog bruikbaarder.",
  "teken-wolk": "Tekenen mag hier vooral een uitlaat zijn. Alleen meekijken als het kind dat prettig vindt is vaak al genoeg.",
  "kleur-rust": "Rustig kleuren werkt vaak fijner met weinig materiaal tegelijk. Dan hoeft een kind niet ook nog veel te kiezen.",
  "schildpad-pauze": "Je kunt dichtbij blijven terwijl het kind zichzelf klein maakt. Rustig weer samen omhoogkomen helpt vaak goed.",
  "voeten-voelen": "Alleen benoemen wat nu de volgende stap is, helpt hier vaak het meest. De rust zit vooral in vertragen en voelen.",
  "kaak-los": "Veel kinderen vinden dit makkelijker als je het zelf even voordoet. Samen nadoen kan meer helpen dan uitleggen.",
  "robot-lappenpop": "Het verschil tussen stevig en slap mag speels blijven. Als je merkt dat aanspannen juist te veel doet, kun je rustig eerder stoppen.",
  "handen-duwen": "Dit kan een fijne kleinere versie zijn van duwen tegen de muur. Rustig meetellen en daarna even stilte laten vallen helpt vaak goed.",
  slakkenstap: "Soms helpt het al als jij gewoon even meeloopt in hetzelfde trage tempo. Hoe minder er verder hoeft, hoe beter deze oefening vaak landt.",
  waterpauze: "Hier helpt vooral het samen vertragen. Het gaat niet alleen om drinken, maar om even rust maken in het moment.",
  "geluid-zachter": "Als het lukt om de prikkel echt kleiner te maken, merk je vaak meteen verschil. Het helpt als er daarna niet te veel extra gevraagd wordt.",
  "licht-zachter": "Samen kijken of licht of plek aangepast kan worden geeft vaak snel meer rust. Minder fel en minder visuele druk helpt veel kinderen direct.",
  "wacht-hand": "Deze oefening werkt vaak fijn bij korte wachttijd. Duidelijk maken wanneer het wachten klaar is, geeft extra houvast.",
  "samen-plan": "Een klein plan met nu en straks voelt vaak overzichtelijker. Zo blijft de eerste stap goed te doen.",
  duimkeuze: "Deze oefening werkt vaak het best als er meteen rustig gereageerd wordt op wat het kind laat zien. Dan voelt die keuze ook echt veilig.",
  "veilig-boos": "Dichtbij blijven en samen een veilige plek kiezen helpt hier vaak goed. Boze energie mag eruit, zolang dat veilig blijft voor kind, ander en omgeving.",
  slaapadem: "Een zachte stem en weinig extra prikkels helpen hier meestal het meest. Bij moeheid werkt minder vaak beter dan meer.",
  "regenboog-adem": "Groot en rustig voordoen maakt deze oefening vaak meteen duidelijk. Een laag tempo helpt om hem ook echt rustgevend te houden.",
  "wiebelen-stoppen": "Samen het verschil voelen tussen bewegen en stil worden maakt deze oefening vaak sterk. Korte, duidelijke stiltes zijn meestal genoeg.",
  "rustdoos-kiezen": "Rustig samen kiezen uit één ding tegelijk helpt vaak meer dan veel opties aanbieden. Zo blijft het overzichtelijk."
} as Record<string, string>)[exercise.id] ?? "Blijf rustig dichtbij en houd de oefening klein en duidelijk.";
const actionHelpOptions = (title: string) => {
  const text = title.toLowerCase();
  if (text.includes("knuffel") || text.includes("zachts") || text.includes("kussen")) return ["Blijf even bij mij", "Doe het met mij samen", "Help mij weer rustig worden"];
  if (text.includes("adem") || text.includes("hart")) return ["Adem met mij mee", "Doe het rustig voor", "Blijf even dichtbij"];
  if (text.includes("muur") || text.includes("stamp") || text.includes("spring") || text.includes("schud") || text.includes("dierenloop")) return ["Doe eerst één keer voor", "Blijf erbij", "Help mij weer stoppen"];
  if (text.includes("keuze") || text.includes("samen") || text.includes("hulp nodig") || text.includes("ik weet het even niet")) return ["Kies met mij mee", "Wijs stap één aan", "Blijf even bij mij"];
  if (text.includes("rustige plek") || text.includes("deken") || text.includes("licht") || text.includes("koptelefoon")) return ["Ga met mij mee", "Blijf in de buurt", "Maak het samen rustig"];
  return ["Kom even bij mij", "Doe het rustig voor", "Blijf even bij mij"];
};
const shortTaskTitle = (title: string) => ({
  "Tandenpoetsen ochtend": "Tandenpoetsen",
  "Tandenpoetsen avond": "Tandenpoetsen",
  "Medicijn of vitamine met ouder": "Medicijn/vitamine",
  "Naar de wc voor vertrek": "Naar de wc",
  "Handen wassen na school": "Handen wassen",
  "Broodtrommel naar keuken": "Broodtrommel weg",
  "Drinkbeker naar keuken": "Drinkbeker weg",
  "Kamer 5 minuten opruimen": "Kamer opruimen",
  "Huisdier eten geven met hulp": "Huisdier eten",
  "Sportspullen klaarleggen": "Sportspullen klaar",
  "Adem rustig in bed": "Rustig ademen",
  "Rustige plek kiezen": "Rustige plek",
  "Planten water geven": "Planten water"
} as Record<string, string>)[title] ?? title;
const actionCompletionLabel = (title: string, emotion?: EmotionType) => {
  const text = title.toLowerCase();
  if (emotion === "rustig") {
    if (text.includes("fijn")) return "Je wist goed wat fijn voelde.";
    if (text.includes("rustkracht") || text.includes("water")) return "Je gaf je rust aandacht.";
    return "Je voelde wat bij je paste.";
  }
  if (emotion === "blij") return "Je hield je fijne gevoel goed vast.";
  if (text.includes("knuffel") || text.includes("zachts") || text.includes("kussen")) return "Je koos iets zachts voor jezelf.";
  if (text.includes("adem") || text.includes("hart")) return "Je maakte ruimte om rustiger te ademen.";
  if (text.includes("muur") || text.includes("stamp") || text.includes("spring") || text.includes("schud") || text.includes("dierenloop")) return "Je gaf je lijf een helpend stapje.";
  if (text.includes("hulp") || text.includes("samen") || text.includes("keuze")) return "Je liet zien wat je nodig had.";
  if (text.includes("rustige plek") || text.includes("deken") || text.includes("licht") || text.includes("koptelefoon")) return "Je koos een rustig plekje voor jezelf.";
  return "Je koos een helpend stapje.";
};

function growthResponseForReward(reward?: Reward) {
  if (!reward) {
    return {
      title: "Flowi wacht bij jouw boom.",
      subtitle: "Elke kleine stap helpt jouw boom groeien.",
      careMode: "heart" as const
    };
  }

  const reason = reward.reason.toLowerCase();
  const label = reward.label.toLowerCase();
  const combined = `${label} ${reason}`;

  if (combined.includes("gevoel") || combined.includes("voelde") || combined.includes("liet zien")) {
    return {
      title: "Flowi zag dat jij liet zien wat er in je was.",
      subtitle: "Je boom krijgt lieve hartjes voor jouw gevoel.",
      careMode: "heart" as const
    };
  }
  if (combined.includes("adem") || combined.includes("rust") || combined.includes("zacht")) {
    return {
      title: "Flowi zag dat jij rust vond.",
      subtitle: "Je boom krijgt rustig water om verder te groeien.",
      careMode: "water" as const
    };
  }
  if (combined.includes("hulp") || combined.includes("samen") || combined.includes("woorden")) {
    return {
      title: "Flowi zag dat jij liet zien wat je nodig had.",
      subtitle: "Je boom krijgt lieve hartjes omdat jij hulp durfde vragen.",
      careMode: "heart" as const
    };
  }
  if (combined.includes("boos") || combined.includes("muur") || combined.includes("stamp") || combined.includes("springen") || combined.includes("bewoog")) {
    return {
      title: "Flowi zag dat jij je grote gevoel een veilige plek gaf.",
      subtitle: "Je boom krijgt water na jouw sterke stap.",
      careMode: "water" as const
    };
  }
  if (combined.includes("tek") || combined.includes("kleur") || combined.includes("gevoel")) {
    return {
      title: "Flowi zag jouw gevoel naar buiten komen.",
      subtitle: "Je boom krijgt hartjes omdat jij liet zien wat er in je zat.",
      careMode: "heart" as const
    };
  }
  if (combined.includes("koos") || combined.includes("begon") || combined.includes("kleine keuze")) {
    return {
      title: "Flowi zag dat jij een eerste stap zette.",
      subtitle: "De zon schijnt even op jouw boom omdat jij bent begonnen.",
      careMode: "sun" as const
    };
  }
  if (combined.includes("fijn") || combined.includes("blij") || combined.includes("rustkracht")) {
    return {
      title: "Flowi zag iets fijns groeien in jou.",
      subtitle: "Je boom krijgt warme zon en groeit rustig verder.",
      careMode: "sun" as const
    };
  }

  return {
    title: reward.label,
    subtitle: "Jouw boom groeit door wat jij net hebt gedaan.",
    careMode: "heart" as const
  };
}

const today = () => new Date().toISOString().slice(0, 10);
const id = () => crypto.randomUUID();
const now = () => new Date().toISOString();
const addGrowthReward = (label: string, reason: string) => db.rewards.add({ id: id(), childProfileId: "default-child", label, icon: "*", reason, earnedAt: now() });
const clampTimerSeconds = (seconds: number) => Math.min(300, Math.max(60, Math.round(seconds / 60) * 60));
const backupFileAccept = ".json,application/json,text/plain,application/octet-stream";
type ParentGateQuestion = { first: number; second: number; operator: "+" | "-"; answer: number };
const makeParentGateQuestion = (): ParentGateQuestion => {
  if (Math.random() < 0.7) {
    const first = Math.floor(Math.random() * 5) + 2;
    const second = Math.floor(Math.random() * 4) + 1;
    return { first, second, operator: "+", answer: first + second };
  }

  const first = Math.floor(Math.random() * 5) + 4;
  const second = Math.floor(Math.random() * Math.min(first - 1, 4)) + 1;
  return { first, second, operator: "-", answer: first - second };
};
const readParentUnlock = () => {
  const stored = Number(sessionStorage.getItem(parentUnlockKey) ?? "0");
  return Number.isFinite(stored) && Date.now() - stored < parentUnlockWindowMs;
};
const unlockParentMode = () => sessionStorage.setItem(parentUnlockKey, String(Date.now()));
const requestPersistentStorage = async () => {
  if (!("storage" in navigator) || !navigator.storage?.persist) return false;
  try {
    return await navigator.storage.persist();
  } catch {
    return false;
  }
};

const restoreBackupFile = async (file: File | undefined, setMessage: (message: string) => void) => {
  if (!file) return;
  if (!confirm("Hiermee vervang je de huidige gegevens op dit apparaat.")) return;
  try {
    await importBackup(JSON.parse(await file.text()));
    setMessage("Backup teruggezet. Flowi herlaadt nu.");
    window.setTimeout(() => location.reload(), 700);
  } catch {
    setMessage("Dit bestand kon Flowi niet lezen. Kies een Flowi-backupbestand.");
  }
};

async function savePositiveMoment(emotion: EmotionType, reason: string, actionId?: string) {
  const fallbackNeed: NeedType = emotion === "blij" ? "creatief" : "ademen";
  const action = actionId
    ? calmStrategies.find((strategy) => strategy.id === actionId)
    : chooseStrategy(emotion, fallbackNeed);
  await db.emotionHistory.add({
    id: id(),
    childProfileId: "default-child",
    emotionType: emotion,
    needType: fallbackNeed,
    actionId: action?.id ?? calmStrategies[0].id,
    helpedRating: "Fijn gevoel vastgehouden",
    note: reason,
    createdAt: now()
  });
  await addGrowthReward(
    emotion === "blij" ? "Ik liet een fijn gevoel groeien" : "Ik voelde rust in mijn lijf",
    reason
  );
}
const isLocalPreview = ["localhost", "127.0.0.1"].includes(window.location.hostname);

if (isLocalPreview && "serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => registrations.forEach((registration) => registration.unregister()));
  if ("caches" in window) {
    caches.keys().then((keys) => keys.forEach((key) => caches.delete(key)));
  }
}

const updateSW = isLocalPreview ? (() => undefined) : registerSW({
  immediate: true,
  onNeedRefresh() {
    updateSW(true);
  },
  onRegisteredSW(_swUrl, registration) {
    window.setInterval(() => {
      registration?.update();
    }, 15 * 60 * 1000);
  }
});
const startOfWeek = () => {
  const date = new Date();
  const day = date.getDay() || 7;
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - day + 1);
  return date.toISOString().slice(0, 10);
};
type HelpReason = Extract<EmotionType, "teVeel" | "boos" | "spannend" | "moe" | "inDeWar">;
const taskVisualOptions: { key: TaskVisualKey; label: string; hint: string }[] = [
  { key: "wake", label: "Opstaan", hint: "ochtend, wakker worden" },
  { key: "dress", label: "Aankleden", hint: "kleren, jas, schoenen" },
  { key: "breakfast", label: "Eten", hint: "ontbijt, drinken" },
  { key: "teeth", label: "Tanden", hint: "poetsen, badkamer" },
  { key: "school", label: "School", hint: "tas, naar school" },
  { key: "hands", label: "Wassen", hint: "handen, schoon" },
  { key: "rest", label: "Rust", hint: "pauze, rustig plekje" },
  { key: "shower", label: "Douchen", hint: "bad, douche" },
  { key: "pajamas", label: "Pyjama", hint: "avondroutine" },
  { key: "sleep", label: "Slapen", hint: "bedtijd, naar bed" },
  { key: "makeBed", label: "Bed opmaken", hint: "slaapkamer, dekbed" },
  { key: "curtains", label: "Gordijnen open", hint: "raam, ochtendlicht" },
  { key: "hair", label: "Haren kammen", hint: "spiegel, borstel" },
  { key: "faceWash", label: "Gezicht wassen", hint: "wastafel, fris" },
  { key: "medicine", label: "Medicijn", hint: "samen met ouder" },
  { key: "lunchbox", label: "Broodtrommel", hint: "in de schooltas" },
  { key: "drinkBottle", label: "Drinkbeker", hint: "beker in tas" },
  { key: "shoesOn", label: "Schoenen aan", hint: "klaar om te gaan" },
  { key: "coatOn", label: "Jas aan", hint: "naar buiten" },
  { key: "coatHang", label: "Jas ophangen", hint: "thuiskomen" },
  { key: "shoesOff", label: "Schoenen uit", hint: "op hun plek" },
  { key: "unpackBag", label: "Tas uitpakken", hint: "na school" },
  { key: "packBag", label: "Tas pakken", hint: "spullen in tas" },
  { key: "schoolBagCheck", label: "Tas checken", hint: "lunch en beker" },
  { key: "drinkWater", label: "Water drinken", hint: "slokjes nemen" },
  { key: "drinkCupKitchen", label: "Beker opruimen", hint: "beker naar keuken" },
  { key: "lunchboxKitchen", label: "Broodtrommel opruimen", hint: "naar keuken" },
  { key: "snack", label: "Snack eten", hint: "rustig aan tafel" },
  { key: "fruit", label: "Fruit eten", hint: "appel, banaan, druiven" },
  { key: "dinner", label: "Avond eten", hint: "warm eten aan tafel" },
  { key: "lunchPrep", label: "Lunch maken", hint: "brood smeren, lunchbox" },
  { key: "outsidePlayGiraffe", label: "Buiten spelen", hint: "tuin, bal, bellen" },
  { key: "sports", label: "Sporten", hint: "bal, training, gym" },
  { key: "swimming", label: "Zwemles", hint: "zwembad, zwembril" },
  { key: "bike", label: "Fietsen", hint: "fiets, helm, naar school" },
  { key: "musicLesson", label: "Muziekles", hint: "muziek maken, oefenen" },
  { key: "playdate", label: "Speelafspraak", hint: "samen spelen" },
  { key: "moveBreak", label: "Bewegen", hint: "springen, wiebelen" },
  { key: "homework", label: "Huiswerk", hint: "boek, potlood" },
  { key: "reading", label: "Lezen", hint: "boekje lezen" },
  { key: "craftGiraffe", label: "Knutselen", hint: "plakken, maken" },
  { key: "creative", label: "Tekenen", hint: "potlood, papier" },
  { key: "toysClean", label: "Speelgoed opruimen", hint: "mand, kamer" },
  { key: "roomClean", label: "Kamer opruimen", hint: "bed, spullen" },
  { key: "laundry", label: "Wasmand", hint: "vieze was" },
  { key: "setTable", label: "Tafel dekken", hint: "bord, bestek" },
  { key: "clearTable", label: "Tafel afruimen", hint: "naar keuken" },
  { key: "dishwasher", label: "Vaatwasser", hint: "helpen in keuken" },
  { key: "waterPlants", label: "Planten water", hint: "gieter, plant" },
  { key: "petFood", label: "Huisdier eten", hint: "samen zorgen" },
  { key: "sportsBag", label: "Sportspullen", hint: "tas, sport" },
  { key: "agenda", label: "Agenda", hint: "morgen bekijken" },
  { key: "weekPlan", label: "Weekplanning", hint: "planningbord" },
  { key: "screenOff", label: "Scherm uit", hint: "tablet weg" },
  { key: "calmCard", label: "Rustkaart", hint: "kies rust" },
  { key: "breatheBed", label: "Ademen in bed", hint: "rustige adem" },
  { key: "dimLight", label: "Licht zachter", hint: "lampje dimmen" },
  { key: "headphonesRest", label: "Koptelefoon", hint: "rust met geluid" },
  { key: "toilet", label: "Wc", hint: "plassen, toilet" },
  { key: "bsoCare", label: "BSO", hint: "opvang na school" },
  { key: "sunscreen", label: "Zonnebrand", hint: "insmeren" },
  { key: "askHelp", label: "Vraag hulp", hint: "hand, ouder" },
  { key: "wallPush", label: "Duw tegen muur", hint: "stevig duwen" }
];
const parseTaskTimeValue = (value?: string) => {
  if (!value || !/^\d{2}:\d{2}$/.test(value)) return null;
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
};
const sortTasksForSchedule = (tasks: Task[]) => [...tasks].sort((a, b) => {
  const aTime = parseTaskTimeValue(a.optionalTime);
  const bTime = parseTaskTimeValue(b.optionalTime);
  if (aTime !== null && bTime !== null && aTime !== bTime) return aTime - bTime;
  if (aTime !== null && bTime === null) return -1;
  if (aTime === null && bTime !== null) return 1;
  return (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.createdAt.localeCompare(b.createdAt);
});
const sortTasks = (tasks: Task[]) => [...tasks].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.createdAt.localeCompare(b.createdAt));
const normalizeDayPartTaskOrder = async (dayPart: DayPart) => {
  const tasks = await db.tasks.where("dayPart").equals(dayPart).toArray();
  const orderedTasks = sortTasksForSchedule(tasks);
  await db.transaction("rw", db.tasks, async () => {
    await Promise.all(orderedTasks.map((task, index) => db.tasks.update(task.id, { sortOrder: index, updatedAt: now() })));
  });
};
const helpReasons: { id: HelpReason; label: string; need: NeedType; tips: string[] }[] = [
  { id: "teVeel", label: "Te veel", need: "rustigePlek", tips: ["Maak de taak kleiner.", "Kies minder prikkels: zachter licht, minder geluid.", "Doe eerst 5 rustige ademhalingen."] },
  { id: "boos", label: "Boos", need: "bewegen", tips: ["Stop even met de taak.", "Geef je lijf stevig werk.", "Vraag daarna samen wat de eerste kleine stap is."] },
  { id: "spannend", label: "Spannend", need: "praatMetOuder", tips: ["Blijf niet alleen met de taak.", "Kies samen een eerste kleine stap.", "Laat iemand even bij je blijven."] },
  { id: "moe", label: "Moe", need: "rustigePlek", tips: ["Neem een korte pauze.", "Maak de taak lichter of doe alleen de eerste stap.", "Vraag of iemand even naast je blijft."] },
  { id: "inDeWar", label: "In de war", need: "praatMetOuder", tips: ["Vraag je ouder: geef mij twee keuzes.", "Laat iemand de taak voordoen.", "Doe samen alleen de eerste stap."] }
];

function helpOverlayText(reason: HelpReason) {
  switch (reason) {
    case "boos":
      return "Dit kan nu helpen als je boos bent.";
    case "spannend":
      return "Dit kan nu helpen als iets spannend voelt.";
    case "moe":
      return "Dit kan nu helpen als je moe bent.";
    case "inDeWar":
      return "Dit kan nu helpen als je in de war bent.";
    case "teVeel":
    default:
      return "Dit kan nu helpen als het even te veel is.";
  }
}

type HelpTaskContext =
  | "selfCare"
  | "eatDrink"
  | "school"
  | "social"
  | "active"
  | "bedtime"
  | "household"
  | "appointment"
  | "transition"
  | "screen"
  | "creative"
  | "unknown";

const strategyByTitle = (title: string) => calmStrategies.find((strategy) => strategy.title === title);
const firstMatchingStrategy = (titles: string[]) => titles.map((title) => strategyByTitle(title)).find(Boolean);

function inferTaskContext(task: Task): HelpTaskContext {
  const title = normalizeTaskTitle(task.title);
  const visualKey = task.visualKey ?? "";

  if (["screenOff", "gameTime", "phoneTime"].includes(visualKey) || title.includes("scherm") || title.includes("tablet")) return "screen";
  if (["medicine", "dentist", "doctor", "speechTherapy", "physio", "therapy", "hairdresser", "parentAppointment", "waitingRoom"].includes(visualKey) || ["tandarts", "huisarts", "dokter", "logopedie", "fysio", "therapie", "kapper", "afspraak"].some((word) => title.includes(word))) return "appointment";
  if (["school", "packBag", "unpackBag", "lunchbox", "drinkBottle", "schoolBagCheck", "homework", "reading", "agenda", "weekPlan", "bsoCare", "schoolTrip", "studyDay", "test", "presentation", "sportsDay", "schoolParty"].includes(visualKey) || ["school", "huiswerk", "lezen", "tas", "bso", "toets", "spreekbeurt", "rapport"].some((word) => title.includes(word))) return "school";
  if (["hair", "faceWash", "teeth", "shower", "pajamas", "sleep", "toilet", "sunscreen", "dress", "shoesOn", "coatOn", "shoesOff", "coatHang"].includes(visualKey) || ["tanden", "wassen", "douchen", "pyjama", "slapen", "wc", "aankleden", "jas", "schoenen", "medicijn"].some((word) => title.includes(word))) return "selfCare";
  if (["breakfast", "drinkWater", "snack", "fruit", "dinner", "lunchPrep"].includes(visualKey) || ["eten", "drinken", "fruit", "ontbijt", "snack", "avond eten", "lunch"].some((word) => title.includes(word))) return "eatDrink";
  if (["playdate", "friendVisit", "playAtFriend", "sleepover", "birthdayParty", "familyParty", "grandparents", "visitorsHome", "familyVisit", "babysitter", "momTime", "dadTime", "siblingTime", "bonusParentTime", "boardGame", "readTogether", "cookTogether", "tidyTogether", "toMom", "toDad"].includes(visualKey) || ["vriend", "logeren", "feest", "opa", "oma", "bezoek", "mama", "papa", "broer", "zus", "samen"].some((word) => title.includes(word))) return "social";
  if (["sports", "swimming", "bike", "moveBreak", "outsidePlayGiraffe", "outsidePlay", "soccerSport", "basketballSport", "volleyball", "handball", "fieldHockey", "tennisSport", "badmintonSport", "athletics", "gymnastics", "freerunningSport", "horseRiding", "waterPoloSport", "rugbySport", "korfballSport", "baseballSport", "selfDefenseSport", "dance", "scouting", "climbing", "playground", "park", "pool", "amusementPark", "indoorPlay", "trampolinePark"].includes(visualKey) || ["sport", "zwem", "fiets", "rennen", "buiten", "klimmen", "dans", "scouting"].some((word) => title.includes(word))) return "active";
  if (["waterPlants", "petFood", "setTable", "clearTable", "dishwasher", "laundry", "roomClean", "toysClean"].includes(visualKey) || ["opruimen", "tafel", "vaatwasser", "wasmand", "planten", "huisdier"].some((word) => title.includes(word))) return "household";
  if (["creative", "craftGiraffe", "musicLesson", "drawingLesson", "paintingLesson", "craftClub", "singingLesson", "pianoLesson", "guitarLesson", "drumLesson", "libraryActivity", "readingClub"].includes(visualKey) || ["tekenen", "knutselen", "muziek", "bibliotheek", "schilder", "piano", "gitaar", "drum"].some((word) => title.includes(word))) return "creative";
  if (["pajamas", "sleep", "breatheBed", "dimLight", "calmCard"].includes(visualKey) || ["bed", "bedtijd", "pyjama", "licht zachter", "knuffel pakken"].some((word) => title.includes(word))) return "bedtime";
  if (["wake", "curtains", "makeBed", "coatHang", "shoesOff", "packBag", "unpackBag", "carRide", "cityTrip", "garage", "packagePickup"].includes(visualKey) || ["vertrek", "thuiskomen", "naar", "mee", "ophalen"].some((word) => title.includes(word))) return "transition";
  return "unknown";
}

function fallbackStrategyForTask(task: Task, reason: HelpReason) {
  const parentChoice = task.fallbackStrategyId ? calmStrategies.find((strategy) => strategy.id === task.fallbackStrategyId) : undefined;
  if (parentChoice) return parentChoice;
  const context = inferTaskContext(task);

  const suggestionsByReason: Record<HelpReason, Partial<Record<HelpTaskContext, string[]>>> = {
    teVeel: {
      screen: ["Maak het licht zachter", "Ga naar je rustige plek", "Zet je koptelefoon op"],
      school: ["Maak één kleine keuze", "Ga naar je rustige plek", "Kies samen"],
      selfCare: ["Maak één kleine keuze", "Ga naar je rustige plek", "Adem zacht"],
      eatDrink: ["Maak één kleine keuze", "Ga naar je rustige plek", "Adem zacht"],
      social: ["Ga naar je rustige plek", "Zet je koptelefoon op", "Kies samen"],
      active: ["Ga naar je rustige plek", "Zet je koptelefoon op", "Kijk naar één ding"],
      appointment: ["Kies samen", "Ga naar je rustige plek", "Zet je koptelefoon op"],
      household: ["Maak één kleine keuze", "Ga naar je rustige plek", "Kijk naar één ding"],
      creative: ["Ga naar je rustige plek", "Kijk naar één ding", "Adem zacht"],
      bedtime: ["Maak het licht zachter", "Ga naar je rustige plek", "Adem zacht"],
      transition: ["Ga naar je rustige plek", "Maak één kleine keuze", "Kies samen"],
      unknown: ["Ga naar je rustige plek", "Maak het licht zachter", "Adem zacht"]
    },
    boos: {
      social: ["Kies samen", "Zeg: stop, ik heb hulp nodig", "Knijp in een kussen"],
      appointment: ["Kies samen", "Zeg: stop, ik heb hulp nodig", "Knijp in een kussen"],
      school: ["Duw tegen de muur", "Stamp 10 keer", "Zeg: stop, ik heb hulp nodig"],
      selfCare: ["Duw tegen de muur", "Knijp in een kussen", "Stamp 10 keer"],
      eatDrink: ["Knijp in een kussen", "Duw tegen de muur", "Adem als een draak"],
      active: ["Duw tegen de muur", "Stamp 10 keer", "Adem als een draak"],
      household: ["Duw tegen de muur", "Knijp in een kussen", "Stamp 10 keer"],
      creative: ["Knijp in een kussen", "Adem als een draak", "Zeg: stop, ik heb hulp nodig"],
      bedtime: ["Knijp in een kussen", "Adem als een draak", "Zeg: stop, ik heb hulp nodig"],
      transition: ["Kies samen", "Duw tegen de muur", "Zeg: stop, ik heb hulp nodig"],
      unknown: ["Duw tegen de muur", "Knijp in een kussen", "Adem als een draak"]
    },
    spannend: {
      screen: ["Kies samen", "Ga naar je rustige plek", "Adem zacht"],
      school: ["Kies samen", "Maak één kleine keuze", "Hand op je hart"],
      selfCare: ["Kies samen", "Hand op je hart", "Maak één kleine keuze"],
      eatDrink: ["Kies samen", "Maak één kleine keuze", "Adem zacht"],
      social: ["Kies samen", "Vraag een knuffel", "Hand op je hart"],
      active: ["Kies samen", "Hand op je hart", "Adem zacht"],
      appointment: ["Kies samen", "Hand op je hart", "Vraag een knuffel"],
      household: ["Kies samen", "Maak één kleine keuze", "Hand op je hart"],
      creative: ["Kies samen", "Adem zacht", "Hand op je hart"],
      bedtime: ["Hand op je hart", "Adem zacht", "Kies samen"],
      transition: ["Kies samen", "Hand op je hart", "Maak één kleine keuze"],
      unknown: ["Kies samen", "Hand op je hart", "Adem zacht"]
    },
    moe: {
      screen: ["Maak je lijf zwaar", "Maak het licht zachter", "Even niets"],
      school: ["Kies samen", "Maak je lijf zwaar", "Zoek een rustig plekje"],
      selfCare: ["Maak je lijf zwaar", "Zoek een rustig plekje", "Kies samen"],
      eatDrink: ["Maak je lijf zwaar", "Zoek een rustig plekje", "Even niets"],
      social: ["Kies samen", "Vraag een knuffel", "Kies dichtbij of ruimte"],
      active: ["Maak je lijf zwaar", "Zoek een rustig plekje", "Even niets"],
      appointment: ["Kies samen", "Vraag een knuffel", "Maak je lijf zwaar"],
      household: ["Maak je lijf zwaar", "Kies samen", "Zoek een rustig plekje"],
      creative: ["Zoek een rustig plekje", "Maak je lijf zwaar", "Even niets"],
      bedtime: ["Maak het licht zachter", "Maak je lijf zwaar", "Adem zacht"],
      transition: ["Maak je lijf zwaar", "Kies samen", "Zoek een rustig plekje"],
      unknown: ["Maak je lijf zwaar", "Zoek een rustig plekje", "Even niets"]
    },
    inDeWar: {
      school: ["Kies samen", "Maak één kleine keuze", "Zeg: ik weet het even niet"],
      selfCare: ["Kies samen", "Maak één kleine keuze", "Zeg: ik weet het even niet"],
      eatDrink: ["Maak één kleine keuze", "Kies samen", "Zeg: ik weet het even niet"],
      social: ["Kies samen", "Zeg: ik weet het even niet", "Vraag een knuffel"],
      active: ["Kies samen", "Maak één kleine keuze", "Adem zacht"],
      appointment: ["Kies samen", "Zeg: ik weet het even niet", "Vraag een knuffel"],
      household: ["Maak één kleine keuze", "Kies samen", "Zeg: ik weet het even niet"],
      creative: ["Teken je warboel", "Kies samen", "Maak één kleine keuze"],
      bedtime: ["Kies samen", "Maak één kleine keuze", "Adem zacht"],
      transition: ["Kies samen", "Zeg: ik weet het even niet", "Maak één kleine keuze"],
      screen: ["Kies samen", "Maak één kleine keuze", "Ga naar je rustige plek"],
      unknown: ["Kies samen", "Maak één kleine keuze", "Zeg: ik weet het even niet"]
    }
  };

  const exactSuggestion = firstMatchingStrategy(suggestionsByReason[reason][context] ?? []);
  if (exactSuggestion) return exactSuggestion;

  const helpReason = helpReasons.find((item) => item.id === reason) ?? helpReasons[0];
  return chooseStrategy(reason, helpReason.need);
}

function useProfile() {
  return useLiveData(async () => (await db.childProfiles.get("default-child")) ?? null, null, []);
}

function useAvatar(profileAvatarId?: string): Avatar {
  return avatarAssets.find((avatar) => avatar.id === profileAvatarId) ?? avatarAssets[0];
}

function chooseStrategy(emotion?: EmotionType, need?: NeedType) {
  const normalizedEmotion: EmotionType | undefined =
    emotion === "overprikkeld" ? "teVeel" :
    emotion === "druk" ? "superDruk" :
    emotion;

  const findStrategyByTitles = (titles: string[]) =>
    titles.map((title) => calmStrategies.find((strategy) => strategy.title === title)).find(Boolean);

  const preferredByEmotionAndNeed: Partial<Record<EmotionType, Partial<Record<NeedType, string[]>>>> = {
    rustig: {
      ademen: ["Geef je rustkracht water", "Adem zacht"],
      creatief: ["Bewaar dit gevoel", "Kies iets fijns"]
    },
    blij: {
      ademen: ["Geef je rustkracht water", "Adem zacht"],
      creatief: ["Kies iets fijns", "Bewaar dit gevoel"],
      praatMetOuder: ["Kies samen"]
    },
    verdrietig: {
      knuffel: ["Vraag een knuffel", "Pak iets zachts"],
      ademen: ["Hand op je hart"],
      creatief: ["Teken je wolk"],
      praatMetOuder: ["Kies samen", "Kies dichtbij of ruimte", "Vraag een knuffel"],
      rustigePlek: ["Zoek een rustig plekje", "Kruip onder een deken"]
    },
    boos: {
      bewegen: ["Duw tegen de muur", "Stamp 10 keer", "Draag iets zwaars"],
      ademen: ["Adem als een draak"],
      knuffel: ["Knijp in een kussen"],
      praatMetOuder: ["Kies samen", "Zeg: stop, ik heb hulp nodig"]
    },
    spannend: {
      ademen: ["Hand op je hart", "Adem zacht"],
      rustigePlek: ["Ga naar je rustige plek", "Zoek een rustig plekje"],
      knuffel: ["Pak iets zachts", "Vraag een knuffel"],
      praatMetOuder: ["Kies samen", "Hand op je hart", "Zeg: stop, ik heb hulp nodig"]
    },
    teVeel: {
      koptelefoon: ["Zet je koptelefoon op"],
      rustigePlek: ["Ga naar je rustige plek", "Maak het licht zachter"],
      evenAlleen: ["Kruip onder een deken"],
      ademen: ["Kijk naar één ding", "Adem zacht"]
    },
    overprikkeld: {
      koptelefoon: ["Zet je koptelefoon op"],
      rustigePlek: ["Ga naar je rustige plek", "Maak het licht zachter"],
      evenAlleen: ["Kruip onder een deken"],
      ademen: ["Kijk naar één ding", "Adem zacht"]
    },
    druk: {
      bewegen: ["Spring 10 keer", "Schud je armen los", "Doe een dierenloop"]
    },
    superDruk: {
      bewegen: ["Spring 10 keer", "Schud je armen los", "Doe een dierenloop"]
    },
    moe: {
      rustigePlek: ["Zoek een rustig plekje", "Maak je lijf zwaar", "Maak het licht zachter"],
      evenAlleen: ["Even niets"],
      ademen: ["Adem zacht"],
      praatMetOuder: ["Kies samen", "Vraag een knuffel", "Kies dichtbij of ruimte"],
      knuffel: ["Vraag een knuffel", "Pak iets zachts"]
    },
    inDeWar: {
      praatMetOuder: ["Kies samen", "Zeg: ik weet het even niet"],
      rustigePlek: ["Maak één kleine keuze"],
      ademen: ["Adem zacht"],
      creatief: ["Teken je warboel"]
    },
    snapNiet: {
      praatMetOuder: ["Kies samen", "Maak één kleine keuze", "Zeg: ik weet het even niet"],
      creatief: ["Teken je warboel"],
      rustigePlek: ["Maak één kleine keuze"],
      ademen: ["Adem zacht"]
    },
    durfNiet: {
      praatMetOuder: ["Kies samen", "Hand op je hart", "Zeg: ik weet het even niet"],
      knuffel: ["Vraag een knuffel", "Pak iets zachts"],
      rustigePlek: ["Ga naar je rustige plek"],
      ademen: ["Hand op je hart", "Adem zacht"]
    },
    wilHulp: {
      praatMetOuder: ["Kies samen", "Zeg: stop, ik heb hulp nodig"],
      knuffel: ["Vraag een knuffel", "Pak iets zachts"]
    },
    weetIkNiet: {
      praatMetOuder: ["Kies samen", "Zeg: ik weet het even niet"],
      rustigePlek: ["Maak één kleine keuze"],
      ademen: ["Adem zacht"],
      creatief: ["Teken je warboel"]
    }
  };

  const directEmotionNeedMatch = emotion && need
    ? findStrategyByTitles(preferredByEmotionAndNeed[normalizedEmotion ?? emotion]?.[need] ?? [])
    : undefined;
  if (directEmotionNeedMatch) return directEmotionNeedMatch;

  const preferredByNeed: Record<NeedType, string[]> = {
    knuffel: ["Pak iets zachts", "Vraag een knuffel", "Kies dichtbij of ruimte"],
    rustigePlek: ["Ga naar je rustige plek", "Zoek een rustig plekje", "Maak het licht zachter"],
    bewegen: ["Spring 10 keer", "Schud je armen los", "Draag iets zwaars"],
    evenAlleen: ["Even niets", "Kruip onder een deken", "Zoek een rustig plekje"],
    praatMetOuder: ["Kies samen", "Zeg: ik weet het even niet", "Zeg: stop, ik heb hulp nodig"],
    ademen: ["Adem zacht", "Hand op je hart", "Geef je rustkracht water"],
    koptelefoon: ["Zet je koptelefoon op", "Maak het licht zachter", "Ga naar je rustige plek"],
    creatief: ["Teken je wolk", "Bewaar dit gevoel", "Kies iets fijns"]
  };

  const emotionOnlyFallbacks: Partial<Record<EmotionType, string[]>> = {
    rustig: ["Geef je rustkracht water", "Bewaar dit gevoel"],
    blij: ["Kies iets fijns", "Bewaar dit gevoel"],
    verdrietig: ["Vraag een knuffel", "Kies samen", "Hand op je hart"],
    boos: ["Duw tegen de muur", "Kies samen", "Adem als een draak"],
    spannend: ["Kies samen", "Hand op je hart", "Ga naar je rustige plek"],
    teVeel: ["Ga naar je rustige plek", "Zet je koptelefoon op", "Maak het licht zachter"],
    overprikkeld: ["Ga naar je rustige plek", "Zet je koptelefoon op", "Maak het licht zachter"],
    druk: ["Spring 10 keer", "Schud je armen los", "Doe een dierenloop"],
    superDruk: ["Spring 10 keer", "Schud je armen los", "Doe een dierenloop"],
    moe: ["Kies samen", "Zoek een rustig plekje", "Adem zacht"],
    inDeWar: ["Kies samen", "Maak één kleine keuze", "Zeg: ik weet het even niet"],
    snapNiet: ["Kies samen", "Teken je warboel", "Maak één kleine keuze"],
    durfNiet: ["Kies samen", "Hand op je hart", "Vraag een knuffel"],
    wilHulp: ["Kies samen", "Zeg: stop, ik heb hulp nodig"],
    weetIkNiet: ["Maak één kleine keuze", "Kies samen", "Adem zacht"]
  };

  const emotionPreferred = normalizedEmotion ? findStrategyByTitles(emotionOnlyFallbacks[normalizedEmotion] ?? []) : undefined;
  if (emotionPreferred) return emotionPreferred;

  const preferred = need ? findStrategyByTitles(preferredByNeed[need]) : undefined;
  if (preferred) return preferred;

  const exactMatch = calmStrategies.find((strategy) => (!normalizedEmotion || strategy.linkedEmotionTypes.includes(normalizedEmotion)) && (!need || strategy.linkedNeedTypes.includes(need)));
  if (exactMatch) return exactMatch;

  return calmStrategies.find((strategy) => need ? strategy.linkedNeedTypes.includes(need) : false)
    ?? calmStrategies.find((strategy) => normalizedEmotion ? strategy.linkedEmotionTypes.includes(normalizedEmotion) : false)
    ?? calmStrategies[0];
}

function emotionForNeed(need: NeedType): EmotionType {
  const map: Record<NeedType, EmotionType> = {
    knuffel: "verdrietig",
    rustigePlek: "teVeel",
    bewegen: "superDruk",
    evenAlleen: "moe",
    praatMetOuder: "inDeWar",
    ademen: "rustig",
    koptelefoon: "teVeel",
    creatief: "rustig"
  };
  return map[need];
}

function defaultNeedForEmotion(emotion: EmotionType): NeedType {
  const map: Partial<Record<EmotionType, NeedType>> = {
    teVeel: "rustigePlek",
    overprikkeld: "rustigePlek",
    snapNiet: "praatMetOuder",
    inDeWar: "praatMetOuder",
    durfNiet: "praatMetOuder",
    wilHulp: "praatMetOuder",
    weetIkNiet: "praatMetOuder",
    moe: "rustigePlek",
    boos: "bewegen",
    verdrietig: "knuffel",
    spannend: "praatMetOuder",
    druk: "bewegen",
    superDruk: "bewegen",
    rustig: "ademen",
    blij: "creatief"
  };
  return map[emotion] ?? "praatMetOuder";
}

function needCardLabel(need: NeedType, emotion?: EmotionType) {
  if (need === "praatMetOuder" && emotion && ["verdrietig", "spannend", "moe", "snapNiet", "inDeWar", "durfNiet", "wilHulp", "weetIkNiet"].includes(emotion)) {
    return "Samen doen";
  }
  return undefined;
}

function needPageTitle(emotion?: EmotionType) {
  if (!emotion) return "Wat heb je nu nodig?";
  if (emotion === "rustig" || emotion === "blij") return "Wat wil je nu doen?";
  if (["snapNiet", "inDeWar", "durfNiet", "wilHulp", "weetIkNiet", "teVeel", "overprikkeld"].includes(emotion)) return "Wat helpt nu?";
  return "Wat heb je nu nodig?";
}

function helpNowNeedForTitle(title: string): NeedType {
  const normalized = title.toLowerCase();
  if (normalized.includes("rustige") || normalized.includes("rustig plekje")) return "rustigePlek";
  if (normalized.includes("adem")) return "ademen";
  if (normalized.includes("hulp") || normalized.includes("stop")) return "praatMetOuder";
  if (normalized.includes("zachts") || normalized.includes("knuffel")) return "knuffel";
  return "rustigePlek";
}

function HomePage() {
  return (
    <section className="phone-screen home-scene relative overflow-hidden px-5 pb-4 pt-5">
      <div className="cloud cloud-a" />
      <div className="cloud cloud-b" />
      <div className="home-content relative z-10">
        <div className="flowi-logo mb-1">Flowi<span>{"\u2665"}</span></div>
        <div className="home-main-stage home-main-stage-solo">
        <div className="home-mascot-wrap home-mascot-wrap-solo relative" aria-label="Flowi helpt jou">
          <img src="/assets/flowi-home-mascot.png" alt="" className="home-mascot-free home-mascot-free-solo" />
        </div>
        </div>
      </div>
    </section>
  );
}

function CheckInPage() {
  const navigate = useNavigate();
  const { setEmotion } = useCurrentFlow();
  const { data: profile } = useProfile();
  const avatar = useAvatar(profile?.selectedAvatarId);
  return (
    <>
      <div className="phone-screen px-4 pb-5 pt-4">
      <PageHeader title="Hoe voel je je nu?" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {emotions.map((emotion) => (
          <EmotionCard key={emotion.id} emotion={emotion} avatar={avatar} onClick={() => { setEmotion(emotion.id); navigate(emotion.id === "weetIkNiet" ? "/check-in/weet-ik-niet" : "/need"); }} />
        ))}
      </div>
      </div>
    </>
  );
}

function UnsureEmotionPage() {
  const navigate = useNavigate();
  const { setEmotion, setNeed, setAction } = useCurrentFlow();
  return (
    <div className="phone-screen px-4 pb-5 pt-4">
      <PageHeader title="Je koos: weet ik niet" />
      <div className="grid grid-cols-2 gap-3">
        {unsureEmotions.map((emotion) => (
          <EmotionCard
            key={emotion.id}
            emotion={emotion}
            onClick={() => {
              const strategy = chooseStrategy(emotion.id);
              const need = defaultNeedForEmotion(emotion.id);
              setEmotion(emotion.id);
              setNeed(need);
              setAction(strategy.id);
              navigate(`/action/${strategy.id}?source=check-in-direct`);
            }}
          />
        ))}
      </div>
    </div>
  );
}

function NeedPage() {
  const navigate = useNavigate();
  const { selectedEmotion, setNeed, setAction } = useCurrentFlow();
  const isPositiveEmotion = selectedEmotion === "rustig" || selectedEmotion === "blij";
  const guidedNeedsByEmotion: Partial<Record<EmotionType, NeedType[]>> = {
    rustig: ["ademen", "creatief"],
    blij: ["creatief", "ademen", "praatMetOuder"],
    verdrietig: ["knuffel", "praatMetOuder", "rustigePlek", "creatief"],
    boos: ["bewegen", "praatMetOuder", "ademen", "knuffel"],
    spannend: ["praatMetOuder", "knuffel", "ademen", "rustigePlek"],
    overprikkeld: ["rustigePlek", "koptelefoon", "ademen"],
    teVeel: ["rustigePlek", "koptelefoon", "ademen"],
    druk: ["bewegen", "ademen", "praatMetOuder"],
    superDruk: ["bewegen", "ademen", "praatMetOuder"],
    moe: ["rustigePlek", "evenAlleen", "knuffel", "praatMetOuder"],
    snapNiet: ["praatMetOuder", "creatief", "ademen"],
    inDeWar: ["praatMetOuder", "creatief", "ademen"],
    durfNiet: ["praatMetOuder", "knuffel", "ademen"],
    wilHulp: ["praatMetOuder", "knuffel"],
    weetIkNiet: ["praatMetOuder", "rustigePlek", "creatief"]
  };
  const preferredNeeds = selectedEmotion ? guidedNeedsByEmotion[selectedEmotion] : undefined;
  const filteredNeeds = preferredNeeds?.length ? needs.filter((need) => preferredNeeds.includes(need.id)) : needs;
  return (
    <div className="phone-screen px-4 pb-5 pt-4">
      <PageHeader title={needPageTitle(selectedEmotion)} />
      {isPositiveEmotion ? (
        <section className="mb-4 rounded-[1.55rem] bg-gradient-to-b from-mint/16 via-white to-sky/12 p-4 shadow-card">
          <h2 className="text-lg font-black text-navy">Dit voelt al goed</h2>
          <div className="mt-3 grid gap-2">
            <PrimaryButton onClick={() => void savePositiveMoment(selectedEmotion ?? "rustig", "Fijn gevoel even vastgehouden").then(() => navigate("/rewards"))}>
              Klaar
            </PrimaryButton>
            <SecondaryButton onClick={() => navigate("/")}>Naar Flowi</SecondaryButton>
          </div>
        </section>
      ) : null}
      <div className="grid grid-cols-2 gap-3">
        {filteredNeeds.map((need) => (
          <NeedCard
            key={need.id}
            need={need}
            label={needCardLabel(need.id, selectedEmotion)}
            onClick={() => {
              const strategy = chooseStrategy(selectedEmotion, need.id);
              setNeed(need.id);
              setAction(strategy.id);
              navigate(`/action/${strategy.id}`);
            }}
          />
        ))}
      </div>
    </div>
  );
}

function ActionPage() {
  const navigate = useNavigate();
  const { actionId } = useParams();
  const [searchParams] = useSearchParams();
  const { selectedEmotion, selectedNeed } = useCurrentFlow();
  const isPositiveEmotion = selectedEmotion === "rustig" || selectedEmotion === "blij";
  const isHelpNowFlow = searchParams.get("source") === "help-now";
  const isCheckInDirectFlow = searchParams.get("source") === "check-in-direct";
  const action = calmStrategies.find((strategy) => strategy.id === actionId) ?? chooseStrategy(selectedEmotion, selectedNeed);
  const suggestedDuration = clampTimerSeconds(action.durationSeconds ?? 120);
  const [duration, setDuration] = useState(suggestedDuration);
  const [timerOpen, setTimerOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(suggestedDuration);
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    setTimerOpen(false);
    setRunning(false);
    setDuration(suggestedDuration);
    setRemaining(suggestedDuration);
    setHelpOpen(false);
  }, [action.id, suggestedDuration]);

  useEffect(() => {
    if (!running) return;
    if (remaining <= 0) {
      setRunning(false);
      return;
    }
    const timer = window.setTimeout(() => setRemaining((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [running, remaining]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60).toString();
    const rest = (seconds % 60).toString().padStart(2, "0");
    return `${minutes}:${rest}`;
  };
  const helpOptions = actionHelpOptions(action.title);
  const setActionDuration = (seconds: number) => {
    const next = clampTimerSeconds(seconds);
    setDuration(next);
    setRemaining(next);
    setRunning(false);
  };
  const finishAction = async () => {
    if (isPositiveEmotion || isHelpNowFlow) {
      await db.emotionHistory.add({
        id: id(),
        childProfileId: "default-child",
        emotionType: selectedEmotion ?? "wilHulp",
        needType: selectedNeed ?? action.linkedNeedTypes[0] ?? "praatMetOuder",
        actionId: action.id,
        helpedRating: isHelpNowFlow ? "Snelle hulp gedaan" : "Fijn gevoel vastgehouden",
        note: action.title,
        createdAt: now()
      });
      await addGrowthReward(actionCompletionLabel(action.title, selectedEmotion), action.title);
      navigate("/rewards");
      return;
    }
    navigate("/reflection");
  };
  return (
    <>
      <section className="phone-screen action-scene p-5 text-center">
        <header className="mb-5 flex items-center">
          <button aria-label="Terug" className="grid h-14 w-14 place-items-center rounded-[1.25rem] border border-white bg-white/90 shadow-card focus:outline-none focus:ring-4 focus:ring-lavender/30" onClick={() => navigate(-1)}>
            <ArrowLeft size={25} />
          </button>
        </header>
        <article className="mx-auto flex items-center gap-3 rounded-[1.65rem] bg-white/94 p-4 shadow-card ring-1 ring-lavender/8">
          <section className="flowi-picture-card flowi-picture-card-breathe flex-1">
            <span className="flowi-picture-art">
              <ExerciseArt title={action.title} />
            </span>
            <span className="flowi-picture-label">{shortExerciseTitle(action.title)}</span>
          </section>
          <div className="grid gap-3" aria-label={`Acties voor ${action.title}`}>
            <button type="button" aria-label={`${action.title} is gelukt`} onClick={() => void finishAction()} className="child-task-done">
              <Check size={30} />
            </button>
            <button type="button" aria-label={`Hulp bij ${action.title}`} onClick={() => setHelpOpen(true)} className="child-task-help">
              <HelpCircle size={28} />
            </button>
          </div>
        </article>
        {timerOpen ? (
          <section className="mt-5 rounded-[1.55rem] bg-white/92 p-4 shadow-card">
            <div className="mx-auto grid h-28 w-28 place-items-center rounded-full bg-lavender/10 text-4xl font-black text-lavender ring-8 ring-lavender/8">{formatTime(remaining)}</div>
            <div className="timer-slider-card mt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-black text-navy/55">Kort</span>
                <span className="rounded-full bg-lavender/10 px-4 py-1.5 text-lg font-black text-lavender">{duration / 60} min</span>
                <span className="text-sm font-black text-navy/55">Rustig</span>
              </div>
              <input aria-label="Timer tijd" className="timer-slider mt-4" type="range" min={1} max={5} step={1} value={duration / 60} onChange={(event) => setActionDuration(Number(event.target.value) * 60)} />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <SecondaryButton onClick={() => { setRemaining(duration); setRunning(false); }}><RotateCcw className="mx-auto" size={20} /></SecondaryButton>
              <PrimaryButton className="col-span-2" onClick={() => setRunning((value) => !value)}>{running ? <><Pause className="mr-2 inline" size={18} /> Pauze</> : <><Play className="mr-2 inline" size={18} /> Start</>}</PrimaryButton>
            </div>
          </section>
        ) : (
          <button type="button" onClick={() => setTimerOpen(true)} className="mt-5 min-h-12 w-full rounded-[1.35rem] bg-white px-5 font-extrabold text-lavender shadow-card">Timer gebruiken</button>
        )}
        <div className="mt-4 grid gap-2">
          <SecondaryButton onClick={() => navigate("/need")}>{isCheckInDirectFlow ? "Toch iets anders kiezen" : "Iets anders kiezen"}</SecondaryButton>
        </div>
      </section>

      {helpOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-end bg-navy/28 p-3 backdrop-blur-sm sm:place-items-center" onClick={() => setHelpOpen(false)}>
          <section className="help-suggestion-overlay w-full max-w-md rounded-[2rem] p-4 shadow-[0_24px_52px_rgba(50,44,108,.24)] ring-1 ring-lavender/12" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-3">
              <div className="text-left">
                <h2 className="text-xl font-black text-navy">Zo kun je hulp vragen</h2>
                <p className="mt-1 text-sm font-semibold leading-6 text-navy/74">Kies wat je wilt zeggen of laten zien</p>
              </div>
              <button type="button" aria-label="Hulp sluiten" onClick={() => setHelpOpen(false)} className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/66 text-lavender shadow-[inset_0_1px_0_rgba(255,255,255,.78)]">
                <X size={22} />
              </button>
            </div>
            <div className="help-overlay-art mt-4">
              <ExerciseArt title="Vraag een knuffel" compact />
            </div>
            <div className="mt-4 grid gap-2.5">
              {helpOptions.map((line) => (
                <button key={line} type="button" onClick={() => setHelpOpen(false)} className="rounded-[1.35rem] bg-white/88 px-4 py-3 text-left text-base font-black leading-6 text-navy shadow-[0_10px_22px_rgba(61,58,130,.08),inset_0_1px_0_rgba(255,255,255,.74)] transition active:scale-[.98]">
                  {line}
                </button>
              ))}
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}

function HelpNowPage() {
  const navigate = useNavigate();
  const { setEmotion, setNeed, setAction } = useCurrentFlow();
  const fast = ["Ga naar je rustige plek", "Adem zacht", "Zeg: stop, ik heb hulp nodig", "Pak iets zachts"].map((title) => calmStrategies.find((strategy) => strategy.title === title)).filter(Boolean) as CalmStrategy[];
  return (
    <div className="phone-screen px-4 pb-5 pt-4">
      <PageHeader title="Help mij nu" />
      <section className="relative mb-4 overflow-hidden rounded-[1.9rem] bg-gradient-to-b from-sky/18 via-white to-mint/14 p-5 shadow-soft">
        <div className="cloud cloud-a" />
        <div className="relative z-10 grid grid-cols-[1fr_auto] items-end gap-2">
          <div>
            <h2 className="text-2xl font-black text-navy">Flowi blijft bij je</h2>
          </div>
          <span className="help-now-hero-art" aria-hidden />
        </div>
      </section>
      <div className="grid grid-cols-2 gap-3">
        {fast.map((strategy) => (
          <NeedCard
            key={strategy.id}
            need={{ id: helpNowNeedForTitle(strategy.title), label: strategy.title, icon: "" }}
            label={shortExerciseTitle(strategy.title)}
            onClick={() => {
              setEmotion("wilHulp");
              setNeed(strategy.linkedNeedTypes[0] ?? "praatMetOuder");
              setAction(strategy.id);
              navigate(`/action/${strategy.id}?source=help-now`);
            }}
          />
        ))}
      </div>
      <button onClick={() => navigate("/need")} className="mt-4 min-h-12 w-full rounded-[1.35rem] bg-gradient-to-b from-[#ffb58b] to-[#ff7f74] px-5 font-extrabold text-white shadow-[0_14px_24px_rgba(255,127,116,.24)]">Iets anders kiezen</button>
    </div>
  );
}

function ReflectionPage() {
  const navigate = useNavigate();
  const { selectedEmotion = "weetIkNiet", selectedNeed = "praatMetOuder", selectedActionId = calmStrategies[0].id } = useCurrentFlow();
  const [note, setNote] = useState("");
  const action = calmStrategies.find((strategy) => strategy.id === selectedActionId) ?? calmStrategies[0];
  const save = async (rating: string) => {
    await db.emotionHistory.add({ id: id(), childProfileId: "default-child", emotionType: selectedEmotion, needType: selectedNeed, actionId: selectedActionId, helpedRating: rating, note, createdAt: now() });
    await db.rewards.add({ id: id(), childProfileId: "default-child", label: actionCompletionLabel(action.title, selectedEmotion), icon: "\uD83D\uDC9C", reason: action.title, earnedAt: now() });
    navigate("/rewards");
  };
  const reflectionChoices: { label: string; sublabel: string; emotion: EmotionType }[] = [
    { label: "Rustiger", sublabel: "Mijn lijf voelt zachter", emotion: "rustig" },
    { label: "Beetje beter", sublabel: "Het hielp een beetje", emotion: "blij" },
    { label: "Nog niet", sublabel: "Ik heb nog hulp nodig", emotion: "spannend" },
    { label: "Moeilijker", sublabel: "Dit paste nu niet", emotion: "verdrietig" }
  ];
  return (
    <>
      <div className="phone-screen px-4 pb-5 pt-4">
        <PageHeader title="Wat hielp jou?" />
        <div className="grid grid-cols-2 gap-3">
          {reflectionChoices.map((choice) => (
            <EmotionCard
              key={choice.label}
              emotion={{ id: choice.emotion, label: choice.label, shortText: choice.sublabel, colors: "", marks: "reflectie" }}
              onClick={() => save(choice.label)}
            />
          ))}
        </div>
      </div>
    </>
  );
}

function ParentGate({ children }: { children: React.ReactNode }) {
  const [answer, setAnswer] = useState("");
  const [unlocked, setUnlocked] = useState(readParentUnlock());
  const [error, setError] = useState("");
  const [question, setQuestion] = useState<ParentGateQuestion>(() => makeParentGateQuestion());

  if (unlocked) return <>{children}</>;

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (Number(answer) === question.answer) {
      unlockParentMode();
      setUnlocked(true);
      setError("");
      return;
    }
    setError("Dat klopt nog niet. Probeer het nog een keer.");
    setAnswer("");
    setQuestion(makeParentGateQuestion());
  };

  return (
    <div className="phone-screen px-4 pb-5 pt-4">
      <PageHeader title="Voor volwassenen" subtitle="Even een korte check voordat je iets aanpast." backTo="/" />
      <section className="rounded-[1.8rem] bg-gradient-to-b from-lavender/12 via-white to-sky/12 p-5 shadow-soft">
        <div className="flex items-start gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-lavender/12 text-lavender">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-navy">Ouderpoort</h2>
            <p className="mt-1.5 text-base leading-6 text-navy/62">Zo voorkomen we dat een kind per ongeluk in instellingen of planning iets verandert.</p>
          </div>
        </div>
        <form className="mt-4 grid gap-3" onSubmit={submit}>
          <label className="rounded-[1.5rem] bg-white/92 p-4 shadow-card">
            <span className="block text-sm font-black uppercase tracking-[0.18em] text-lavender/70">Kleine som</span>
            <span className="mt-2 block text-2xl font-black text-navy">{question.first} {question.operator} {question.second} = ?</span>
            <input
              type="number"
              inputMode="numeric"
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              className="mt-3 min-h-14 w-full rounded-[1.2rem] border border-lavender/18 bg-cream px-4 text-xl font-black text-navy outline-none focus:ring-4 focus:ring-lavender/20"
              placeholder="Typ het antwoord"
            />
          </label>
          {error ? <p className="px-1 text-sm font-bold text-coral">{error}</p> : null}
          <PrimaryButton type="submit">Verder naar instellingen</PrimaryButton>
        </form>
      </section>
    </div>
  );
}

function HelpStartOverlay({ task, onClose, onNeedsHelp }: { task: Task; onClose: () => void; onNeedsHelp?: (reason: HelpReason) => void }) {
  const navigate = useNavigate();
  const [reason, setReason] = useState<HelpReason | null>(null);
  const selectedHelp = reason ? helpReasons.find((item) => item.id === reason) : null;
  const strategy = reason ? fallbackStrategyForTask(task, reason) : null;
  return (
    <div className="help-start-overlay fixed inset-0 z-50 grid place-items-end bg-navy/24 px-3 pt-10 backdrop-blur-sm sm:place-items-center">
      <section className="help-start-panel w-full max-w-md rounded-[1.9rem] bg-white p-4 shadow-[0_24px_70px_rgba(31,33,91,.24)]">
        <div className="flex items-start gap-3">
          <TaskArt title={task.title} visualKey={task.visualKey as TaskVisualKey | undefined} compact />
          <div className="min-w-0 flex-1">
            <h2 className="font-black text-navy">Wat lukt er niet?</h2>
          </div>
          <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-2xl bg-lavender/10 font-black text-lavender" aria-label="Sluiten">{"\u00D7"}</button>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {helpReasons.map((item) => (
            <EmotionCard
              key={item.id}
              emotion={{ id: item.id, label: item.label, shortText: "", colors: "", marks: "question" }}
              onClick={() => { setReason(item.id); onNeedsHelp?.(item.id); }}
            />
          ))}
        </div>
      </section>
      {selectedHelp && strategy ? (
        <div className="fixed inset-0 z-[60] grid place-items-end bg-navy/28 px-3 pb-24 pt-6 backdrop-blur-sm sm:place-items-center sm:p-3" onClick={() => setReason(null)}>
          <section className="help-suggestion-overlay w-full max-w-md rounded-[2rem] p-4 shadow-[0_24px_52px_rgba(50,44,108,.24)] ring-1 ring-lavender/12" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-3">
              <div className="text-left">
                <h2 className="text-xl font-black text-navy">Flowi helpt!</h2>
              </div>
              <button type="button" aria-label="Voorstel sluiten" onClick={() => setReason(null)} className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/66 text-lavender shadow-[inset_0_1px_0_rgba(255,255,255,.78)]">
                {"\u00D7"}
              </button>
            </div>
            <button
              type="button"
              className="help-suggestion-cta mt-4 block w-full rounded-[1.9rem] text-left transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-lavender/30"
              onClick={() => navigate(`/action/${strategy.id}`)}
            >
              <div className="flowi-picture-card help-suggestion-card min-h-[16rem]">
                <span className="flowi-picture-art">
                  <ExerciseArt title={strategy.title} compact />
                </span>
                <span className="flowi-picture-label">{shortExerciseTitle(strategy.title)}</span>
              </div>
            </button>
          </section>
        </div>
      ) : null}
    </div>
  );
}

function DayPage() {
  const { data: tasks } = useLiveData(() => db.tasks.where("childProfileId").equals("default-child").toArray(), [] as Task[], []);
  const { data: completions } = useLiveData(() => db.taskCompletions.where("date").equals(today()).toArray(), [], []);
  const { data: settings } = useLiveData(() => db.settings.get("app"), undefined, []);
  const activeWeekDay = settings?.weekPlanningEnabled ? currentWeekDay() : null;
  return (
    <>
      <div className="phone-screen px-4 pb-5 pt-4">
      <PageHeader title={activeWeekDay ? weekDayLabel(activeWeekDay) : "Mijn dag"} subtitle={activeWeekDay ? "Kijk rustig wat bij vandaag hoort." : "Kies wat gelukt is. Flowi helpt als iets lastig is."} back={false} />
      <div className="grid gap-3">
        {(["ochtend", "naSchool", "avond", "bedtijd"] as DayPart[]).map((part) => {
          const partTasks = tasks.filter((task) => task.dayPart === part && task.isEnabled && taskRunsOnDay(task, activeWeekDay));
          const done = partTasks.filter((task) => completions.some((completion) => completion.taskId === task.id && completion.status === "done")).length;
          return <DayPartCard key={part} title={dayPartTitle(part, activeWeekDay)} visualTitle={dayParts[part].title} icon={dayParts[part].icon} progress={partTasks.length ? (done / partTasks.length) * 100 : 0} to={`/day/${part}${weekDayQuery(activeWeekDay)}`} />;
        })}
      </div>
      </div>
    </>
  );
}

function DayPartPage() {
  const { dayPart = "ochtend" } = useParams();
  const [searchParams] = useSearchParams();
  const part = dayPart as DayPart;
  const { data: tasks, reload } = useLiveData(() => db.tasks.where("dayPart").equals(part).toArray(), [] as Task[], [part]);
  const { data: completions, reload: reloadCompletions } = useLiveData(() => db.taskCompletions.where("date").equals(today()).toArray(), [], [part]);
  const { data: settings } = useLiveData(() => db.settings.get("app"), undefined, []);
  const [helpTask, setHelpTask] = useState<Task | null>(null);
  const activeWeekDay = settings?.weekPlanningEnabled ? (isWeekDay(searchParams.get("weekDay")) ? searchParams.get("weekDay") as WeekDay : currentWeekDay()) : null;
  const visibleTasks = sortTasks(tasks.filter((task) => task.isEnabled && taskRunsOnDay(task, activeWeekDay)));
  const toggleComplete = async (task: Task) => {
    const existing = completions.find((completion) => completion.taskId === task.id);
    if (existing?.status === "done") {
      await db.taskCompletions.delete(existing.id);
    } else {
      await db.taskCompletions.put({ id: `${task.id}-${today()}`, childProfileId: "default-child", taskId: task.id, date: today(), status: "done", completedAt: now() });
    }
    await reloadCompletions();
    await reload();
  };
  const markNeedsHelp = async (task: Task, reason: HelpReason) => {
    await db.taskCompletions.put({ id: `${task.id}-${today()}`, childProfileId: "default-child", taskId: task.id, date: today(), status: "needsHelp", completedAt: now(), moodBefore: reason, note: "Goed geprobeerd" });
    await reloadCompletions();
    await reload();
  };
  return (
    <>
      <div className="phone-screen px-4 pb-5 pt-4">
      <PageHeader title={dayPartTitle(part, activeWeekDay)} subtitle={activeWeekDay ? weekDayLabel(activeWeekDay) : "Kies wat gelukt is. Lukt iets niet? Flowi helpt."} backTo="/day" />
      <div className="grid gap-3">
        {visibleTasks.length ? visibleTasks.map((task) => {
          const completion = completions.find((item) => item.taskId === task.id);
          return (
            <ChildTaskCard key={task.id} task={task} done={completion?.status === "done"} needsHelp={completion?.status === "needsHelp"} onDone={() => toggleComplete(task)} onHelp={() => setHelpTask(task)} />
          );
        }) : (
          <div className="rounded-[1.5rem] bg-white/90 p-5 text-center shadow-card">
            <TaskArt title={dayParts[part]?.title ?? "Rust"} />
            <p className="mt-3 font-black text-navy">Er staat hier nog niets klaar.</p>
            <p className="text-sm font-bold text-navy/52">Een ouder kan taken toevoegen bij Meer.</p>
          </div>
        )}
      </div>
      {helpTask ? <HelpStartOverlay task={helpTask} onClose={() => setHelpTask(null)} onNeedsHelp={(reason) => markNeedsHelp(helpTask, reason)} /> : null}
      </div>
    </>
  );
}

function DaySettingsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: tasks } = useLiveData(() => db.tasks.where("childProfileId").equals("default-child").toArray(), [] as Task[], []);
  const { data: completions } = useLiveData(() => db.taskCompletions.where("date").equals(today()).toArray(), [], []);
  const { data: settings, reload: reloadSettings } = useLiveData(() => db.settings.get("app"), undefined, []);
  const weekPlanningEnabled = Boolean(settings?.weekPlanningEnabled);
  const showStartChoice = settings ? !settings.onboardingSeen : false;
  const selectedWeekDay = isWeekDay(searchParams.get("weekDay")) ? searchParams.get("weekDay") as WeekDay : currentWeekDay();
  const todayWeekDay = currentWeekDay();
  const planningWeekDay = weekPlanningEnabled ? selectedWeekDay : null;
  const setWeekPlanning = async (enabled: boolean) => {
    await db.settings.update("app", { weekPlanningEnabled: enabled, onboardingSeen: true });
    if (enabled) {
      setSearchParams({ weekDay: selectedWeekDay });
    } else {
      setSearchParams({});
    }
    await reloadSettings();
  };
  return (
    <>
      <div className="phone-screen px-4 pb-5 pt-4">
      <PageHeader title="Dagindeling" subtitle="Voor ouders: routine instellen." />
      {showStartChoice ? (
        <section className="mb-4 rounded-[1.55rem] bg-gradient-to-b from-sky/18 via-white to-mint/12 p-4 shadow-soft">
          <h2 className="text-xl font-black text-navy">Hoe wil je starten?</h2>
          <div className="mt-4 grid gap-3">
            <button
              type="button"
              onClick={() => setWeekPlanning(false)}
              className={`rounded-[1.35rem] px-4 py-3.5 text-left shadow-card transition ${!weekPlanningEnabled ? "bg-white ring-2 ring-mint/45" : "bg-white/82 ring-1 ring-lavender/10"}`}
            >
              <span className="block text-lg font-black text-navy">Zelfde dagritme</span>
              <span className="mt-1 block text-sm font-medium leading-5 text-navy/58">Handig als alle dagen hetzelfde zijn.</span>
            </button>
            <button
              type="button"
              onClick={() => setWeekPlanning(true)}
              className={`rounded-[1.35rem] px-4 py-3.5 text-left shadow-card transition ${weekPlanningEnabled ? "bg-lavender text-white" : "bg-white/82 text-navy ring-1 ring-lavender/10"}`}
            >
              <span className="block text-lg font-black">Weekplanning</span>
              <span className={`mt-1 block text-sm font-medium leading-5 ${weekPlanningEnabled ? "text-white/82" : "text-navy/58"}`}>Handig als dagen van elkaar verschillen.</span>
            </button>
          </div>
        </section>
      ) : null}
      <section className="mb-4 rounded-[1.45rem] bg-white/92 p-4 shadow-card ring-1 ring-lavender/10">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-black text-navy">Weekplanning</h2>
            <p className="text-sm font-medium leading-5 text-navy/54">{weekPlanningEnabled ? "Aan: kies taken per dag." : "Uit: dezelfde dagindeling voor elke dag."}</p>
          </div>
          <button
            type="button"
            onClick={() => setWeekPlanning(!weekPlanningEnabled)}
            aria-pressed={weekPlanningEnabled}
            className={`flex min-h-12 items-center gap-3 rounded-[1.15rem] px-3 py-2 shadow-card transition ${weekPlanningEnabled ? "bg-lavender/14 text-lavender" : "bg-slate-100/88 text-navy/54"}`}
          >
            <span className="text-sm font-black">{weekPlanningEnabled ? "Aan" : "Uit"}</span>
            <span className={`relative block h-7 w-12 rounded-full transition ${weekPlanningEnabled ? "bg-lavender" : "bg-navy/18"}`}>
              <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-[0_3px_8px_rgba(31,35,90,.18)] transition ${weekPlanningEnabled ? "left-6" : "left-1"}`} />
            </span>
          </button>
        </div>
        {weekPlanningEnabled ? (
          <div className="mt-4 grid grid-cols-7 gap-1.5">
            {weekDays.map((day) => (
              <button
                key={day.id}
                type="button"
                onClick={() => setSearchParams({ weekDay: day.id })}
                className={`min-h-11 rounded-2xl text-sm font-black ${selectedWeekDay === day.id ? "bg-gradient-to-b from-[#b69cff] to-[#7857df] text-white shadow-[0_10px_18px_rgba(120,87,223,.22)]" : todayWeekDay === day.id ? "bg-mint/18 text-navy ring-2 ring-mint/45" : "bg-lavender/10 text-navy/62"}`}
                aria-label={day.label}
              >
                <span className="block leading-4">{day.short}</span>
                {todayWeekDay === day.id ? <span className="block text-[0.58rem] leading-3 opacity-80">nu</span> : null}
              </button>
            ))}
          </div>
        ) : null}
      </section>
      <div className="grid gap-3">
        {(["ochtend", "naSchool", "avond", "bedtijd"] as DayPart[]).map((part) => {
          const partTasks = tasks.filter((task) => task.dayPart === part && task.isEnabled && taskRunsOnDay(task, planningWeekDay));
          const done = partTasks.filter((task) => completions.some((completion) => completion.taskId === task.id && completion.status === "done")).length;
          return <DayPartCard key={part} title={dayPartTitle(part, planningWeekDay)} visualTitle={dayParts[part].title} icon={dayParts[part].icon} progress={partTasks.length ? (done / partTasks.length) * 100 : 0} to={`/day-settings/${part}${weekDayQuery(planningWeekDay)}`} />;
        })}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3"><PrimaryButton onClick={() => navigate(`/task-library?returnTo=${encodeURIComponent(returnToWithWeekDay("/day-settings", planningWeekDay))}`)}>Taak kiezen</PrimaryButton><SecondaryButton onClick={() => navigate(`/tasks/new?returnTo=${encodeURIComponent(returnToWithWeekDay("/day-settings", planningWeekDay))}`)}>Taak maken</SecondaryButton></div>
      </div>
    </>
  );
}

function DaySettingsPartPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { dayPart = "ochtend" } = useParams();
  const part = dayPart as DayPart;
  const { data: tasks, reload } = useLiveData(() => db.tasks.where("dayPart").equals(part).toArray(), [] as Task[], [part]);
  const { data: settings } = useLiveData(() => db.settings.get("app"), undefined, []);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [displayOrder, setDisplayOrder] = useState<string[]>([]);
  const [dragGhost, setDragGhost] = useState<{ x: number; y: number; width: number; height: number; offsetX: number; offsetY: number } | null>(null);
  const draggedTaskIdRef = useRef<string | null>(null);
  const dragReadyRef = useRef(false);
  const displayOrderRef = useRef<string[]>([]);
  const selectedWeekDay = isWeekDay(searchParams.get("weekDay")) ? searchParams.get("weekDay") as WeekDay : currentWeekDay();
  const planningWeekDay = settings?.weekPlanningEnabled ? selectedWeekDay : null;
  const visibleTasks = sortTasks(tasks.filter((task) => task.isEnabled && taskRunsOnDay(task, planningWeekDay)));
  useEffect(() => {
    if (!draggedTaskIdRef.current) {
      const nextOrder = visibleTasks.map((task) => task.id);
      displayOrderRef.current = nextOrder;
      setDisplayOrder(nextOrder);
    }
  }, [tasks, planningWeekDay]);
  const deleteTask = async (task: Task) => {
    if (planningWeekDay) {
      const currentWeekDays = task.weekDays?.length ? task.weekDays : weekDays.map((day) => day.id);
      const nextWeekDays = currentWeekDays.filter((day) => day !== planningWeekDay);
      if (nextWeekDays.length) {
        await db.tasks.update(task.id, { weekDays: nextWeekDays, repeatPattern: "aangepast", updatedAt: now() });
        await reload();
        return;
      }
    }
    await db.tasks.delete(task.id);
    await db.taskCompletions.where("taskId").equals(task.id).delete();
    await reload();
  };
  const startReorder = (event: React.PointerEvent<HTMLDivElement>, taskId: string) => {
    const target = event.target as HTMLElement;
    if (!target.closest("[data-drag-handle]")) return;
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    const initialOrder = visibleTasks.map((task) => task.id);
    draggedTaskIdRef.current = taskId;
    dragReadyRef.current = true;
    displayOrderRef.current = initialOrder;
    setDisplayOrder(initialOrder);
    setDraggedTaskId(taskId);
    setDragGhost({ x: rect.left, y: rect.top, width: rect.width, height: rect.height, offsetX: event.clientX - rect.left, offsetY: event.clientY - rect.top });
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };
  const updateReorder = (event: React.PointerEvent<HTMLDivElement>) => {
    const sourceTaskId = draggedTaskIdRef.current;
    if (!sourceTaskId || !dragReadyRef.current) return;
    event.preventDefault();
    setDragGhost((ghost) => ghost ? { ...ghost, x: event.clientX - ghost.offsetX, y: event.clientY - ghost.offsetY } : ghost);
    const target = document.elementsFromPoint(event.clientX, event.clientY)
      .map((element) => element.closest<HTMLElement>("[data-reorder-task-id]"))
      .find((element) => element?.dataset.reorderTaskId && element.dataset.reorderTaskId !== sourceTaskId);
    const targetTaskId = target?.dataset.reorderTaskId;
    if (!targetTaskId) return;
    setDisplayOrder((current) => {
      const next = current.length ? [...current] : visibleTasks.map((task) => task.id);
      const fromIndex = next.indexOf(sourceTaskId);
      const toIndex = next.indexOf(targetTaskId);
      if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return current;
      next.splice(fromIndex, 1);
      next.splice(toIndex, 0, sourceTaskId);
      displayOrderRef.current = next;
      return next;
    });
  };
  const finishReorder = async () => {
    const sourceTaskId = draggedTaskIdRef.current;
    const finalOrder = displayOrderRef.current.length ? displayOrderRef.current : visibleTasks.map((task) => task.id);
    dragReadyRef.current = false;
    draggedTaskIdRef.current = null;
    setDraggedTaskId(null);
    setDragGhost(null);
    if (sourceTaskId && finalOrder.includes(sourceTaskId)) {
      await db.transaction("rw", db.tasks, async () => {
        await Promise.all(finalOrder.map((taskId, sortOrder) => db.tasks.update(taskId, { sortOrder, updatedAt: now() })));
      });
      await reload();
    }
  };
  const taskById = new Map(visibleTasks.map((task) => [task.id, task]));
  const orderedTasks = (displayOrder.length ? displayOrder : visibleTasks.map((task) => task.id)).map((taskId) => taskById.get(taskId)).filter(Boolean) as Task[];
  const draggedTask = draggedTaskId ? taskById.get(draggedTaskId) : null;
  return (
    <>
      <div className="phone-screen px-4 pb-5 pt-4">
      <PageHeader title={`${dayPartTitle(part, planningWeekDay)} instellen`} subtitle={planningWeekDay ? weekDayLabel(planningWeekDay) : "Voor ouders: aanpassen en slepen."} backTo={`/day-settings${weekDayQuery(planningWeekDay)}`} />
      <section className="reorder-help-card mb-4 flex items-center gap-3 rounded-[1.45rem] bg-white/92 p-3 shadow-card ring-1 ring-lavender/10">
        <div className="drag-handle-preview flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-[1.1rem] bg-gradient-to-b from-lilac/34 to-lavender/16 text-lavender">
          <span className="text-2xl leading-none">{"\u22EE\u22EE"}</span>
          <span className="text-[0.62rem] font-black leading-none">Sleep</span>
        </div>
        <p className="min-w-0 text-base font-black leading-6 text-navy/68">Pak de paarse sleepknop vast en schuif de taak omhoog of omlaag.</p>
      </section>
      <div className="grid gap-3">
        {orderedTasks.map((task) => (
          <div
            key={task.id}
            data-reorder-task-id={task.id}
            onPointerDown={(event) => startReorder(event, task.id)}
            onPointerMove={updateReorder}
            onPointerUp={finishReorder}
            onPointerCancel={finishReorder}
            className={`reorder-task-card ${draggedTaskId === task.id ? "is-placeholder" : ""}`}
          >
            {draggedTaskId === task.id ? (
              <div className="reorder-placeholder" style={dragGhost ? { minHeight: dragGhost.height } : undefined} />
            ) : (
              <TaskCard task={task} done={false} onEdit={() => navigate(`/tasks/${task.id}/edit`)} onDelete={() => deleteTask(task)} editable />
            )}
          </div>
        ))}
      </div>
      {draggedTask && dragGhost ? (
        <div className="drag-floating-card" style={{ left: dragGhost.x, top: dragGhost.y, width: dragGhost.width }}>
          <TaskCard task={draggedTask} done={false} onEdit={() => navigate(`/tasks/${draggedTask.id}/edit`)} onDelete={() => deleteTask(draggedTask)} editable />
        </div>
      ) : null}
      <div className="mt-4 grid grid-cols-2 gap-3"><PrimaryButton onClick={() => navigate(`/task-library?dayPart=${part}&returnTo=${encodeURIComponent(returnToWithWeekDay(`/day-settings/${part}`, planningWeekDay))}`)}>Taak kiezen</PrimaryButton><SecondaryButton onClick={() => navigate(`/tasks/new?dayPart=${part}&returnTo=${encodeURIComponent(returnToWithWeekDay(`/day-settings/${part}`, planningWeekDay))}`)}>Taak maken</SecondaryButton></div>
      <p className="mt-3 text-center text-xs font-bold text-navy/45">Sleep taken omhoog of omlaag om de volgorde te veranderen.</p>
      </div>
    </>
  );
}

function TaskFormPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { taskId } = useParams();
  const requestedDayPart = searchParams.get("dayPart");
  const requestedWeekDay = isWeekDay(searchParams.get("weekDay")) ? searchParams.get("weekDay") as WeekDay : null;
  const returnTo = safeReturnPath(searchParams.get("returnTo"));
  const editing = Boolean(taskId);
  const { data: existing } = useLiveData(() => taskId ? db.tasks.get(taskId) : Promise.resolve(undefined), undefined as Task | undefined, [taskId]);
  const { data: settings } = useLiveData(() => db.settings.get("app"), undefined, []);
  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState("\u2B50");
  const [visualKey, setVisualKey] = useState<TaskVisualKey | "">("");
  const [showVisualBank, setShowVisualBank] = useState(false);
  const [dayPart, setDayPart] = useState<DayPart>(isDayPart(requestedDayPart) ? requestedDayPart : "ochtend");
  const [selectedWeekDays, setSelectedWeekDays] = useState<WeekDay[]>(requestedWeekDay ? [requestedWeekDay] : []);
  const [optionalTime, setOptionalTime] = useState("");
  const [steps, setSteps] = useState("");
  const [fallbackStrategyId, setFallbackStrategyId] = useState("");
  useEffect(() => { if (existing) { setTitle(existing.title); setIcon(existing.icon); setVisualKey((existing.visualKey as TaskVisualKey | undefined) ?? ""); setDayPart(existing.dayPart); setSelectedWeekDays(existing.weekDays ?? []); setOptionalTime(existing.optionalTime ?? ""); setSteps(existing.steps.join("\n")); setFallbackStrategyId(existing.fallbackStrategyId ?? ""); } }, [existing]);
  const weekPlanningEnabled = Boolean(settings?.weekPlanningEnabled);
  const toggleWeekDay = (weekDay: WeekDay) => setSelectedWeekDays((current) => current.includes(weekDay) ? current.filter((day) => day !== weekDay) : [...current, weekDay]);
  const save = async () => {
    const currentTasks = await db.tasks.where("dayPart").equals(dayPart).toArray();
    const taskSteps = steps.split("\n").map((step) => step.trim()).filter(Boolean);
    const weekDaysForTask = weekPlanningEnabled ? (selectedWeekDays.length ? selectedWeekDays : weekDays.map((day) => day.id)) : undefined;
    const finalTitle = title || "Nieuwe taak";
    const duplicateTask = findDuplicateTask(currentTasks, { title: finalTitle, dayPart, weekDays: weekDaysForTask, excludeTaskId: existing?.id });
    if (duplicateTask && !confirmDuplicateTask(duplicateTask, { title: finalTitle, dayPart, weekDays: weekDaysForTask })) return;
    const task: Task = { id: existing?.id ?? id(), childProfileId: "default-child", title: finalTitle, icon, visualKey: visualKey || undefined, fallbackStrategyId: fallbackStrategyId || undefined, category: "Eigen", ageGroup: "vrij", dayPart, sortOrder: existing?.sortOrder ?? currentTasks.length, steps: taskSteps.length ? taskSteps : ["Klaar."], repeatPattern: weekDaysForTask ? "aangepast" : "elkeDag", weekDays: weekDaysForTask, optionalTime: optionalTime || undefined, rewardEnabled: true, requiresHelp: false, isDefault: false, isEnabled: true, createdAt: existing?.createdAt ?? now(), updatedAt: now() };
    await db.tasks.put(task);
    if (existing && existing.dayPart !== dayPart) {
      await normalizeDayPartTaskOrder(existing.dayPart);
    }
    await normalizeDayPartTaskOrder(dayPart);
    navigate(returnTo ?? `/day-settings/${dayPart}${weekDayQuery(requestedWeekDay)}`);
  };
  const remove = async () => {
    if (!existing) return;
    await db.tasks.delete(existing.id);
    navigate(returnTo ?? `/day-settings/${existing.dayPart}${weekDayQuery(requestedWeekDay)}`);
  };
  return (
    <>
      <div className="phone-screen px-4 pb-5 pt-4">
      <PageHeader title={editing ? "Taak aanpassen" : "Nieuwe taak"} subtitle="Tijd is optioneel." />
      <div className="grid gap-3 rounded-[1.6rem] bg-white/90 p-4 shadow-soft">
        <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Titel" className="min-h-12 rounded-2xl border border-lavender/20 px-4 font-bold outline-none focus:ring-4 focus:ring-lavender/20" />
        <section className="rounded-[1.45rem] bg-gradient-to-br from-sky/12 via-white to-lavender/12 p-4 text-center shadow-card">
          <TaskArt title={title || "Nieuwe taak"} visualKey={visualKey || undefined} />
          <p className="mt-3 text-sm font-black text-navy">Flowi-plaatje</p>
          <p className="text-xs font-bold text-navy/48">{visualKey ? "Je koos zelf een plaatje." : "Flowi kiest automatisch op basis van de taaknaam."}</p>
          <button type="button" onClick={() => setShowVisualBank((value) => !value)} className="mt-3 rounded-2xl bg-white px-4 py-2 text-xs font-black text-lavender shadow-card">{showVisualBank ? "Beeldbank sluiten" : "Ander plaatje kiezen"}</button>
        </section>
        {showVisualBank ? (
          <section className="rounded-[1.4rem] bg-lavender/8 p-3">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-black">Flowi beeldbank</span>
              <button type="button" onClick={() => setVisualKey("")} className="text-xs font-black text-lavender">Automatisch</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {taskVisualOptions.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => { setVisualKey(option.key); setShowVisualBank(false); }}
                  className={`task-bank-card bg-white text-center shadow-card ring-2 ${visualKey === option.key ? "ring-lavender" : "ring-transparent"}`}
                >
                  <span className="task-bank-art">
                    <TaskArt title={option.label} visualKey={option.key} />
                  </span>
                  <div className="task-bank-title">{shortTaskTitle(option.label)}</div>
                  <div className="task-bank-hint">{option.hint}</div>
                </button>
              ))}
            </div>
          </section>
        ) : null}
        <select value={dayPart} onChange={(event) => setDayPart(event.target.value as DayPart)} className="min-h-12 rounded-2xl border border-lavender/20 px-4 font-bold"><option value="ochtend">Ochtend</option><option value="naSchool">Na school</option><option value="avond">Avond</option><option value="bedtijd">Bedtijd</option><option value="vrij">Vrij</option></select>
        {weekPlanningEnabled ? (
          <section className="rounded-[1.35rem] bg-lavender/8 p-3">
            <p className="mb-2 text-sm font-black text-navy">Welke dag?</p>
            <div className="grid grid-cols-7 gap-1.5">
              {weekDays.map((day) => (
                <button
                  key={day.id}
                  type="button"
                  onClick={() => toggleWeekDay(day.id)}
                  className={`min-h-11 rounded-2xl text-sm font-black ${selectedWeekDays.includes(day.id) ? "bg-gradient-to-b from-[#b69cff] to-[#7857df] text-white" : "bg-white text-navy/58"}`}
                  aria-label={day.label}
                >
                  {day.short}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs font-bold text-navy/46">Geen dag gekozen? Dan zet Flowi deze taak op alle dagen.</p>
          </section>
        ) : null}
        <label className="grid gap-2 rounded-[1.35rem] bg-lavender/8 p-3">
          <span className="text-sm font-black text-navy">Tijd toevoegen (optioneel)</span>
          <input
            type="time"
            value={optionalTime}
            onChange={(event) => setOptionalTime(event.target.value)}
            className="min-h-12 rounded-2xl border border-lavender/20 bg-white px-4 font-bold outline-none focus:ring-4 focus:ring-lavender/20"
          />
        </label>
        <textarea value={steps} onChange={(event) => setSteps(event.target.value)} placeholder={"Stapjes of notitie voor deze taak.\nJe mag hier zelf typen.\nLaat je dit leeg? Dan maakt Flowi er automatisch een simpele taak van."} className="min-h-32 rounded-2xl border border-lavender/20 p-4 font-bold outline-none placeholder:text-navy/32 focus:ring-4 focus:ring-lavender/20" />
        <label className="grid gap-2 rounded-[1.35rem] bg-lavender/8 p-3">
          <span className="text-sm font-black text-navy">Hulp als dit lastig is</span>
          <select value={fallbackStrategyId} onChange={(event) => setFallbackStrategyId(event.target.value)} className="min-h-12 rounded-2xl border border-lavender/20 bg-white px-4 font-bold">
            <option value="">Flowi kiest passende hulp</option>
            {calmStrategies.map((strategy) => <option key={strategy.id} value={strategy.id}>{strategy.title}</option>)}
          </select>
        </label>
        <PrimaryButton onClick={save}>Opslaan</PrimaryButton>
        {editing ? <button onClick={remove} className="min-h-12 rounded-2xl bg-coral/10 px-5 font-extrabold text-coral">Verwijderen</button> : null}
      </div>
      </div>
    </>
  );
}

function TaskLibraryPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedDayPart = searchParams.get("dayPart");
  const forcedDayPart = isDayPart(requestedDayPart) ? requestedDayPart : null;
  const requestedWeekDay = isWeekDay(searchParams.get("weekDay")) ? searchParams.get("weekDay") as WeekDay : null;
  const returnTo = safeReturnPath(searchParams.get("returnTo"));
  const [category, setCategory] = useState("Alles");
  const [search, setSearch] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<TaskTemplate | null>(null);
  const [selectedLibraryDayPart, setSelectedLibraryDayPart] = useState<DayPart>(forcedDayPart ?? "ochtend");
  const [selectedLibraryWeekDays, setSelectedLibraryWeekDays] = useState<WeekDay[]>(requestedWeekDay ? [requestedWeekDay] : []);
  const [selectedLibraryTime, setSelectedLibraryTime] = useState("");
  const { data: templates } = useLiveData(() => db.taskTemplates.toArray(), [], []);
  const { data: ownTasks } = useLiveData(() => db.tasks.where("category").equals("Eigen").toArray(), [] as Task[], []);
  const { data: settings } = useLiveData(() => db.settings.get("app"), undefined, []);
  const weekPlanningEnabled = Boolean(settings?.weekPlanningEnabled);
  const standardTemplates = useMemo(() => {
    const unique = new Map<string, TaskTemplate>();
    templates.forEach((template) => {
      if (blockedLibraryTaskTitles.has(normalizeTaskTitle(template.title))) return;
      const key = `${template.title.toLowerCase()}-${template.category.toLowerCase()}-${template.defaultDayPart}`;
      if (!unique.has(key)) unique.set(key, { ...template, ageGroup: "alle" });
    });
    return Array.from(unique.values());
  }, [templates]);
  const ownTemplates = useMemo(() => {
    const unique = new Map<string, TaskTemplate>();
    ownTasks.forEach((task) => {
      if (blockedLibraryTaskTitles.has(normalizeTaskTitle(task.title))) return;
      const key = `${task.title.toLowerCase()}-${task.steps.join("|").toLowerCase()}-${task.visualKey ?? ""}`;
      if (unique.has(key)) return;
      unique.set(key, {
        id: `own-${task.id}`,
        title: task.title,
        icon: task.icon,
        visualKey: task.visualKey,
        category: "Eigen taken",
        ageGroup: "eigen",
        defaultDayPart: task.dayPart,
        suggestedSteps: task.steps,
        estimatedMinutes: task.estimatedMinutes
      });
    });
    return Array.from(unique.values()).sort((a, b) => a.title.localeCompare(b.title));
  }, [ownTasks]);
  const libraryItems = [...ownTemplates, ...standardTemplates];
  const categories = ["Alles", ...Array.from(new Set(libraryItems.map((template) => template.category))).sort()];
  const normalizedSearch = search.trim().toLowerCase();
  const visibleTemplates = libraryItems
    .filter((template) => category === "Alles" || template.category === category)
    .filter((template) => !normalizedSearch || `${template.title} ${template.category} ${template.suggestedSteps.join(" ")}`.toLowerCase().includes(normalizedSearch))
    .sort((a, b) => a.category.localeCompare(b.category) || a.title.localeCompare(b.title));

  useEffect(() => {
    const cleanupIds = ownTasks
      .filter((task) => blockedLibraryTaskTitles.has(normalizeTaskTitle(task.title)))
      .map((task) => task.id);
    if (cleanupIds.length > 0) {
      void db.tasks.bulkDelete(cleanupIds);
    }
  }, [ownTasks]);
  const add = async (template: TaskTemplate, dayPart?: DayPart, weekDaysSelection?: WeekDay[] | null, optionalTimeSelection?: string) => {
    const targetDayPart = dayPart ?? forcedDayPart ?? template.defaultDayPart;
    const currentTasks = await db.tasks.where("dayPart").equals(targetDayPart).toArray();
    const weekDaysForTask = weekPlanningEnabled
      ? (weekDaysSelection?.length ? weekDaysSelection : undefined)
      : undefined;
    const duplicateTask = findDuplicateTask(currentTasks, { title: template.title, dayPart: targetDayPart, weekDays: weekDaysForTask });
    if (duplicateTask && !confirmDuplicateTask(duplicateTask, { title: template.title, dayPart: targetDayPart, weekDays: weekDaysForTask })) return;
    await db.tasks.add({ id: id(), childProfileId: "default-child", title: template.title, icon: template.icon, visualKey: template.visualKey, category: template.category, ageGroup: template.ageGroup, dayPart: targetDayPart, sortOrder: currentTasks.length, steps: template.suggestedSteps, repeatPattern: weekDaysForTask ? "aangepast" : "elkeDag", weekDays: weekDaysForTask, optionalTime: optionalTimeSelection || undefined, estimatedMinutes: template.estimatedMinutes, rewardEnabled: true, requiresHelp: false, isDefault: false, isEnabled: true, createdAt: now(), updatedAt: now() });
    await normalizeDayPartTaskOrder(targetDayPart);
    setSelectedTemplate(null);
    setSelectedLibraryTime("");
    navigate(returnTo ?? `/day-settings/${targetDayPart}${weekDayQuery(requestedWeekDay)}`);
  };
  const removeOwnTemplate = async (template: TaskTemplate) => {
    const matchingTasks = ownTasks.filter((task) =>
      task.title === template.title &&
      task.visualKey === template.visualKey &&
      task.steps.join("|") === template.suggestedSteps.join("|")
    );
    await db.transaction("rw", db.tasks, db.taskCompletions, async () => {
      await Promise.all(matchingTasks.map(async (task) => {
        await db.taskCompletions.where("taskId").equals(task.id).delete();
        await db.tasks.delete(task.id);
      }));
    });
  };
  const choose = (template: TaskTemplate) => {
    setSelectedLibraryDayPart(forcedDayPart ?? template.defaultDayPart);
    setSelectedLibraryWeekDays(requestedWeekDay ? [requestedWeekDay] : []);
    setSelectedLibraryTime("");
    setSelectedTemplate(template);
  };
  const toggleLibraryWeekDay = (weekDay: WeekDay) => {
    setSelectedLibraryWeekDays((current) => current.includes(weekDay) ? current.filter((day) => day !== weekDay) : [...current, weekDay]);
  };
  return (
    <>
      <div className="phone-screen px-4 pb-5 pt-4">
      <PageHeader title="Takenbibliotheek" />
      {ownTemplates.length ? <p className="mb-3 rounded-[1.25rem] bg-lavender/8 px-4 py-3 text-sm font-black text-navy/58">Zelf toegevoegde taken staan bij de categorie Eigen taken.</p> : null}
      <label className="mb-4 block rounded-[1.45rem] bg-white/94 p-3 shadow-card">
        <span className="sr-only">Zoek taak</span>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Zoek taak, bv. tanden, school, rust..."
          className="min-h-14 w-full rounded-[1.2rem] border border-lavender/16 bg-lavender/8 px-4 text-lg font-black text-navy outline-none placeholder:text-navy/36 focus:ring-4 focus:ring-lavender/20"
        />
      </label>
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {categories.map((item) => (
          <button key={item} onClick={() => setCategory(item)} className={`min-h-10 shrink-0 rounded-2xl px-4 text-sm font-black ${item === category ? "bg-mint text-white" : "bg-white text-navy/62 shadow-card"}`}>{item}</button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">{visibleTemplates.map((template) => {
        const ownTask = template.id.startsWith("own-");
        return (
          <article key={template.id} className="task-library-card bg-white text-center shadow-card">
            <button type="button" onClick={() => choose(template)} className="task-library-main">
              <span className="task-library-art">
                <TaskArt title={template.title} visualKey={template.visualKey as TaskVisualKey | undefined} />
              </span>
              <h3 className="task-library-title">{shortTaskTitle(template.title)}</h3>
              <p className="task-library-category">{template.category}</p>
              <p className="task-library-add">Toevoegen</p>
            </button>
            {ownTask ? (
              <button type="button" onClick={() => removeOwnTemplate(template)} className="mt-2 min-h-10 w-full rounded-2xl bg-coral/10 px-3 text-xs font-black text-coral">
                Verwijderen
              </button>
            ) : null}
          </article>
        );
      })}</div>
      {!visibleTemplates.length ? <div className="mt-4 rounded-[1.45rem] bg-white/90 p-5 text-center text-lg font-black text-navy/55 shadow-card">Geen taak gevonden.</div> : null}
      {selectedTemplate ? (
        <div className="fixed inset-0 z-40 grid place-items-end bg-navy/28 p-3 backdrop-blur-sm sm:place-items-center">
          <section className="flex max-h-[82vh] w-full max-w-xl flex-col overflow-hidden rounded-[1.9rem] bg-white p-4 shadow-soft">
            <div className="overflow-y-auto pr-1">
              <div className="grid grid-cols-[auto_1fr] items-center gap-3">
                <TaskArt title={selectedTemplate.title} visualKey={selectedTemplate.visualKey as TaskVisualKey | undefined} compact />
                <div>
                  <h2 className="text-xl font-black text-navy">{selectedTemplate.title}</h2>
                  <p className="text-sm font-bold text-navy/52">{forcedDayPart ? "Kies op welke dag deze taak komt." : "Kies waar deze taak in het dagritme hoort."}</p>
                </div>
              </div>
              {!forcedDayPart ? (
                <div className="mt-4 grid grid-cols-2 gap-2.5">
                  {(["ochtend", "naSchool", "avond", "bedtijd"] as DayPart[]).map((part) => (
                    <button key={part} type="button" onClick={() => setSelectedLibraryDayPart(part)} className={`rounded-[1.35rem] p-2.5 text-center shadow-card ring-2 ${part === selectedLibraryDayPart ? "bg-lavender text-white ring-lavender" : "bg-lavender/8 text-navy ring-transparent"}`}>
                      <TaskArt title={dayParts[part].title} compact />
                      <span className="mt-1.5 block text-base font-black">{dayParts[part].title}</span>
                      {part === selectedTemplate.defaultDayPart ? <span className="mt-0.5 block text-[0.7rem] font-black text-white/80">Past vaak hier</span> : null}
                    </button>
                  ))}
                </div>
              ) : null}
              <div className="mt-4 rounded-[1.35rem] bg-lavender/8 p-3">
                <label className="block text-sm font-black text-navy/58" htmlFor="library-task-time">Tijd toevoegen (optioneel)</label>
                <input
                  id="library-task-time"
                  type="time"
                  value={selectedLibraryTime}
                  onChange={(event) => setSelectedLibraryTime(event.target.value)}
                  className="mt-2 min-h-12 w-full rounded-2xl border border-lavender/20 bg-white px-4 font-bold outline-none focus:ring-4 focus:ring-lavender/20"
                />
              </div>
              {weekPlanningEnabled ? (
                <div className="mt-4">
                  <p className="mb-2 text-sm font-black text-navy/58">Voor welke dag(en)?</p>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {weekDays.map((day) => (
                      <button
                        key={day.id}
                        type="button"
                        onClick={() => toggleLibraryWeekDay(day.id)}
                        className={`min-w-[4rem] shrink-0 rounded-[1.1rem] px-2 py-2.5 text-center shadow-card ${selectedLibraryWeekDays.includes(day.id) ? "bg-mint text-white" : "bg-white text-navy/62"}`}
                      >
                        <span className="block text-xs font-black leading-4">{day.short}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
            <div className="mt-3 grid gap-3 border-t border-lavender/10 pt-3">
              <PrimaryButton
                className="w-full"
                onClick={() => void add(
                  selectedTemplate,
                  selectedLibraryDayPart,
                  weekPlanningEnabled ? selectedLibraryWeekDays : undefined,
                  selectedLibraryTime
                )}
                disabled={weekPlanningEnabled ? selectedLibraryWeekDays.length === 0 : false}
              >
                Taak toevoegen
              </PrimaryButton>
              <button type="button" onClick={() => setSelectedTemplate(null)} className="min-h-12 w-full rounded-2xl bg-lavender/10 px-5 font-black text-lavender">Annuleren</button>
            </div>
          </section>
        </div>
      ) : null}
      </div>
    </>
  );
}

function RewardsPage() {
  const { data: rewards } = useLiveData(() => db.rewards.orderBy("earnedAt").reverse().toArray(), [], []);
  const growthRewards = rewards.filter((reward) => reward.label !== "Ik maakte het af");
  const weekStart = startOfWeek();
  const weekRewards = growthRewards
    .filter((reward) => reward.earnedAt.slice(0, 10) >= weekStart)
    .sort((a, b) => a.earnedAt.localeCompare(b.earnedAt));
  const dailyGrowthLimit = 4;
  const countedPerDay: Record<string, number> = {};
  const weekGrowthMoments = weekRewards.filter((reward) => {
    const date = reward.earnedAt.slice(0, 10);
    const count = countedPerDay[date] ?? 0;
    if (count >= dailyGrowthLimit) return false;
    countedPerDay[date] = count + 1;
    return true;
  });
  const todaysRewards = weekGrowthMoments.filter((reward) => reward.earnedAt.slice(0, 10) === today());
  const treeStages = ["Zaadje", "Sprietje", "Plantje", "Boompje", "Rustboom"];
  const stageIndex = Math.min(treeStages.length - 1, weekGrowthMoments.length === 0 ? 0 : Math.ceil(weekGrowthMoments.length / 2));
  const treeDropTops = ["12.9rem", "12.1rem", "11.25rem", "10.35rem", "9.4rem"];
  const heartDropTops = ["9.7rem", "9.15rem", "8.5rem", "7.75rem", "7.05rem"];
  const careFallLefts = ["calc(var(--tree-x) + .15rem)", "calc(var(--tree-x) + .25rem)", "calc(var(--tree-x) + .35rem)", "calc(var(--tree-x) + .45rem)", "calc(var(--tree-x) + .55rem)"];
  const latestReward = growthRewards[0];
  const latestWeekReward = weekGrowthMoments[weekGrowthMoments.length - 1];
  const growthMessage = growthResponseForReward(latestReward ?? latestWeekReward);
  const careMode = growthMessage.careMode;
  return (
    <div className="phone-screen growth-garden px-4 pb-5 pt-2">
      <section className={`growth-hero growth-focus-scene growth-focus-${careMode} relative overflow-hidden rounded-[1.9rem] p-5 shadow-soft`}>
        <div className="cloud cloud-a" />
        <div className="leaf-float leaf-b" />
        <div className="relative z-10">
          <div className="text-xs font-black uppercase tracking-[0.16em] text-lavender">Deze week</div>
          <h2 className="mt-1 text-3xl font-black text-navy">{treeStages[stageIndex]}</h2>
          <p className="mt-2 max-w-[17rem] text-base font-black leading-6 text-navy">{growthMessage.title}</p>
          <p className="mt-2 max-w-[16rem] text-sm font-semibold leading-6 text-navy/62">{growthMessage.subtitle}</p>
        </div>

        <div
          className="growth-care-stage relative z-10 mt-5"
          aria-label="Flowi verzorgt de rustboom"
          style={{
            ["--drop-top" as string]: treeDropTops[stageIndex],
            ["--heart-top" as string]: heartDropTops[stageIndex],
            ["--care-fall-left" as string]: careFallLefts[stageIndex]
          }}
        >
          <div className="growth-care-sun" aria-hidden />
          <div className="growth-care-drops" aria-hidden><span /><span /><span /></div>
          <div className="growth-care-hearts" aria-hidden><span /><span /><span /><span /></div>
          <div className="growth-care-sparkles" aria-hidden><span /><span /><span /></div>
          <div className="growth-care-flowi" aria-hidden>
            <img src="/assets/flowi-home-mascot.png" alt="" className="growth-flowi-character" />
          </div>
          <div className="growth-care-tree">
            <span className={`growth-plant plant-${stageIndex} active`} />
          </div>
        </div>
      </section>
    </div>
  );
}

function PracticePage() {
  const navigate = useNavigate();
  const { data: exercises } = useLiveData(() => db.practiceExercises.toArray(), [], []);
  const [category, setCategory] = useState("Alles");
  const [activeExercise, setActiveExercise] = useState<PracticeExercise | null>(null);
  const [duration, setDuration] = useState(90);
  const [rounds, setRounds] = useState(1);
  const [remaining, setRemaining] = useState(90);
  const [running, setRunning] = useState(false);
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [completedExerciseId, setCompletedExerciseId] = useState<string | null>(null);
  const categories = ["Alles", ...Array.from(new Set(exercises.map((exercise) => exercise.category))).sort()];
  const visibleExercises = exercises
    .filter((exercise) => category === "Alles" || exercise.category === category)
    .sort((a, b) => a.category.localeCompare(b.category) || a.title.localeCompare(b.title));

  useEffect(() => {
    if (!activeExercise) return;
    const nextDuration = clampTimerSeconds(activeExercise.durationSeconds ?? 90);
    setDuration(nextDuration);
    setRemaining(nextDuration);
    setRounds(1);
    setRunning(false);
    setTimerEnabled(false);
    setCompletedExerciseId(null);
  }, [activeExercise]);

  const completeExercise = async (exercise: PracticeExercise | null) => {
    if (!exercise || completedExerciseId === exercise.id) return;
    setCompletedExerciseId(exercise.id);
    await addGrowthReward(exercise.rewardLabel ?? "Ik oefende", exercise.title);
    await db.practiceProgress.add({ id: id(), exerciseId: exercise.id, completedAt: now() });
    navigate("/rewards");
  };

  useEffect(() => {
    if (!running) return;
    if (remaining <= 0) {
      setRunning(false);
      void completeExercise(activeExercise);
      return;
    }
    const timer = window.setTimeout(() => setRemaining((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [running, remaining, activeExercise]);

  const setExerciseDuration = (value: number) => {
    const next = clampTimerSeconds(value);
    setDuration(next);
    setRemaining(next);
    setRunning(false);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60).toString();
    const rest = (seconds % 60).toString().padStart(2, "0");
    return `${minutes}:${rest}`;
  };

  if (activeExercise) {
    const progress = duration ? ((duration - remaining) / duration) * 100 : 0;
    return (
      <div className="phone-screen px-4 pb-5 pt-3">
        <header className="mb-3 flex items-center">
          <button aria-label="Terug naar oefeningen" className="grid h-14 w-14 place-items-center rounded-[1.25rem] border border-white bg-white/90 shadow-card focus:outline-none focus:ring-4 focus:ring-lavender/30" onClick={() => setActiveExercise(null)}>
            <ArrowLeft size={25} />
          </button>
        </header>
        {timerEnabled ? (
          <section className="rounded-[1.8rem] bg-gradient-to-b from-sky/16 via-white to-lavender/12 p-4 text-center shadow-soft">
            <ExerciseArt title={activeExercise.title} />
            <h1 className="mx-auto mt-3 max-w-xs text-2xl font-black leading-8 text-navy">{shortExerciseTitle(activeExercise.title)}</h1>
            <div className="mx-auto mt-4 grid h-32 w-32 place-items-center rounded-full bg-white text-4xl font-black text-lavender shadow-card ring-8 ring-lavender/10">{formatTime(remaining)}</div>
            <div className="mt-3 h-3 rounded-full bg-lilac/18"><div className="h-3 rounded-full bg-gradient-to-r from-mint via-honey to-lavender" style={{ width: `${progress}%` }} /></div>
          </section>
        ) : (
          <article className="flex items-center gap-3 rounded-[1.65rem] bg-white/94 p-4 shadow-card ring-1 ring-lavender/8">
            <section className="flex-1 rounded-[1.8rem] bg-gradient-to-b from-sky/16 via-white to-lavender/12 p-4 text-center shadow-soft">
              <ExerciseArt title={activeExercise.title} />
              <h1 className="mx-auto mt-3 max-w-xs text-2xl font-black leading-8 text-navy">{shortExerciseTitle(activeExercise.title)}</h1>
              <button type="button" onClick={() => setTimerEnabled(true)} className="mt-4 min-h-16 w-full rounded-[1.45rem] bg-white px-6 text-xl font-black text-lavender shadow-card">Timer</button>
            </section>
            <div className="grid gap-3" aria-label={`Acties voor ${activeExercise.title}`}>
              <button type="button" aria-label={`${activeExercise.title} is gelukt`} onClick={() => void completeExercise(activeExercise)} className="child-task-done">
                <Check size={30} />
              </button>
            </div>
          </article>
        )}
        {timerEnabled ? (
          <section className="mt-3 grid gap-3 rounded-[1.5rem] bg-white/92 p-4 shadow-card">
            <div className="flex items-center justify-between gap-3">
              <span className="text-lg font-black">Timer</span>
              <button type="button" onClick={() => { setTimerEnabled(false); setRunning(false); }} className="min-h-12 rounded-2xl bg-lavender px-5 text-base font-black text-white">Aan</button>
            </div>
            <div className="timer-slider-card">
              <div className="flex items-center justify-between">
                <span className="text-sm font-black text-navy/55">Kort</span>
                <span className="rounded-full bg-lavender/10 px-4 py-1.5 text-lg font-black text-lavender">{duration / 60} min</span>
                <span className="text-sm font-black text-navy/55">Rustig</span>
              </div>
              <input aria-label="Timer tijd" className="timer-slider mt-4" type="range" min={1} max={5} step={1} value={duration / 60} onChange={(event) => { setTimerEnabled(true); setExerciseDuration(Number(event.target.value) * 60); }} />
            </div>
            <div className="flex items-center justify-between">
              <span className="font-black">Keer</span>
              <div className="flex items-center gap-2">
                <button aria-label="Minder vaak" className="grid h-10 w-10 place-items-center rounded-2xl bg-mint/10 text-mint" onClick={() => setRounds((value) => Math.max(1, value - 1))}><Minus size={18} /></button>
                <span className="min-w-16 text-center font-black">{rounds}x</span>
                <button aria-label="Vaker" className="grid h-10 w-10 place-items-center rounded-2xl bg-mint/10 text-mint" onClick={() => setRounds((value) => Math.min(20, value + 1))}><Plus size={18} /></button>
              </div>
            </div>
          </section>
        ) : null}
        <section className="mt-3 rounded-[1.5rem] bg-white/92 p-4 shadow-card ring-1 ring-lavender/10">
          <div className="flex items-start gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-lavender/10 text-lavender"><ShieldCheck size={20} /></div>
            <div>
              <h2 className="text-base font-black text-navy">Voor groot mens</h2>
              <p className="mt-1 text-sm font-medium leading-6 text-navy/58">{exerciseCaregiverTip(activeExercise)}</p>
            </div>
          </div>
        </section>
        {timerEnabled ? (
          <div className="mt-3 grid grid-cols-3 gap-2">
            <SecondaryButton onClick={() => { setRemaining(duration); setRunning(false); }}><RotateCcw className="mx-auto" size={20} /></SecondaryButton>
            <PrimaryButton className="col-span-2" onClick={() => setRunning((value) => !value)}>{running ? <><Pause className="mr-2 inline" size={18} /> Pauze</> : <><Play className="mr-2 inline" size={18} /> Start samen</>}</PrimaryButton>
          </div>
        ) : null}
        <section className="mt-3 rounded-[1.5rem] bg-white/92 p-4 shadow-card">
          <h2 className="font-black">Doe maar zo</h2>
          <ol className="mt-2 grid gap-2">
            {activeExercise.steps.map((step, index) => <li key={step} className="flex gap-3 rounded-2xl bg-lavender/8 p-3 text-sm font-medium leading-6 text-navy/68"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white text-xs font-black text-lavender shadow-card">{index + 1}</span>{step}</li>)}
          </ol>
        </section>
      </div>
    );
  }

  return (
    <div className="phone-screen px-4 pb-5 pt-4">
      <PageHeader title="Oefeningen" back={false} />
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {categories.map((item) => (
          <button key={item} onClick={() => setCategory(item)} className={`min-h-12 shrink-0 rounded-2xl px-5 text-base font-black ${item === category ? "bg-lavender text-white" : "bg-white text-navy/62 shadow-card"}`}>{item}</button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {visibleExercises.map((exercise) => (
          <button key={exercise.id} onClick={() => setActiveExercise(exercise)} className="exercise-choice-card flowi-picture-card transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-lavender/30">
            <span className="flowi-picture-art">
              <ExerciseArt title={exercise.title} />
            </span>
            <span className="flowi-picture-label">{shortExerciseTitle(exercise.title)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function AvatarPage() {
  const navigate = useNavigate();
  const { data: profile, reload } = useProfile();
  const [selected, setSelected] = useState(profile?.selectedAvatarId ?? "giraffe");
  useEffect(() => { if (profile?.selectedAvatarId) setSelected(profile.selectedAvatarId); }, [profile]);
  const save = async () => { if (profile) { await db.childProfiles.update(profile.id, { selectedAvatarId: selected, updatedAt: now() }); await reload(); navigate("/"); } };
  return (
    <>
      <div className="phone-screen px-4 pb-5 pt-4">
      <PageHeader title="Mijn maatje" subtitle="Flowi is er voor jou." />
      <div className="rounded-[1.8rem] bg-gradient-to-b from-sky/18 via-white to-mint/14 p-5 text-center shadow-soft">
        <AvatarMascot avatar={avatarAssets[0]} size="large" />
        <h2 className="mt-4 text-2xl font-black text-navy">Flowi</h2>
        <p className="mx-auto mt-2 max-w-xs text-sm font-bold leading-6 text-navy/58">Je vaste giraffe-maatje helpt met voelen, kiezen en kleine stapjes doen.</p>
      </div>
      <PrimaryButton className="mt-4 w-full" onClick={save}>Flowi gebruiken</PrimaryButton>
      </div>
    </>
  );
}

function ParentsPage() {
  return (
    <>
      <PageHeader title="Voor ouders" subtitle="Alles blijft op dit apparaat bewaard." backTo="/" />
      <section className="mb-4 rounded-[1.55rem] bg-gradient-to-b from-lavender/12 via-white to-sky/12 p-4 shadow-card">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-lavender/12 text-lavender"><Database size={24} /></div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-black text-navy">Backup bewaren</h2>
            <p className="text-sm font-bold leading-5 text-navy/52">Maak af en toe een backup, vooral na het instellen van routines.</p>
          </div>
        </div>
      </section>
      <div className="grid gap-3">
        <ParentCard icon={<Database />} title="Backup bewaren" text="Backup maken en terugzetten." to="/backup" />
        <ParentCard icon={<CalendarDays />} title="Dagindeling" text="Taken beheren en routines maken." to="/day-settings" />
        <ParentCard icon={<BookOpen />} title="Takenbibliotheek" text="Taken zoeken en toevoegen." to="/task-library" />
        <ParentCard icon={<Database />} title="Over Flowi" text="Uitleg over de app en hoe die bedoeld is." to="/about" />
        <ParentCard icon={<HeartHandshake />} title="Privacy" text="Lokale opslag en veiligheid." to="/privacy" />
      </div>
    </>
  );
}

function SettingsPage() {
  return (
    <>
      <PageHeader title="Instellingen" subtitle="Rustig en eenvoudig." />
      <section className="mb-4 rounded-[1.55rem] bg-white/94 p-4 shadow-card">
        <h2 className="text-xl font-black text-navy">Eenvoudig houden</h2>
        <p className="mt-1.5 text-base leading-6 text-navy/68">Flowi gebruikt zo min mogelijk tekst. De app werkt vooral met plaatjes, keuzes en kleine stappen.</p>
      </section>
      <button onClick={async () => { await db.delete(); location.reload(); }} className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-white p-4 font-black text-coral shadow-card"><Trash2 size={18} /> Data resetten</button>
    </>
  );
}

function BackupPage() {
  const [message, setMessage] = useState("");
  const download = async () => {
    const backup = await exportBackup();
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `flowi-backup-${today()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage("Backup gemaakt.");
  };
  const upload = async (file?: File) => {
    await restoreBackupFile(file, setMessage);
  };
  return (
    <>
      <PageHeader title="Backup bewaren" subtitle="Bewaar je lokale gegevens rustig op tijd." />
      <section className="rounded-[1.6rem] bg-gradient-to-b from-lavender/12 via-white to-sky/12 p-4 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-lavender/12 text-lavender"><Database size={24} /></div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-black text-navy">Backup bewaren</h2>
            <p className="text-sm font-bold leading-5 text-navy/52">Flowi werkt ook offline. Alles blijft lokaal op dit apparaat staan, behalve als appgegevens bewust gewist of vervangen worden. Maak daarom af en toe een backup.</p>
          </div>
        </div>
      </section>
      <section className="mt-4 rounded-[1.6rem] bg-white p-4 shadow-soft">
        <div className="grid gap-3">
          <PrimaryButton onClick={download}><icons.Download className="mr-2 inline" size={18} />Backup maken</PrimaryButton>
          <label className="flex min-h-14 cursor-pointer items-center justify-center rounded-[1.45rem] bg-gradient-to-b from-[#b69cff] via-[#9473f5] to-[#7857df] px-6 text-lg font-black text-white shadow-[0_14px_24px_rgba(120,87,223,.28)] transition active:scale-[.98] focus-within:ring-4 focus-within:ring-lavender/30"><icons.Upload className="mr-2 inline" size={18} />Backup terugzetten<input type="file" accept={backupFileAccept} className="sr-only" onChange={(event) => upload(event.target.files?.[0])} /></label>
        </div>
        {message ? <p className="mt-3 font-black text-mint">{message}</p> : null}
      </section>
    </>
  );
}

function PrivacyPage() {
  return (
    <>
      <PageHeader title="Privacy" />
      <div className="rounded-[1.6rem] bg-white p-5 shadow-soft">
        <p className="text-base font-normal leading-6 text-navy/68">Flowi gebruikt geen account en bewaart gegevens op dit apparaat. Er wordt in deze versie niets naar een eigen server verstuurd.</p>
        <p className="mt-2 text-base font-normal leading-6 text-navy/58">Flowi is bedoeld om ook zonder internet te blijven werken. Aangevinkte taken, ingestelde routines en groeimomenten blijven lokaal bewaard en horen niet ineens te verdwijnen zodra een toestel weer online komt.</p>
        <p className="mt-2 text-base font-normal leading-6 text-navy/58">Flowi vraagt in deze versie geen camera, microfoon of locatie om de app te gebruiken. Als je appgegevens of sitegegevens wist, kunnen instellingen en voortgang wel verdwijnen. Daarom is het verstandig om na belangrijke wijzigingen af en toe een backup te maken.</p>
        <p className="mt-2 text-base font-normal leading-6 text-navy/58">Als je zelf een backup deelt via je eigen telefoon of berichtenapp, kies je daar zelf voor. Controleer dan zelf met wie je dat bestand deelt en waar je het bewaart.</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <a href="/privacy-policy.html" target="_blank" rel="noreferrer" className="flex min-h-14 items-center justify-center rounded-[1.45rem] border border-lavender/14 bg-white/92 px-6 text-lg font-black text-navy shadow-card">
            Publieke privacy policy
          </a>
          <a href="/child-safety.html" target="_blank" rel="noreferrer" className="flex min-h-14 items-center justify-center rounded-[1.45rem] border border-lavender/14 bg-white/92 px-6 text-lg font-black text-navy shadow-card">
            Kind & veiligheid
          </a>
        </div>
      </div>
    </>
  );
}

function AboutPage() {
  const bodyText = "text-base font-normal leading-6 text-navy/58";
  return (
    <>
      <PageHeader title="Over Flowi" subtitle="Voor ouders en verzorgers." />
      <section className="overflow-hidden rounded-[1.8rem] bg-gradient-to-b from-sky/18 via-white to-mint/12 p-5 shadow-soft">
        <div className="grid grid-cols-[1fr_auto] items-end gap-3">
          <div>
            <h2 className="text-3xl font-black text-navy">Wat is Flowi?</h2>
            <p className={`mt-2 ${bodyText}`}>Flowi is een visueel hulpmiddel voor jonge kinderen en de volwassenen om hen heen. De app helpt om de dag overzichtelijk te maken, spanning eerder te zien en samen kleine helpende stapjes te kiezen.</p>
          </div>
          <img src="/assets/flowi-home-mascot.png" alt="" className="about-flowi-image" />
        </div>
      </section>

      <section className="mt-4 grid gap-2.5">
        <div className="rounded-[1.55rem] bg-white/94 p-4 shadow-card">
          <h3 className="text-xl font-black text-navy">Voor wie is Flowi bedoeld?</h3>
          <p className={`mt-1.5 ${bodyText}`}>Flowi past bij jonge kinderen die nog niet altijd woorden hebben voor gevoel, spanning, onrust of wat er misgaat in een taak of overgang.</p>
          <p className={`mt-2 ${bodyText}`}>De app kan helpend zijn bij dagelijkse situaties waarin een kind baat heeft bij voorspelbaarheid, visuele steun, herhaling en kleine keuzes thuis, op school of in de opvang.</p>
        </div>
        <div className="rounded-[1.55rem] bg-white/94 p-4 shadow-card">
          <h3 className="text-xl font-black text-navy">Wat doet de app?</h3>
          <p className={`mt-1.5 ${bodyText}`}>Flowi werkt met grote plaatjes, korte woorden en duidelijke keuzes. Zo hoeft een kind niet veel te lezen om toch te kunnen aanwijzen wat het voelt, wat het nodig heeft of wat het al gedaan heeft.</p>
          <p className={`mt-2 ${bodyText}`}>De app ondersteunt vooral drie dingen: dagstructuur, gevoel zichtbaar maken en samen een klein passend stapje kiezen wanneer iets lastig wordt.</p>
        </div>
        <div className="rounded-[1.55rem] bg-white/94 p-4 shadow-card">
          <h3 className="text-xl font-black text-navy">Rol van ouder, verzorger of leerkracht</h3>
          <p className={`mt-1.5 ${bodyText}`}>Flowi is bedoeld om samen te gebruiken. De volwassene zet de structuur neer, bewaakt de inhoud en helpt het kind om te vertragen, te kiezen en weer verder te kunnen.</p>
          <p className={`mt-2 ${bodyText}`}>Je hoeft niet te wachten tot een kind zelf woorden vindt. Ook als jij spanning opmerkt, kun je Flowi samen openen en kijken wat er speelt, wat helpend kan zijn en welk klein stapje nu past.</p>
        </div>
        <div className="rounded-[1.55rem] bg-white/94 p-4 shadow-card">
          <h3 className="text-xl font-black text-navy">Spanning signaleren en samen kiezen</h3>
          <p className={`mt-1.5 ${bodyText}`}>Een kind kan met Flowi laten zien hoe het zich voelt of wat het nodig heeft. Maar Flowi kan ook gebruikt worden als een volwassene spanning, onrust of vastlopen opmerkt voordat een kind daar zelf woorden voor heeft.</p>
          <p className={`mt-2 ${bodyText}`}>De oefeningen en keuzes in Flowi zijn bewust kort en visueel. Ze zijn bedoeld als kleine ondersteunende stapjes, niet als oplossing voor alles wat een kind voelt of meemaakt.</p>
          <p className={`mt-2 ${bodyText}`}>Samen reguleren blijft daarbij belangrijk: Flowi helpt het gesprek en de keuze op gang, maar de volwassene blijft degene die nabij is en inschat wat nu passend is.</p>
        </div>
        <div className="rounded-[1.55rem] bg-white/94 p-4 shadow-card">
          <h3 className="text-xl font-black text-navy">Wat helpt een volwassene in het moment?</h3>
          <p className={`mt-1.5 ${bodyText}`}>Rustig blijven, dichtbij blijven en maar één kleine stap tegelijk aanbieden helpt vaak meer dan veel praten of veel uitleg tegelijk geven.</p>
          <p className={`mt-2 ${bodyText}`}>Je hoeft niet alles op te lossen. Soms is samen kijken, één keuze aanwijzen, een oefening voordoen of even meedoen al precies genoeg.</p>
        </div>
        <div className="rounded-[1.55rem] bg-white/94 p-4 shadow-card">
          <h3 className="text-xl font-black text-navy">Wie is Flowi?</h3>
          <p className={`mt-1.5 ${bodyText}`}>Flowi is een rustig maatje in de app: zacht, duidelijk en geduldig. Hij helpt zonder druk te zetten en maakt grote dingen kleiner.</p>
          <p className={`mt-2 ${bodyText}`}>Daarom gebruikt de app zo min mogelijk tekst en zo veel mogelijk herkenbare beelden, vaste kleuren en voorspelbare keuzes.</p>
        </div>
      </section>

      <section className="mt-4 rounded-[1.8rem] bg-white/94 p-5 shadow-soft">
        <h2 className="text-2xl font-black text-navy">Groeiboom</h2>
        <div className={`mt-2 grid gap-2 ${bodyText}`}>
          <p>De groeiboom is een zachte aanmoediging. Het is geen scorebord en geen systeem van straf of goed/fout.</p>
          <p>Flowi laat de boom groeien na momenten van voelen, oefenen, hulp vragen of samen stilstaan bij wat hielp.</p>
          <p>Taken afvinken staat bewust los van de boom. Zo blijft groei gekoppeld aan emotieregulatie en niet aan presteren.</p>
        </div>
      </section>

      <section className="mt-4 rounded-[1.8rem] bg-white/94 p-5 shadow-soft ring-1 ring-lavender/10">
        <h2 className="text-2xl font-black text-navy">Wat Flowi wel en niet is</h2>
        <div className={`mt-2 grid gap-2 ${bodyText}`}>
          <p>Flowi is een hulpmiddel voor structuur, samen reguleren en kleine helpende keuzes in het moment.</p>
          <p>Flowi is geen medische of psychologische behandeling, geen diagnose-instrument en geen vervanging van professionele hulp.</p>
          <p>De app doet geen uitspraken over de gezondheid van een kind en is niet bedoeld voor noodsituaties of acute crises. Bij zorgen over veiligheid, gezondheid of ontwikkeling is extra beoordeling of hulp buiten Flowi belangrijk.</p>
          <p>Blijft een kind vaak vastlopen of is er meer steun nodig dan de app kan geven, dan is dat geen mislukking van Flowi maar een teken dat extra begeleiding belangrijk is.</p>
        </div>
      </section>

      <section className="mt-4 rounded-[1.8rem] bg-white/94 p-5 shadow-soft">
        <h2 className="text-2xl font-black text-navy">Gegevens en transparantie</h2>
        <div className={`mt-2 grid gap-2 ${bodyText}`}>
          <p>Flowi gebruikt in deze versie geen account en bewaart gegevens op dit apparaat. De app is bedoeld om ook offline bruikbaar te blijven, zodat routines, vinkjes en groeimomenten lokaal bewaard blijven.</p>
          <p>Een internetverbinding is in deze versie niet nodig om de basis van Flowi te gebruiken. Gegevens verdwijnen niet zomaar door opnieuw online komen, maar kunnen wel verloren gaan als appgegevens gewist worden of een backup bewust wordt overschreven.</p>
          <p>Als functies in de toekomst veranderen, zoals gegevens delen of extra apparaatfuncties gebruiken, dan horen die wijzigingen duidelijk uitgelegd te worden in de app en in de store-informatie.</p>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <a href="/privacy-policy.html" target="_blank" rel="noreferrer" className="flex min-h-14 items-center justify-center rounded-[1.45rem] border border-lavender/14 bg-white/92 px-6 text-lg font-black text-navy shadow-card">
            Privacy policy openen
          </a>
          <a href="/child-safety.html" target="_blank" rel="noreferrer" className="flex min-h-14 items-center justify-center rounded-[1.45rem] border border-lavender/14 bg-white/92 px-6 text-lg font-black text-navy shadow-card">
            Kind & veiligheid openen
          </a>
        </div>
      </section>
    </>
  );
}

function AppRoutes() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/check-in" element={<CheckInPage />} />
        <Route path="/check-in/weet-ik-niet" element={<UnsureEmotionPage />} />
        <Route path="/need" element={<NeedPage />} />
        <Route path="/action/:actionId" element={<ActionPage />} />
        <Route path="/help-now" element={<HelpNowPage />} />
        <Route path="/reflection" element={<ReflectionPage />} />
        <Route path="/day" element={<DayPage />} />
        <Route path="/day/:dayPart" element={<DayPartPage />} />
        <Route path="/day-settings" element={<ParentGate><DaySettingsPage /></ParentGate>} />
        <Route path="/day-settings/:dayPart" element={<ParentGate><DaySettingsPartPage /></ParentGate>} />
        <Route path="/tasks" element={<Navigate to="/day" />} />
        <Route path="/tasks/new" element={<ParentGate><TaskFormPage /></ParentGate>} />
        <Route path="/tasks/:taskId/edit" element={<ParentGate><TaskFormPage /></ParentGate>} />
        <Route path="/task-library" element={<ParentGate><TaskLibraryPage /></ParentGate>} />
        <Route path="/rewards" element={<RewardsPage />} />
        <Route path="/practice" element={<PracticePage />} />
        <Route path="/avatar" element={<AvatarPage />} />
        <Route path="/parents" element={<ParentGate><ParentsPage /></ParentGate>} />
        <Route path="/settings" element={<ParentGate><SettingsPage /></ParentGate>} />
        <Route path="/backup" element={<ParentGate><BackupPage /></ParentGate>} />
        <Route path="/privacy" element={<ParentGate><PrivacyPage /></ParentGate>} />
        <Route path="/about" element={<ParentGate><AboutPage /></ParentGate>} />
      </Routes>
    </AppShell>
  );
}

function Bootstrap() {
  const [ready, setReady] = useState(false);
  useEffect(() => { seedDatabase().finally(() => setReady(true)); }, []);
  useEffect(() => { void requestPersistentStorage(); }, []);
  useEffect(() => {
    const orientation = screen.orientation as ScreenOrientation & { lock?: (orientation: string) => Promise<void> };
    void orientation.lock?.("portrait-primary").catch(() => undefined);
  }, []);
  const loader = useMemo(() => <div className="grid min-h-dvh place-items-center bg-cream text-2xl font-black text-lavender">Flowi</div>, []);
  if (!ready) return loader;
  return <BrowserRouter><AppRoutes /></BrowserRouter>;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Bootstrap />
  </React.StrictMode>
);


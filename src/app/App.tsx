import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { registerSW } from "virtual:pwa-register";
import { BookOpen, CalendarDays, Database, HeartHandshake, Minus, Palette, Pause, Play, Plus, RotateCcw, ShieldCheck, Sparkles, Trash2 } from "lucide-react";
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
import type { Avatar, CalmStrategy, DayPart, EmotionType, NeedType, PracticeExercise, Task, TaskTemplate } from "../types/schema";
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

const today = () => new Date().toISOString().slice(0, 10);
const id = () => crypto.randomUUID();
const now = () => new Date().toISOString();
const addGrowthReward = (label: string, reason: string) => db.rewards.add({ id: id(), childProfileId: "default-child", label, icon: "*", reason, earnedAt: now() });
const clampTimerSeconds = (seconds: number) => Math.min(300, Math.max(60, Math.round(seconds / 60) * 60));
const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    updateSW(true);
  },
  onRegisteredSW(_swUrl, registration) {
    window.setInterval(() => {
      registration?.update();
    }, 60 * 60 * 1000);
  }
});
const startOfWeek = () => {
  const date = new Date();
  const day = date.getDay() || 7;
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - day + 1);
  return date.toISOString().slice(0, 10);
};
type HelpReason = Extract<EmotionType, "teVeel" | "boos" | "moe" | "inDeWar">;
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
const sortTasks = (tasks: Task[]) => [...tasks].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.createdAt.localeCompare(b.createdAt));
const helpReasons: { id: HelpReason; label: string; need: NeedType; tips: string[] }[] = [
  { id: "teVeel", label: "Te veel", need: "rustigePlek", tips: ["Maak de taak kleiner.", "Kies minder prikkels: zachter licht, minder geluid.", "Doe eerst 5 rustige ademhalingen."] },
  { id: "boos", label: "Boos", need: "bewegen", tips: ["Stop even met de taak.", "Geef je lijf stevig werk.", "Vraag daarna samen wat de eerste kleine stap is."] },
  { id: "moe", label: "Moe", need: "rustigePlek", tips: ["Neem een korte pauze.", "Maak de taak lichter of doe alleen de eerste stap.", "Vraag of iemand even naast je blijft."] },
  { id: "inDeWar", label: "In de war", need: "praatMetOuder", tips: ["Vraag je ouder: geef mij twee keuzes.", "Laat iemand de taak voordoen.", "Doe samen alleen de eerste stap."] }
];

function fallbackStrategyForTask(task: Task, reason: HelpReason) {
  const parentChoice = task.fallbackStrategyId ? calmStrategies.find((strategy) => strategy.id === task.fallbackStrategyId) : undefined;
  if (parentChoice) return parentChoice;
  const title = task.title.toLowerCase();
  if (title.includes("tablet") || title.includes("scherm")) {
    if (reason === "boos") return calmStrategies.find((strategy) => strategy.title === "Zeg: stop, ik heb hulp nodig") ?? chooseStrategy(reason, "praatMetOuder");
    return calmStrategies.find((strategy) => strategy.title === "Maak het licht zachter") ?? chooseStrategy(reason, "rustigePlek");
  }
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
    emotion === "blij" ? "rustig" :
    emotion === "overprikkeld" ? "teVeel" :
    emotion === "druk" ? "superDruk" :
    emotion === "spannend" || emotion === "snapNiet" || emotion === "durfNiet" || emotion === "wilHulp" ? "inDeWar" :
    emotion;
  const exactMatch = calmStrategies.find((strategy) => (!normalizedEmotion || strategy.linkedEmotionTypes.includes(normalizedEmotion)) && (!need || strategy.linkedNeedTypes.includes(need)));
  if (exactMatch) return exactMatch;

  const preferredByNeed: Record<NeedType, string[]> = {
    knuffel: ["Pak iets zachts", "Vraag een knuffel", "Kies dichtbij of ruimte"],
    rustigePlek: ["Ga naar je rustige plek", "Zoek een rustig plekje", "Licht zachter"],
    bewegen: ["Spring 10 keer", "Schud je armen los", "Draag iets zwaars"],
    evenAlleen: ["Even niets", "Kruip onder een deken", "Zoek een rustig plekje"],
    praatMetOuder: ["Kies samen", "Zeg: ik weet het even niet", "Zeg: stop, ik heb hulp nodig"],
    ademen: ["Adem zacht", "Hand op je hart", "Geef je rustkracht water"],
    koptelefoon: ["Zet je koptelefoon op", "Maak het licht zachter", "Ga naar je rustige plek"],
    creatief: ["Teken je wolk", "Bewaar dit gevoel", "Kies iets fijns"]
  };

  const preferred = need ? preferredByNeed[need].map((title) => calmStrategies.find((strategy) => strategy.title === title)).find(Boolean) : undefined;
  if (preferred) return preferred;

  return calmStrategies.find((strategy) => need ? strategy.linkedNeedTypes.includes(need) : false)
    ?? calmStrategies.find((strategy) => emotion ? strategy.linkedEmotionTypes.includes(emotion) : false)
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

function helpNowNeedForTitle(title: string): NeedType {
  const normalized = title.toLowerCase();
  if (normalized.includes("rustige") || normalized.includes("rustig plekje")) return "rustigePlek";
  if (normalized.includes("adem")) return "ademen";
  if (normalized.includes("hulp") || normalized.includes("stop")) return "praatMetOuder";
  if (normalized.includes("zachts") || normalized.includes("knuffel")) return "knuffel";
  return "rustigePlek";
}

function HomePage() {
  const navigate = useNavigate();
  return (
    <section className="phone-screen home-scene relative overflow-hidden px-5 pb-4 pt-5">
      <div className="cloud cloud-a" />
      <div className="cloud cloud-b" />
      <div className="leaf-float leaf-a" />
      <div className="leaf-float leaf-b" />
      <div className="home-content relative z-10">
        <div className="flowi-logo mb-1">Flowi<span>\u2665</span></div>
        <div className="home-main-stage">
        <div className="home-mascot-wrap relative" aria-label="Flowi helpt jou">
          <img src="/assets/flowi-home-mascot.png" alt="" className="home-mascot-free" />
        </div>
        <div className="home-visual-actions" aria-label="Kies wat je wilt doen">
          <button type="button" onClick={() => navigate("/check-in")} className="home-visual-card home-visual-feel" aria-label="Wat voel je?">
            <span className="home-visual-art" aria-hidden />
            <span className="home-visual-label">Wat voel je?</span>
          </button>
          <button type="button" onClick={() => navigate("/day")} className="home-visual-card home-visual-day" aria-label="Taken doen">
            <span className="home-visual-art" aria-hidden />
            <span className="home-visual-label">Taken doen</span>
          </button>
          <button type="button" onClick={() => navigate("/help-now")} className="home-visual-card home-visual-help" aria-label="Help mij">
            <span className="home-visual-art" aria-hidden />
            <span className="home-visual-label">Help mij</span>
          </button>
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
      <PageHeader title="Hoe voel je je nu?" subtitle="Kies wat het beste past." />
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
  const { setEmotion } = useCurrentFlow();
  return (
    <div className="phone-screen px-4 pb-5 pt-4">
      <PageHeader title="Je koos: weet ik niet" subtitle="Wat past misschien?" />
      <div className="grid grid-cols-2 gap-3">
        {unsureEmotions.map((emotion) => (
          <EmotionCard key={emotion.id} emotion={emotion} onClick={() => { setEmotion(emotion.id); navigate("/need"); }} />
        ))}
      </div>
    </div>
  );
}

function NeedPage() {
  const navigate = useNavigate();
  const { selectedEmotion, setNeed, setAction } = useCurrentFlow();
  const { data: profile } = useProfile();
  const filteredNeeds = selectedEmotion === "wilHulp"
    ? needs.filter((need) => ["praatMetOuder", "knuffel"].includes(need.id))
    : selectedEmotion === "durfNiet" || selectedEmotion === "spannend"
      ? needs.filter((need) => ["praatMetOuder", "ademen", "rustigePlek", "knuffel"].includes(need.id))
      : selectedEmotion === "snapNiet" || selectedEmotion === "weetIkNiet"
        ? needs.filter((need) => ["praatMetOuder", "creatief", "ademen", "rustigePlek"].includes(need.id))
        : needs;
  const caregiver = profile?.caregiverName || profile?.caregiverLabel || "ouder";
  return (
    <div className="phone-screen px-4 pb-5 pt-4">
      <PageHeader title="Wat heb je nu nodig?" subtitle="Kies wat jou kan helpen." />
      <div className="grid grid-cols-2 gap-3">
        {filteredNeeds.map((need) => (
          <NeedCard
            key={need.id}
            need={need}
            label={need.id === "praatMetOuder" ? `Praat met ${caregiver}` : need.label}
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
  const { selectedEmotion, selectedNeed } = useCurrentFlow();
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
  const setActionDuration = (seconds: number) => {
    const next = clampTimerSeconds(seconds);
    setDuration(next);
    setRemaining(next);
    setRunning(false);
  };
  return (
    <section className="phone-screen action-scene p-5 text-center">
      <PageHeader title={action.title} back />
      <section className="flowi-picture-card flowi-picture-card-breathe mx-auto">
        <span className="flowi-picture-art">
          <ExerciseArt title={action.title} />
        </span>
        <span className="flowi-picture-label">{shortExerciseTitle(action.title)}</span>
      </section>
      <p className="mx-auto mt-5 max-w-sm text-sm font-bold leading-6 text-navy/65">{action.childText}</p>
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
      {helpOpen ? (
        <section className="mt-4 rounded-[1.55rem] bg-white/94 p-4 text-left shadow-card">
          <div className="flex items-center gap-3">
            <AvatarMascot emotion="inDeWar" size="small" showCaption={false} />
            <div>
              <h2 className="font-black text-navy">Vraag hulp</h2>
            </div>
          </div>
          <div className="mt-3 grid gap-2">
            {["Kom even bij mij zitten.", "Wil je samen een kleine stap kiezen?", "Wil je het eerst voordoen?"].map((line) => (
              <div key={line} className="rounded-2xl bg-lavender/8 p-3 text-sm font-black text-navy/68">{line}</div>
            ))}
          </div>
        </section>
      ) : null}
      <PrimaryButton className="mt-5 w-full" onClick={() => navigate("/reflection")}>Ik ben klaar</PrimaryButton>
      <div className="mt-4 grid gap-2">
        <SecondaryButton onClick={() => navigate("/need")}>Iets anders kiezen</SecondaryButton>
        <button className="font-extrabold text-lavender" onClick={() => setHelpOpen((value) => !value)}>{helpOpen ? "Hulpkaart sluiten" : "Vraag hulp"}</button>
      </div>
    </section>
  );
}

function HelpNowPage() {
  const navigate = useNavigate();
  const fast = ["Ga naar je rustige plek", "Adem zacht", "Zeg: stop, ik heb hulp nodig", "Pak iets zachts"].map((title) => calmStrategies.find((strategy) => strategy.title === title)).filter(Boolean) as CalmStrategy[];
  return (
    <div className="phone-screen px-4 pb-5 pt-4">
      <PageHeader title="Help mij nu" subtitle="Kies \u00E9\u00E9n rustig stapje." />
      <section className="relative mb-4 overflow-hidden rounded-[1.9rem] bg-gradient-to-b from-sky/18 via-white to-mint/14 p-5 shadow-soft">
        <div className="cloud cloud-a" />
        <div className="relative z-10 grid grid-cols-[1fr_auto] items-end gap-2">
          <div>
            <h2 className="text-2xl font-black text-navy">Flowi blijft bij je</h2>
            <p className="mt-2 text-sm font-bold leading-6 text-navy/58">Je hoeft niet alles tegelijk. Kies wat nu kan.</p>
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
            onClick={() => navigate(`/action/${strategy.id}`)}
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
  const save = async (rating: string) => {
    await db.emotionHistory.add({ id: id(), childProfileId: "default-child", emotionType: selectedEmotion, needType: selectedNeed, actionId: selectedActionId, helpedRating: rating, note, createdAt: now() });
    await db.rewards.add({ id: id(), childProfileId: "default-child", label: "Goed geprobeerd", icon: "\uD83D\uDC9C", reason: "reflectie ingevuld", earnedAt: now() });
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
        <PageHeader title="Wat hielp jou?" subtitle="Kies wat nu het beste past." />
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
  return (
    <>
      <div className="phone-screen px-4 pb-5 pt-4">
      <PageHeader title="Wat hielp jou?" />
      <div className="grid gap-3">
        {["Het voelde mij rustiger", "Het werd een beetje beter", "Nog niet", "Het werd moeilijker"].map((rating, index) => (
          <button key={rating} onClick={() => save(rating)} className="flex items-center gap-3 rounded-[1.4rem] bg-white p-4 text-left font-black shadow-card"><span className="text-3xl">{["\uD83D\uDE42", "\uD83D\uDE0A", "\uD83D\uDE10", "\uD83D\uDE41"][index]}</span>{rating}</button>
        ))}
        <label className="rounded-[1.4rem] bg-white p-4 shadow-card">
          <span className="font-black">Iets anders? Vertel het.</span>
          <textarea value={note} onChange={(event) => setNote(event.target.value)} className="mt-3 min-h-24 w-full rounded-2xl border border-lavender/20 p-3 outline-none focus:ring-4 focus:ring-lavender/20" placeholder="Wil je iets tekenen of opschrijven?" />
        </label>
      </div>
      </div>
    </>
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
            <p className="text-sm font-bold text-navy/55">Eerste mini-stap: {task.steps[0] ?? "Begin klein."}</p>
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
        {selectedHelp && strategy ? (
          <div className="mt-4 rounded-[1.35rem] bg-lavender/8 p-3 text-center">
            <p className="text-sm font-black text-navy">Flowi stelt dit voor</p>
            <ExerciseArt title={strategy.title} compact />
            <button type="button" onClick={() => navigate(`/action/${strategy.id}`)} className="mt-3 min-h-11 w-full rounded-2xl bg-gradient-to-b from-[#8fd8e8] to-[#4eb1c9] px-4 text-sm font-black text-white shadow-[0_12px_22px_rgba(78,177,201,.24)]">
              Doe: {strategy.title}
            </button>
            <ul className="mt-3 grid gap-1.5 text-left">
              {selectedHelp.tips.map((tip) => <li key={tip} className="text-sm font-bold leading-5 text-navy/60">{"\u2022"} {tip}</li>)}
            </ul>
          </div>
        ) : null}
      </section>
    </div>
  );
}

function DayPage() {
  const { data: tasks } = useLiveData(() => db.tasks.where("childProfileId").equals("default-child").toArray(), [] as Task[], []);
  const { data: completions } = useLiveData(() => db.taskCompletions.where("date").equals(today()).toArray(), [], []);
  return (
    <>
      <div className="phone-screen px-4 pb-5 pt-4">
      <PageHeader title="Mijn dag" subtitle="Kies wat gelukt is. Flowi helpt als iets lastig is." back={false} />
      <div className="grid gap-3">
        {(["ochtend", "naSchool", "avond", "bedtijd"] as DayPart[]).map((part) => {
          const partTasks = tasks.filter((task) => task.dayPart === part && task.isEnabled);
          const done = partTasks.filter((task) => completions.some((completion) => completion.taskId === task.id && completion.status === "done")).length;
          return <DayPartCard key={part} title={dayParts[part].title} icon={dayParts[part].icon} progress={partTasks.length ? (done / partTasks.length) * 100 : 0} to={`/day/${part}`} />;
        })}
      </div>
      </div>
    </>
  );
}

function DayPartPage() {
  const { dayPart = "ochtend" } = useParams();
  const part = dayPart as DayPart;
  const { data: tasks, reload } = useLiveData(() => db.tasks.where("dayPart").equals(part).toArray(), [] as Task[], [part]);
  const { data: completions, reload: reloadCompletions } = useLiveData(() => db.taskCompletions.where("date").equals(today()).toArray(), [], [part]);
  const [helpTask, setHelpTask] = useState<Task | null>(null);
  const visibleTasks = sortTasks(tasks.filter((task) => task.isEnabled));
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
      <PageHeader title={dayParts[part]?.title ?? "Mijn dag"} subtitle="Kies wat gelukt is. Lukt iets niet? Flowi helpt." />
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
  const { data: tasks } = useLiveData(() => db.tasks.where("childProfileId").equals("default-child").toArray(), [] as Task[], []);
  const { data: completions } = useLiveData(() => db.taskCompletions.where("date").equals(today()).toArray(), [], []);
  return (
    <>
      <div className="phone-screen px-4 pb-5 pt-4">
      <PageHeader title="Dagindeling" subtitle="Voor ouders: routine instellen." />
      <div className="grid gap-3">
        {(["ochtend", "naSchool", "avond", "bedtijd"] as DayPart[]).map((part) => {
          const partTasks = tasks.filter((task) => task.dayPart === part && task.isEnabled);
          const done = partTasks.filter((task) => completions.some((completion) => completion.taskId === task.id && completion.status === "done")).length;
          return <DayPartCard key={part} title={dayParts[part].title} icon={dayParts[part].icon} progress={partTasks.length ? (done / partTasks.length) * 100 : 0} to={`/day-settings/${part}`} />;
        })}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3"><SecondaryButton onClick={() => navigate("/task-library?returnTo=%2Fday-settings")}>Taak kiezen</SecondaryButton><PrimaryButton onClick={() => navigate("/tasks/new?returnTo=%2Fday-settings")}>Handmatige taak</PrimaryButton></div>
      </div>
    </>
  );
}

function DaySettingsPartPage() {
  const navigate = useNavigate();
  const { dayPart = "ochtend" } = useParams();
  const part = dayPart as DayPart;
  const { data: tasks, reload } = useLiveData(() => db.tasks.where("dayPart").equals(part).toArray(), [] as Task[], [part]);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [displayOrder, setDisplayOrder] = useState<string[]>([]);
  const [dragGhost, setDragGhost] = useState<{ x: number; y: number; width: number; height: number; offsetX: number; offsetY: number } | null>(null);
  const draggedTaskIdRef = useRef<string | null>(null);
  const dragReadyRef = useRef(false);
  const displayOrderRef = useRef<string[]>([]);
  const visibleTasks = sortTasks(tasks.filter((task) => task.isEnabled));
  useEffect(() => {
    if (!draggedTaskIdRef.current) {
      const nextOrder = visibleTasks.map((task) => task.id);
      displayOrderRef.current = nextOrder;
      setDisplayOrder(nextOrder);
    }
  }, [tasks]);
  const deleteTask = async (task: Task) => {
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
      <PageHeader title={`${dayParts[part]?.title ?? "Dag"} instellen`} subtitle="Voor ouders: aanpassen en slepen." backTo="/day-settings" />
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
      <div className="mt-4 grid grid-cols-2 gap-3"><SecondaryButton onClick={() => navigate(`/task-library?dayPart=${part}&returnTo=%2Fday-settings`)}>Taak kiezen</SecondaryButton><PrimaryButton onClick={() => navigate(`/tasks/new?dayPart=${part}&returnTo=%2Fday-settings`)}>Handmatige taak</PrimaryButton></div>
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
  const returnTo = safeReturnPath(searchParams.get("returnTo"));
  const editing = Boolean(taskId);
  const { data: existing } = useLiveData(() => taskId ? db.tasks.get(taskId) : Promise.resolve(undefined), undefined as Task | undefined, [taskId]);
  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState("\u2B50");
  const [visualKey, setVisualKey] = useState<TaskVisualKey | "">("");
  const [showVisualBank, setShowVisualBank] = useState(false);
  const [dayPart, setDayPart] = useState<DayPart>(isDayPart(requestedDayPart) ? requestedDayPart : "ochtend");
  const [optionalTime, setOptionalTime] = useState("");
  const [steps, setSteps] = useState("");
  const [fallbackStrategyId, setFallbackStrategyId] = useState("");
  useEffect(() => { if (existing) { setTitle(existing.title); setIcon(existing.icon); setVisualKey((existing.visualKey as TaskVisualKey | undefined) ?? ""); setDayPart(existing.dayPart); setOptionalTime(existing.optionalTime ?? ""); setSteps(existing.steps.join("\n")); setFallbackStrategyId(existing.fallbackStrategyId ?? ""); } }, [existing]);
  const save = async () => {
    const currentTasks = await db.tasks.where("dayPart").equals(dayPart).toArray();
    const taskSteps = steps.split("\n").map((step) => step.trim()).filter(Boolean);
    const task: Task = { id: existing?.id ?? id(), childProfileId: "default-child", title: title || "Nieuwe taak", icon, visualKey: visualKey || undefined, fallbackStrategyId: fallbackStrategyId || undefined, category: "Eigen", ageGroup: "vrij", dayPart, sortOrder: existing?.sortOrder ?? currentTasks.length, steps: taskSteps.length ? taskSteps : ["Klaar."], repeatPattern: "elkeDag", optionalTime: optionalTime || undefined, rewardEnabled: true, requiresHelp: false, isDefault: false, isEnabled: true, createdAt: existing?.createdAt ?? now(), updatedAt: now() };
    await db.tasks.put(task);
    navigate(returnTo ?? `/day-settings/${dayPart}`);
  };
  const remove = async () => {
    if (!existing) return;
    await db.tasks.delete(existing.id);
    navigate(`/day-settings/${existing.dayPart}`);
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
        <input value={optionalTime} onChange={(event) => setOptionalTime(event.target.value)} placeholder="Tijd optioneel, bv. 07:30" className="min-h-12 rounded-2xl border border-lavender/20 px-4 font-bold outline-none focus:ring-4 focus:ring-lavender/20" />
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
  const returnTo = safeReturnPath(searchParams.get("returnTo"));
  const [category, setCategory] = useState("Alles");
  const [search, setSearch] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<TaskTemplate | null>(null);
  const { data: templates } = useLiveData(() => db.taskTemplates.toArray(), [], []);
  const { data: ownTasks } = useLiveData(() => db.tasks.where("category").equals("Eigen").toArray(), [] as Task[], []);
  const standardTemplates = useMemo(() => {
    const unique = new Map<string, TaskTemplate>();
    templates.forEach((template) => {
      const key = `${template.title.toLowerCase()}-${template.category.toLowerCase()}-${template.defaultDayPart}`;
      if (!unique.has(key)) unique.set(key, { ...template, ageGroup: "alle" });
    });
    return Array.from(unique.values());
  }, [templates]);
  const ownTemplates = useMemo(() => {
    const unique = new Map<string, TaskTemplate>();
    ownTasks.forEach((task) => {
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
  const add = async (template: TaskTemplate, dayPart?: DayPart) => {
    const targetDayPart = dayPart ?? forcedDayPart ?? template.defaultDayPart;
    const currentTasks = await db.tasks.where("dayPart").equals(targetDayPart).toArray();
    await db.tasks.add({ id: id(), childProfileId: "default-child", title: template.title, icon: template.icon, visualKey: template.visualKey, category: template.category, ageGroup: template.ageGroup, dayPart: targetDayPart, sortOrder: currentTasks.length, steps: template.suggestedSteps, repeatPattern: "elkeDag", estimatedMinutes: template.estimatedMinutes, rewardEnabled: true, requiresHelp: false, isDefault: false, isEnabled: true, createdAt: now(), updatedAt: now() });
    setSelectedTemplate(null);
    navigate(returnTo === "/day-settings" ? `/day-settings/${targetDayPart}` : returnTo ?? `/day-settings/${targetDayPart}`);
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
    if (forcedDayPart) {
      void add(template, forcedDayPart);
      return;
    }
    setSelectedTemplate(template);
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
          <section className="w-full max-w-xl rounded-[1.9rem] bg-white p-4 shadow-soft">
            <div className="grid grid-cols-[auto_1fr] items-center gap-3">
              <TaskArt title={selectedTemplate.title} visualKey={selectedTemplate.visualKey as TaskVisualKey | undefined} compact />
              <div>
                <h2 className="text-2xl font-black text-navy">{selectedTemplate.title}</h2>
                <p className="text-sm font-bold text-navy/52">Kies waar deze taak in het dagritme hoort.</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {(["ochtend", "naSchool", "avond", "bedtijd"] as DayPart[]).map((part) => (
                <button key={part} type="button" onClick={() => add(selectedTemplate, part)} className={`rounded-[1.45rem] p-3 text-center shadow-card ring-2 ${part === selectedTemplate.defaultDayPart ? "bg-lavender text-white ring-lavender" : "bg-lavender/8 text-navy ring-transparent"}`}>
                  <TaskArt title={dayParts[part].title} compact />
                  <span className="mt-2 block text-lg font-black">{dayParts[part].title}</span>
                  {part === selectedTemplate.defaultDayPart ? <span className="mt-1 block text-xs font-black text-white/80">Past vaak hier</span> : null}
                </button>
              ))}
            </div>
            <button type="button" onClick={() => setSelectedTemplate(null)} className="mt-4 min-h-12 w-full rounded-2xl bg-lavender/10 px-5 font-black text-lavender">Annuleren</button>
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
  const dailyWaterLimit = dailyGrowthLimit;
  const todaysWaterDrops = todaysRewards.filter((_, index) => index % 2 === 0).length;
  const waterDrops = weekGrowthMoments.filter((_, index) => index % 2 === 0).length;
  const sunshineMoments = weekGrowthMoments.filter((_, index) => index % 2 === 1).length;
  const treeStages = ["Zaadje", "Sprietje", "Plantje", "Boompje", "Rustboom"];
  const stageIndex = Math.min(treeStages.length - 1, weekGrowthMoments.length === 0 ? 0 : Math.ceil(weekGrowthMoments.length / 2));
  const weeklyGoal = 8;
  const progress = Math.min(100, (weekGrowthMoments.length / weeklyGoal) * 100);
  const weekMoments = Array.from({ length: weeklyGoal }, (_, index) => index < weekGrowthMoments.length);
  const flowiPhrases = [
    "Elke week kan Flowi's boom groeien.",
    "Proberen telt. Ook als het nog lastig voelt.",
    "Vandaag hoef je niet alles te kunnen.",
    "Alles wat je probeert telt mee.",
    "Flowi ziet dat je oefent."
  ];
  const phrase = flowiPhrases[weekGrowthMoments.length % flowiPhrases.length];
  const latestGrowthIndex = weekGrowthMoments.length - 1;
  const careMode = latestGrowthIndex < 0 ? "rest" : latestGrowthIndex % 2 === 0 ? "water" : "sun";
  return (
    <div className="phone-screen growth-garden px-4 pb-5 pt-4">
      <PageHeader title="Mijn groei" subtitle="Flowi's rustboom." back={false} />
      <section className={`growth-hero growth-focus-scene growth-focus-${careMode} relative overflow-hidden rounded-[1.9rem] p-5 shadow-soft`}>
        <div className="cloud cloud-a" />
        <div className="leaf-float leaf-b" />
        <div className="relative z-10">
          <div className="text-xs font-black uppercase tracking-[0.16em] text-lavender">Deze week</div>
          <h2 className="mt-1 text-3xl font-black text-navy">{treeStages[stageIndex]}</h2>
          <p className="mt-2 max-w-[15rem] text-sm font-bold leading-6 text-navy/58">{phrase}</p>
        </div>

        <div className="growth-care-stage relative z-10 mt-5" aria-label="Flowi verzorgt de rustboom">
          <div className="growth-care-sun" aria-hidden />
          <div className="growth-sun-string" aria-hidden />
          <div className="growth-sun-handle" aria-hidden />
          <div className="growth-care-drops" aria-hidden><span /><span /><span /></div>
          <div className="growth-care-flowi" aria-hidden>
            <img src="/assets/flowi-home-mascot.png" alt="" className="growth-flowi-character" />
            <span className="growth-watering-can" />
          </div>
          <div className="growth-care-tree">
            <span className={`growth-plant plant-${stageIndex} active`} />
          </div>
        </div>
      </section>
    </div>
  );
  const recentRewards = weekRewards.slice(0, 4);
  return (
    <div className="phone-screen growth-garden px-4 pb-5 pt-4">
      <PageHeader title="Mijn groei" subtitle="Deze week met Flowi." back={false} />
      <section className="growth-hero relative overflow-hidden rounded-[1.9rem] p-5 shadow-soft">
        <div className="cloud cloud-a" />
        <div className="leaf-float leaf-b" />
        <div className="relative z-10 grid grid-cols-[1fr_auto] items-end gap-3">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.16em] text-lavender">Flowi's rustboom</div>
            <h2 className="mt-1 text-3xl font-black text-navy">{treeStages[stageIndex]}</h2>
            <p className="mt-2 max-w-[12rem] text-sm font-bold leading-6 text-navy/58">{phrase}</p>
          </div>
          <AvatarMascot size="medium" emotion="rustig" />
        </div>

        <div className="growth-tree-scene relative z-10 mt-5 flex items-end justify-between rounded-[1.5rem] bg-white/76 p-4 shadow-card">
          {treeStages.map((stage, index) => (
            <div key={stage} className="grid justify-items-center gap-1">
              <span className={`growth-plant plant-${index} ${index <= stageIndex ? "active" : ""}`} />
              <span className={`h-2 w-2 rounded-full ${index <= stageIndex ? "bg-mint" : "bg-lilac/25"}`} />
            </div>
          ))}
        </div>
        <div className="relative z-10 mt-4 h-3 rounded-full bg-white/70"><div className="h-3 rounded-full bg-gradient-to-r from-mint via-honey to-lavender" style={{ width: `${progress}%` }} /></div>
        <p className="relative z-10 mt-2 text-center text-xs font-black text-navy/48">{waterDrops} waterdruppels voor de boom deze week</p>
      </section>

      <section className="mt-4 rounded-[1.6rem] bg-white/92 p-4 shadow-card">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-black text-navy">Deze week</h3>
          <span className="rounded-full bg-lavender/10 px-3 py-1 text-xs font-black text-lavender">reset maandag</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {weekMoments.map((grown, index) => (
            <div key={index} className={`week-seed grid min-h-16 place-items-center rounded-[1.15rem] text-center text-xs font-black ${grown ? "grown" : ""}`}>
              <span>{grown ? "Groei" : "Rust"}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs font-bold leading-5 text-navy/50">Flowi geeft de boom per dag maximaal 2 waterdruppels. Extra stapjes worden zonnestraaltjes.</p>
      </section>

      <section className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-[1.45rem] bg-white/92 p-4 text-center shadow-card">
          <div className="text-3xl">{"\uD83D\uDCA7"}</div>
          <p className="mt-2 text-sm font-black text-navy">{todaysWaterDrops} van {dailyWaterLimit}</p>
          <p className="text-xs font-bold text-navy/48">water vandaag</p>
        </div>
        <div className="rounded-[1.45rem] bg-white/92 p-4 text-center shadow-card">
          <div className="text-3xl">{"\u2600\uFE0F"}</div>
          <p className="mt-2 text-sm font-black text-navy">{sunshineMoments}</p>
          <p className="text-xs font-bold text-navy/48">zonnestraaltjes</p>
        </div>
      </section>

      <section className="mt-4">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h3 className="font-black text-navy">Vandaag</h3>
            <p className="text-xs font-bold text-navy/48">Kleine momenten van proberen.</p>
          </div>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-lavender shadow-card">{todaysRewards.length}</span>
        </div>
        {todaysRewards.length ? (
          <div className="grid gap-2">
            {todaysRewards.slice(0, 3).map((reward) => (
              <div key={reward.id} className="flex items-center gap-3 rounded-[1.35rem] bg-white/92 p-3 shadow-card">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-honey/18 text-xl">{reward.icon}</span>
                <div>
                  <h4 className="text-sm font-black text-navy">{reward.label}</h4>
                  <p className="text-xs font-bold text-navy/48">{reward.reason}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[1.5rem] bg-white/88 p-4 text-center shadow-card">
            <AvatarMascot size="small" emotion="rustig" />
            <p className="mt-3 font-black text-navy">Vandaag mag klein beginnen.</p>
            <p className="text-sm font-bold text-navy/52">Je kunt altijd opnieuw beginnen.</p>
          </div>
        )}
      </section>

      <section className="mt-5">
        <h3 className="mb-3 font-black text-navy">Laatste groeimomenten</h3>
        <div className="grid gap-2">
          {recentRewards.length ? recentRewards.map((reward) => (
            <div key={reward.id} className="flex items-center justify-between rounded-[1.25rem] bg-white/86 px-4 py-3 text-sm font-black text-navy shadow-card">
              <span>{reward.label}</span>
              <span className="text-xl">{reward.icon}</span>
            </div>
          )) : (
            <div className="rounded-[1.25rem] bg-white/86 px-4 py-3 text-sm font-bold text-navy/52 shadow-card">Doe een oefening of rond een taak af. Dan groeit hier iets mee.</div>
          )}
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
      <div className="phone-screen px-4 pb-5 pt-4">
        <PageHeader title={activeExercise.title} subtitle={activeExercise.category} />
        <section className="rounded-[1.8rem] bg-gradient-to-b from-sky/16 via-white to-lavender/12 p-5 text-center shadow-soft">
          <ExerciseArt title={activeExercise.title} />
          <p className="mx-auto mt-4 max-w-xs text-sm font-bold leading-6 text-navy/60">{activeExercise.description}</p>
          {timerEnabled ? (
            <>
              <div className="mx-auto mt-5 grid h-32 w-32 place-items-center rounded-full bg-white text-4xl font-black text-lavender shadow-card ring-8 ring-lavender/10">{formatTime(remaining)}</div>
              <div className="mt-4 h-3 rounded-full bg-lilac/18"><div className="h-3 rounded-full bg-gradient-to-r from-mint via-honey to-lavender" style={{ width: `${progress}%` }} /></div>
            </>
          ) : (
            <button type="button" onClick={() => setTimerEnabled(true)} className="mt-5 min-h-16 w-full rounded-[1.45rem] bg-white px-6 text-xl font-black text-lavender shadow-card">Timer instellen</button>
          )}
        </section>
        <section className="mt-4 grid gap-3 rounded-[1.5rem] bg-white/92 p-4 shadow-card">
          <div className="flex items-center justify-between gap-3">
            <span className="text-lg font-black">Timer</span>
            <button type="button" onClick={() => { setTimerEnabled((value) => !value); setRunning(false); }} className={`min-h-12 rounded-2xl px-5 text-base font-black ${timerEnabled ? "bg-lavender text-white" : "bg-lavender/10 text-lavender"}`}>{timerEnabled ? "Aan" : "Uit"}</button>
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
        <section className="mt-4 rounded-[1.5rem] bg-white/92 p-4 shadow-card">
          <h2 className="font-black">Stapjes</h2>
          <ol className="mt-3 grid gap-2">
            {activeExercise.steps.map((step, index) => <li key={step} className="flex gap-3 rounded-2xl bg-lavender/8 p-3 text-sm font-bold text-navy/68"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white text-xs font-black text-lavender shadow-card">{index + 1}</span>{step}</li>)}
          </ol>
        </section>
        {timerEnabled ? (
          <div className="mt-4 grid grid-cols-3 gap-2">
            <SecondaryButton onClick={() => { setRemaining(duration); setRunning(false); }}><RotateCcw className="mx-auto" size={20} /></SecondaryButton>
            <PrimaryButton className="col-span-2" onClick={() => setRunning((value) => !value)}>{running ? <><Pause className="mr-2 inline" size={18} /> Pauze</> : <><Play className="mr-2 inline" size={18} /> Start</>}</PrimaryButton>
          </div>
        ) : (
          <PrimaryButton className="mt-4 w-full" onClick={() => void completeExercise(activeExercise)}>Klaar</PrimaryButton>
        )}
        <button className="mt-4 w-full text-center text-sm font-black text-lavender" onClick={() => setActiveExercise(null)}>Terug naar oefeningen</button>
      </div>
    );
  }

  return (
    <div className="phone-screen px-4 pb-5 pt-4">
      <PageHeader title="Oefeningen" subtitle="Rustkracht oefenen met Flowi." back={false} />
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
      <PageHeader title="Voor ouders" subtitle="Alles blijft op dit apparaat bewaard." back={false} />
      <div className="grid gap-3">
        <ParentCard icon={<CalendarDays />} title="Dagindeling" text="Taken beheren en routines maken." to="/day-settings" />
        <ParentCard icon={<BookOpen />} title="Takenbibliotheek" text="Taken zoeken en toevoegen." to="/task-library" />
        <ParentCard icon={<Database />} title="Over Flowi & backup" text="Uitleg over de app en gegevens bewaren." to="/about" />
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
    if (!file || !confirm("Hiermee vervang je de huidige gegevens op dit apparaat.")) return;
    await importBackup(JSON.parse(await file.text()));
    setMessage("Backup teruggezet.");
  };
  return (
    <>
      <PageHeader title="Backup" subtitle="Bewaar je lokale gegevens." />
      <div className="grid gap-3 rounded-[1.6rem] bg-white p-4 shadow-soft">
        <PrimaryButton onClick={download}><icons.Download className="mr-2 inline" size={18} />Backup maken</PrimaryButton>
        <label className="flex min-h-14 cursor-pointer items-center justify-center rounded-[1.45rem] bg-gradient-to-b from-[#b69cff] via-[#9473f5] to-[#7857df] px-6 text-lg font-black text-white shadow-[0_14px_24px_rgba(120,87,223,.28)] transition active:scale-[.98] focus-within:ring-4 focus-within:ring-lavender/30"><icons.Upload className="mr-2 inline" size={18} />Backup terugzetten<input type="file" accept="application/json" className="sr-only" onChange={(event) => upload(event.target.files?.[0])} /></label>
        <p className="text-sm font-bold text-navy/55">Alles blijft lokaal op dit apparaat. Maak af en toe een backup als je gegevens wilt bewaren.</p>
        {message ? <p className="font-black text-mint">{message}</p> : null}
      </div>
    </>
  );
}

function PrivacyPage() {
  return <><PageHeader title="Privacy" /><div className="rounded-[1.6rem] bg-white p-5 shadow-soft"><p className="text-base font-normal leading-6 text-navy/68">Flowi slaat gegevens alleen lokaal op dit apparaat op. Er wordt niets naar een server gestuurd. Als je appdata of sitegegevens wist, kunnen gegevens verdwijnen. Maak af en toe een backup als je gegevens wilt bewaren.</p><p className="mt-2 text-base font-normal leading-6 text-navy/58">Flowi is een hulpmiddel voor rust, dagstructuur en communicatie. Het vervangt geen professionele hulp, diagnose of behandeling. Bij ernstige zorgen of direct gevaar: neem contact op met huisarts, behandelaar of noodhulp.</p></div></>;
}

function AboutPage() {
  const [message, setMessage] = useState("");
  const bodyText = "text-base font-normal leading-6 text-navy/58";
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
    if (!file || !confirm("Hiermee vervang je de huidige gegevens op dit apparaat.")) return;
    await importBackup(JSON.parse(await file.text()));
    setMessage("Backup teruggezet.");
  };
  return (
    <>
      <PageHeader title="Over Flowi" subtitle="Voor ouders en verzorgers." />
      <section className="overflow-hidden rounded-[1.8rem] bg-gradient-to-b from-sky/18 via-white to-mint/12 p-5 shadow-soft">
        <div className="grid grid-cols-[1fr_auto] items-end gap-3">
          <div>
            <h2 className="text-3xl font-black text-navy">Waarom Flowi?</h2>
            <p className={`mt-2 ${bodyText}`}>Een rustige hulp voor jonge kinderen die snel vol zitten, vastlopen of extra structuur nodig hebben.</p>
          </div>
          <AvatarMascot emotion="rustig" size="small" showCaption={false} />
        </div>
      </section>

      <section className="mt-4 grid gap-2.5">
        <div className="rounded-[1.55rem] bg-white/94 p-4 shadow-card">
          <h3 className="text-xl font-black text-navy">Voor wie?</h3>
          <p className={`mt-1.5 ${bodyText}`}>Flowi is bedoeld voor kinderen die nog niet altijd kunnen zeggen wat ze voelen of nodig hebben.</p>
        </div>
        <div className="rounded-[1.55rem] bg-white/94 p-4 shadow-card">
          <h3 className="text-xl font-black text-navy">Hoe helpt Flowi?</h3>
          <p className={`mt-1.5 ${bodyText}`}>Met grote plaatjes, eenvoudige keuzes en korte oefeningen. Zo kan een kind aanwijzen, kiezen en weer een klein stapje verder.</p>
        </div>
        <div className="rounded-[1.55rem] bg-white/94 p-4 shadow-card">
          <h3 className="text-xl font-black text-navy">Wat doet de ouder?</h3>
          <p className={`mt-1.5 ${bodyText}`}>De ouder stelt de dagindeling in. Het kind ziet daarna vooral wat er komt en kan taken afvinken of hulp vragen.</p>
        </div>
        <div className="rounded-[1.55rem] bg-white/94 p-4 shadow-card">
          <h3 className="text-xl font-black text-navy">Wie is Flowi?</h3>
          <p className={`mt-1.5 ${bodyText}`}>Flowi is zacht, geduldig en duidelijk. Hij helpt zonder te duwen, viert kleine stapjes en blijft rustig als iets niet meteen lukt.</p>
          <p className={`mt-2 ${bodyText}`}>Hij praat kort en vriendelijk. De meeste keuzes zijn visueel, zodat kinderen ook zonder veel lezen mee kunnen doen.</p>
        </div>
      </section>

      <section className="mt-4 rounded-[1.8rem] bg-white/94 p-5 shadow-soft">
        <h2 className="text-2xl font-black text-navy">Groeiboom</h2>
        <div className={`mt-2 grid gap-2 ${bodyText}`}>
          <p>De groeiboom is een zachte aanmoediging. Het is geen scorebord.</p>
          <p>Na oefenen of reflecteren kan Flowi de boom water geven. Extra momenten kunnen het zonnetje laten schijnen.</p>
          <p>Taken afvinken staat los van de boom. Zo blijft groei gericht op oefenen met rust en gevoel.</p>
        </div>
      </section>

      <section className="mt-4 rounded-[1.8rem] bg-white/94 p-5 shadow-soft">
        <h2 className="text-2xl font-black text-navy">Gegevens en backup</h2>
        <p className={`mt-2 ${bodyText}`}>Flowi gebruikt geen account. Gegevens blijven op dit apparaat. Met een backup kun je ze later zelf terugzetten.</p>
        <div className="mt-4 grid gap-3">
          <PrimaryButton onClick={download}><icons.Download className="mr-2 inline" size={20} />Backup maken</PrimaryButton>
          <label className="flex min-h-14 cursor-pointer items-center justify-center rounded-[1.45rem] bg-gradient-to-b from-[#b69cff] via-[#9473f5] to-[#7857df] px-6 text-lg font-black text-white shadow-[0_14px_24px_rgba(120,87,223,.28)] transition active:scale-[.98] focus-within:ring-4 focus-within:ring-lavender/30"><icons.Upload className="mr-2 inline" size={20} />Backup terugzetten<input type="file" accept="application/json" className="sr-only" onChange={(event) => upload(event.target.files?.[0])} /></label>
          {message ? <p className="font-black text-mint">{message}</p> : null}
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
        <Route path="/day-settings" element={<DaySettingsPage />} />
        <Route path="/day-settings/:dayPart" element={<DaySettingsPartPage />} />
        <Route path="/tasks" element={<Navigate to="/day" />} />
        <Route path="/tasks/new" element={<TaskFormPage />} />
        <Route path="/tasks/:taskId/edit" element={<TaskFormPage />} />
        <Route path="/task-library" element={<TaskLibraryPage />} />
        <Route path="/rewards" element={<RewardsPage />} />
        <Route path="/practice" element={<PracticePage />} />
        <Route path="/avatar" element={<AvatarPage />} />
        <Route path="/parents" element={<ParentsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/backup" element={<Navigate to="/about" />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </AppShell>
  );
}

function Bootstrap() {
  const [ready, setReady] = useState(false);
  useEffect(() => { seedDatabase().finally(() => setReady(true)); }, []);
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


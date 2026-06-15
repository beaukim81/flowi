import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { BookOpen, CalendarDays, Database, HeartHandshake, Minus, Palette, Pause, Play, Plus, RotateCcw, ShieldCheck, SlidersHorizontal, Sparkles, Trash2 } from "lucide-react";
import { avatarAssets } from "../data/avatars";
import { calmStrategies } from "../data/calmStrategies";
import { emotions } from "../data/emotions";
import { needs } from "../data/needs";
import { exportBackup, importBackup } from "../db/backup";
import { db } from "../db/db";
import { seedDatabase } from "../db/seed";
import { useLiveData } from "../hooks/useLiveData";
import { useCurrentFlow } from "../state/appStore";
import "../styles/index.css";
import type { Avatar, CalmStrategy, DayPart, EmotionType, NeedType, PracticeExercise, Task, TaskTemplate } from "../types/schema";
import { AppShell, AvatarMascot, DayPartCard, EmotionCard, ExerciseArt, icons, PageHeader, ParentCard, PrimaryButton, SecondaryButton, TaskArt, TaskCard } from "../components/ui";
import type { TaskVisualKey } from "../utils/taskVisuals";

const dayParts: Record<DayPart, { title: string; icon: string }> = {
  ochtend: { title: "Ochtend", icon: "☀️" },
  naSchool: { title: "Na school", icon: "🎒" },
  avond: { title: "Avond", icon: "🌙" },
  bedtijd: { title: "Bedtijd", icon: "🛌" },
  vrij: { title: "Vrij", icon: "⭐" }
};

const isDayPart = (value: string | null): value is DayPart => Boolean(value && value in dayParts);
const safeReturnPath = (value: string | null) => value?.startsWith("/") ? value : null;

const today = () => new Date().toISOString().slice(0, 10);
const id = () => crypto.randomUUID();
const now = () => new Date().toISOString();
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
  { key: "drinkWater", label: "Water drinken", hint: "slokjes nemen" },
  { key: "snack", label: "Snack eten", hint: "rustig aan tafel" },
  { key: "outsidePlay", label: "Buiten spelen", hint: "tuin, lucht" },
  { key: "moveBreak", label: "Bewegen", hint: "springen, wiebelen" },
  { key: "homework", label: "Huiswerk", hint: "boek, potlood" },
  { key: "reading", label: "Lezen", hint: "boekje lezen" },
  { key: "creative", label: "Knutselen", hint: "tekenen, maken" },
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
  return calmStrategies.find((strategy) => (!emotion || strategy.linkedEmotionTypes.includes(emotion)) && (!need || strategy.linkedNeedTypes.includes(need))) ?? calmStrategies[0];
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

function HomePage() {
  const navigate = useNavigate();
  const { data: profile } = useProfile();
  return (
    <section className="phone-screen home-scene relative overflow-hidden px-5 pb-5 pt-6">
      <div className="cloud cloud-a" />
      <div className="cloud cloud-b" />
      <div className="leaf-float leaf-a" />
      <div className="leaf-float leaf-b" />
      <div className="relative z-10">
        <div className="flowi-logo mb-1">Flowi<span>♥</span></div>
        <div className="home-copy">
          <p className="text-[1.35rem] font-black text-lavender">Hoe is het in je lijf?</p>
          <p className="mt-3 text-sm font-bold leading-6 text-navy/62">Flowi helpt je voelen, kiezen en kleine stappen zetten die je goed doen.</p>
        </div>
        <div className="home-mascot-wrap relative" aria-label={`Flowi helpt ${profile?.name ?? "jou"}`}>
          <img src="/assets/flowi-home-mascot.png" alt="" className="home-mascot-free" />
          <div className="speech-bubble">Ik help jou.<br /><span>♥</span></div>
        </div>
        <div className="mt-1 grid gap-3">
          <PrimaryButton onClick={() => navigate("/check-in")} className="flowi-pill">♥ Hoe voel ik me?</PrimaryButton>
          <button onClick={() => navigate("/day")} className="flowi-pill min-h-12 rounded-[1.35rem] bg-gradient-to-b from-[#9bd886] to-[#59b477] px-5 font-extrabold text-white shadow-[0_14px_24px_rgba(89,180,119,.24)]">🍃 Mijn dag</button>
          <button onClick={() => navigate("/help-now")} className="flowi-pill min-h-12 rounded-[1.35rem] bg-gradient-to-b from-[#ffb58b] to-[#ff7f74] px-5 font-extrabold text-white shadow-[0_14px_24px_rgba(255,127,116,.24)]">Help mij nu</button>
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
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {emotions.map((emotion) => (
          <EmotionCard key={emotion.id} emotion={emotion} avatar={avatar} onClick={() => { setEmotion(emotion.id); navigate("/need"); }} />
        ))}
      </div>
      </div>
    </>
  );
}

function NeedPage() {
  const navigate = useNavigate();
  const { selectedEmotion, setNeed, setAction } = useCurrentFlow();
  const { data: profile } = useProfile();
  const filteredNeeds = selectedEmotion === "weetIkNiet" ? needs.filter((need) => ["praatMetOuder", "creatief", "ademen", "rustigePlek"].includes(need.id)) : needs;
  const caregiver = profile?.caregiverName || profile?.caregiverLabel || "ouder";
  const shownEmotion = selectedEmotion ?? "weetIkNiet";
  return (
    <div className="phone-screen px-4 pb-5 pt-4">
      <PageHeader title="Wat helpt nu?" subtitle="Kies een rustig stapje." />
      <section className="mb-4 overflow-hidden rounded-[1.8rem] bg-gradient-to-b from-sky/16 via-white to-lavender/10 p-4 text-center shadow-soft">
        <AvatarMascot emotion={shownEmotion} size="medium" />
        <p className="mx-auto mt-3 max-w-xs text-sm font-bold leading-6 text-navy/58">Flowi kiest daarna een oefening die bij jouw keuze past.</p>
      </section>
      <div className="grid grid-cols-2 gap-3">
        {filteredNeeds.map((need) => (
          <button key={need.id} onClick={() => {
            const strategy = chooseStrategy(selectedEmotion, need.id);
            setNeed(need.id);
            setAction(strategy.id);
            navigate(`/action/${strategy.id}`);
          }} className="min-h-40 rounded-[1.55rem] border border-white/90 bg-white/92 p-3 text-center shadow-card transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-lavender/30">
            <AvatarMascot emotion={emotionForNeed(need.id)} size="small" />
            <span className="mt-2 block text-sm font-black text-navy">{need.id === "praatMetOuder" ? `Praat met ${caregiver}` : need.label}</span>
          </button>
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
  const suggestedDuration = action.durationSeconds ?? 120;
  const [timerOpen, setTimerOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(suggestedDuration);
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    setTimerOpen(false);
    setRunning(false);
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
  return (
    <section className="phone-screen action-scene p-5 text-center">
      <PageHeader title={action.title} back />
      <ExerciseArt title={action.title} />
      <p className="mx-auto mt-5 max-w-sm text-sm font-bold leading-6 text-navy/65">{action.childText}</p>
      {timerOpen ? (
        <section className="mt-5 rounded-[1.55rem] bg-white/92 p-4 shadow-card">
          <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-lavender/10 text-3xl font-black text-lavender ring-8 ring-lavender/8">{formatTime(remaining)}</div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <SecondaryButton onClick={() => { setRemaining(suggestedDuration); setRunning(false); }}><RotateCcw className="mx-auto" size={20} /></SecondaryButton>
            <PrimaryButton className="col-span-2" onClick={() => setRunning((value) => !value)}>{running ? <><Pause className="mr-2 inline" size={18} /> Pauze</> : <><Play className="mr-2 inline" size={18} /> Start</>}</PrimaryButton>
          </div>
        </section>
      ) : (
        <button type="button" onClick={() => setTimerOpen(true)} className="mt-5 min-h-12 w-full rounded-[1.35rem] bg-white px-5 font-extrabold text-lavender shadow-card">Timer gebruiken</button>
      )}
      {action.durationSeconds ? <div className="mx-auto mt-3 inline-flex rounded-full bg-lavender/10 px-4 py-2 text-xs font-black text-lavender">⏱ {Math.round(action.durationSeconds / 60)} minuten</div> : null}
      {helpOpen ? (
        <section className="mt-4 rounded-[1.55rem] bg-white/94 p-4 text-left shadow-card">
          <div className="flex items-center gap-3">
            <AvatarMascot emotion="inDeWar" size="small" showCaption={false} />
            <div>
              <h2 className="font-black text-navy">Vraag hulp</h2>
              <p className="text-sm font-bold leading-5 text-navy/55">Laat dit scherm zien aan je ouder.</p>
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
      <PageHeader title="Help mij nu" subtitle="Kies één rustig stapje." />
      <section className="relative mb-4 overflow-hidden rounded-[1.9rem] bg-gradient-to-b from-sky/18 via-white to-mint/14 p-5 shadow-soft">
        <div className="cloud cloud-a" />
        <div className="relative z-10 grid grid-cols-[1fr_auto] items-end gap-2">
          <div>
            <h2 className="text-2xl font-black text-navy">Flowi blijft bij je</h2>
            <p className="mt-2 text-sm font-bold leading-6 text-navy/58">Je hoeft niet alles tegelijk. Kies wat nu kan.</p>
          </div>
          <AvatarMascot emotion="rustig" size="medium" />
        </div>
      </section>
      <div className="grid grid-cols-2 gap-3">
        {fast.map((strategy) => (
          <button key={strategy.id} onClick={() => navigate(`/action/${strategy.id}`)} className="min-h-48 rounded-[1.55rem] border border-white/90 bg-white/94 p-3 text-center shadow-card transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-lavender/30">
            <ExerciseArt title={strategy.title} compact />
            <h2 className="mt-2 text-sm font-black text-navy">{strategy.title}</h2>
            <p className="mt-1 line-clamp-2 text-xs font-bold leading-5 text-navy/52">{strategy.childText}</p>
          </button>
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
    await db.rewards.add({ id: id(), childProfileId: "default-child", label: "Goed geprobeerd", icon: "💜", reason: "reflectie ingevuld", earnedAt: now() });
    navigate("/rewards");
  };
  const reflectionChoices: { label: string; sublabel: string; emotion: EmotionType }[] = [
    { label: "Rustiger", sublabel: "Mijn lijf voelt zachter", emotion: "rustig" },
    { label: "Beetje beter", sublabel: "Het hielp een beetje", emotion: "superDruk" },
    { label: "Nog niet", sublabel: "Ik heb nog hulp nodig", emotion: "inDeWar" },
    { label: "Moeilijker", sublabel: "Dit paste nu niet", emotion: "verdrietig" }
  ];
  return (
    <>
      <div className="phone-screen px-4 pb-5 pt-4">
        <PageHeader title="Wat hielp jou?" subtitle="Kies wat nu het beste past." />
        <section className="mb-4 rounded-[1.8rem] bg-gradient-to-b from-sky/16 via-white to-mint/12 p-4 text-center shadow-soft">
          <AvatarMascot emotion="rustig" size="medium" showCaption={false} />
          <p className="mx-auto mt-3 max-w-xs text-sm font-bold leading-6 text-navy/58">Flowi wil weten of dit stapje jou hielp.</p>
        </section>
        <div className="grid grid-cols-2 gap-3">
          {reflectionChoices.map((choice) => (
            <button
              key={choice.label}
              onClick={() => save(choice.label)}
              className="min-h-44 rounded-[1.55rem] border border-white/90 bg-white/94 p-3 text-center shadow-card transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-lavender/30"
            >
              <AvatarMascot emotion={choice.emotion} size="small" showCaption={false} />
              <span className="mt-2 block text-lg font-black text-navy">{choice.label}</span>
              <span className="mt-1 block text-xs font-bold leading-5 text-navy/48">{choice.sublabel}</span>
            </button>
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
          <button key={rating} onClick={() => save(rating)} className="flex items-center gap-3 rounded-[1.4rem] bg-white p-4 text-left font-black shadow-card"><span className="text-3xl">{["🙂", "😊", "😐", "🙁"][index]}</span>{rating}</button>
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

function HelpStartOverlay({ task, onClose }: { task: Task; onClose: () => void }) {
  const navigate = useNavigate();
  const [reason, setReason] = useState<HelpReason | null>(null);
  const selectedHelp = reason ? helpReasons.find((item) => item.id === reason) : null;
  const strategy = reason ? fallbackStrategyForTask(task, reason) : null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-navy/24 px-3 pb-4 pt-10 backdrop-blur-sm sm:place-items-center">
      <section className="w-full max-w-md rounded-[1.9rem] bg-white p-4 shadow-[0_24px_70px_rgba(31,33,91,.24)]">
        <div className="flex items-start gap-3">
          <TaskArt title={task.title} visualKey={task.visualKey as TaskVisualKey | undefined} compact />
          <div className="min-w-0 flex-1">
            <h2 className="font-black text-navy">Wat lukt er niet?</h2>
            <p className="text-sm font-bold text-navy/55">Eerste mini-stap: {task.steps[0] ?? "Begin klein."}</p>
          </div>
          <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-2xl bg-lavender/10 font-black text-lavender" aria-label="Sluiten">×</button>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {helpReasons.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setReason(item.id)}
              className={`min-h-36 rounded-[1.35rem] p-2 text-center transition ${reason === item.id ? "bg-lavender text-white shadow-card" : "bg-gradient-to-b from-sky/12 via-white to-lavender/8 text-navy shadow-card"}`}
            >
              <AvatarMascot emotion={item.id} size="small" showCaption={false} />
              <span className="mt-1 block text-sm font-black">{item.label}</span>
            </button>
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
              {selectedHelp.tips.map((tip) => <li key={tip} className="text-sm font-bold leading-5 text-navy/60">• {tip}</li>)}
            </ul>
          </div>
        ) : (
          <p className="mt-3 text-center text-xs font-bold text-navy/45">Kies wat lastig voelt. Dan helpt Flowi verder.</p>
        )}
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
      <PageHeader title="Mijn dag" subtitle="Vink af wat klaar is." back={false} />
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
  const complete = async (task: Task) => {
    await db.taskCompletions.put({ id: `${task.id}-${today()}`, childProfileId: "default-child", taskId: task.id, date: today(), status: "done", completedAt: now() });
    await db.rewards.add({ id: id(), childProfileId: "default-child", label: "Ik maakte het af", icon: "✅", reason: task.title, earnedAt: now() });
    await reloadCompletions();
    await reload();
  };
  return (
    <>
      <div className="phone-screen px-4 pb-5 pt-4">
      <PageHeader title={dayParts[part]?.title ?? "Mijn dag"} subtitle="Alleen afvinken wat klaar is." />
      <div className="grid gap-3">
        {visibleTasks.length ? visibleTasks.map((task) => (
          <TaskCard key={task.id} task={task} done={completions.some((completion) => completion.taskId === task.id && completion.status === "done")} onDone={() => complete(task)} onHelp={() => setHelpTask(task)} showDetails={false} />
        )) : (
          <div className="rounded-[1.5rem] bg-white/90 p-5 text-center shadow-card">
            <TaskArt title={dayParts[part]?.title ?? "Rust"} />
            <p className="mt-3 font-black text-navy">Er staat hier nog niets klaar.</p>
            <p className="text-sm font-bold text-navy/52">Een ouder kan taken toevoegen bij Meer.</p>
          </div>
        )}
      </div>
      {helpTask ? <HelpStartOverlay task={helpTask} onClose={() => setHelpTask(null)} /> : null}
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
      <div className="mt-4 grid grid-cols-2 gap-3"><SecondaryButton onClick={() => navigate("/task-library?returnTo=%2Fday-settings")}>Uit bibliotheek</SecondaryButton><PrimaryButton onClick={() => navigate("/tasks/new?returnTo=%2Fday-settings")}>Taak toevoegen</PrimaryButton></div>
      </div>
    </>
  );
}

function DaySettingsPartPage() {
  const navigate = useNavigate();
  const { dayPart = "ochtend" } = useParams();
  const part = dayPart as DayPart;
  const { data: tasks, reload } = useLiveData(() => db.tasks.where("dayPart").equals(part).toArray(), [] as Task[], [part]);
  const { data: completions, reload: reloadCompletions } = useLiveData(() => db.taskCompletions.where("date").equals(today()).toArray(), [], [part]);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverTaskId, setDragOverTaskId] = useState<string | null>(null);
  const draggedTaskIdRef = useRef<string | null>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const reorderingRef = useRef(false);
  const visibleTasks = sortTasks(tasks.filter((task) => task.isEnabled));
  const complete = async (task: Task) => {
    await db.taskCompletions.put({ id: `${task.id}-${today()}`, childProfileId: "default-child", taskId: task.id, date: today(), status: "done", completedAt: now() });
    await db.rewards.add({ id: id(), childProfileId: "default-child", label: "Ik maakte het af", icon: "✅", reason: task.title, earnedAt: now() });
    await reloadCompletions();
    await reload();
  };
  const moveTask = async (sourceTaskId: string, targetTaskId: string) => {
    if (sourceTaskId === targetTaskId || reorderingRef.current) return;
    reorderingRef.current = true;
    const current = sortTasks(tasks.filter((task) => task.isEnabled));
    const fromIndex = current.findIndex((task) => task.id === sourceTaskId);
    const toIndex = current.findIndex((task) => task.id === targetTaskId);
    if (fromIndex < 0 || toIndex < 0) {
      reorderingRef.current = false;
      return;
    }
    const reordered = [...current];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    try {
      await db.transaction("rw", db.tasks, async () => {
        await Promise.all(reordered.map((task, sortOrder) => db.tasks.update(task.id, { sortOrder, updatedAt: now() })));
      });
      await reload();
    } finally {
      reorderingRef.current = false;
    }
  };
  const startReorder = (event: React.PointerEvent<HTMLDivElement>, taskId: string) => {
    const target = event.target as HTMLElement;
    if (target.closest("button, a, input, textarea, select")) return;
    draggedTaskIdRef.current = taskId;
    dragStartRef.current = { x: event.clientX, y: event.clientY };
    setDraggedTaskId(taskId);
    setDragOverTaskId(taskId);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };
  const updateReorder = async (event: React.PointerEvent<HTMLDivElement>) => {
    const sourceTaskId = draggedTaskIdRef.current;
    const start = dragStartRef.current;
    if (!sourceTaskId || !start) return;
    const movedEnough = Math.abs(event.clientY - start.y) > 12 || Math.abs(event.clientX - start.x) > 12;
    if (!movedEnough) return;
    event.preventDefault();
    const target = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>("[data-reorder-task-id]");
    const targetTaskId = target?.dataset.reorderTaskId;
    if (!targetTaskId || targetTaskId === sourceTaskId || targetTaskId === dragOverTaskId) return;
    setDragOverTaskId(targetTaskId);
    await moveTask(sourceTaskId, targetTaskId);
  };
  const finishReorder = () => {
    draggedTaskIdRef.current = null;
    dragStartRef.current = null;
    setDraggedTaskId(null);
    setDragOverTaskId(null);
  };
  return (
    <>
      <div className="phone-screen px-4 pb-5 pt-4">
      <PageHeader title={`${dayParts[part]?.title ?? "Dag"} instellen`} subtitle="Voor ouders: aanpassen en slepen." />
      <div className="grid gap-3">
        {visibleTasks.map((task) => (
          <div
            key={task.id}
            data-reorder-task-id={task.id}
            onPointerDown={(event) => startReorder(event, task.id)}
            onPointerMove={updateReorder}
            onPointerUp={finishReorder}
            onPointerCancel={finishReorder}
            className={`reorder-task-card ${draggedTaskId === task.id ? "is-dragging" : ""} ${dragOverTaskId === task.id && draggedTaskId !== task.id ? "is-drag-over" : ""}`}
          >
            <TaskCard task={task} done={completions.some((completion) => completion.taskId === task.id && completion.status === "done")} onDone={() => complete(task)} onEdit={() => navigate(`/tasks/${task.id}/edit`)} editable />
          </div>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3"><SecondaryButton onClick={() => navigate(`/task-library?dayPart=${part}&returnTo=%2Fday-settings`)}>Uit bibliotheek</SecondaryButton><PrimaryButton onClick={() => navigate(`/tasks/new?dayPart=${part}&returnTo=%2Fday-settings`)}>Taak toevoegen</PrimaryButton></div>
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
  const [icon, setIcon] = useState("⭐");
  const [visualKey, setVisualKey] = useState<TaskVisualKey | "">("");
  const [showVisualBank, setShowVisualBank] = useState(false);
  const [dayPart, setDayPart] = useState<DayPart>(isDayPart(requestedDayPart) ? requestedDayPart : "ochtend");
  const [optionalTime, setOptionalTime] = useState("");
  const [steps, setSteps] = useState("Begin klein.\nKlaar.");
  const [fallbackStrategyId, setFallbackStrategyId] = useState("");
  const [isEnabled, setIsEnabled] = useState(true);
  useEffect(() => { if (existing) { setTitle(existing.title); setIcon(existing.icon); setVisualKey((existing.visualKey as TaskVisualKey | undefined) ?? ""); setDayPart(existing.dayPart); setOptionalTime(existing.optionalTime ?? ""); setSteps(existing.steps.join("\n")); setFallbackStrategyId(existing.fallbackStrategyId ?? ""); setIsEnabled(existing.isEnabled); } }, [existing]);
  const save = async () => {
    const currentTasks = await db.tasks.where("dayPart").equals(dayPart).toArray();
    const task: Task = { id: existing?.id ?? id(), childProfileId: "default-child", title: title || "Nieuwe taak", icon, visualKey: visualKey || undefined, fallbackStrategyId: fallbackStrategyId || undefined, category: "Eigen", ageGroup: "vrij", dayPart, sortOrder: existing?.sortOrder ?? currentTasks.length, steps: steps.split("\n").filter(Boolean), repeatPattern: "elkeDag", optionalTime: optionalTime || undefined, rewardEnabled: true, requiresHelp: false, isDefault: false, isEnabled, createdAt: existing?.createdAt ?? now(), updatedAt: now() };
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
                  onClick={() => setVisualKey(option.key)}
                  className={`rounded-[1.2rem] bg-white p-2 text-left shadow-card ring-2 ${visualKey === option.key ? "ring-lavender" : "ring-transparent"}`}
                >
                  <TaskArt title={option.label} visualKey={option.key} />
                  <div className="mt-2 text-sm font-black text-navy">{option.label}</div>
                  <div className="text-[0.68rem] font-bold leading-4 text-navy/45">{option.hint}</div>
                </button>
              ))}
            </div>
          </section>
        ) : null}
        <select value={dayPart} onChange={(event) => setDayPart(event.target.value as DayPart)} className="min-h-12 rounded-2xl border border-lavender/20 px-4 font-bold"><option value="ochtend">Ochtend</option><option value="naSchool">Na school</option><option value="avond">Avond</option><option value="bedtijd">Bedtijd</option><option value="vrij">Vrij</option></select>
        <input value={optionalTime} onChange={(event) => setOptionalTime(event.target.value)} placeholder="Tijd optioneel, bv. 07:30" className="min-h-12 rounded-2xl border border-lavender/20 px-4 font-bold outline-none focus:ring-4 focus:ring-lavender/20" />
        <textarea value={steps} onChange={(event) => setSteps(event.target.value)} className="min-h-32 rounded-2xl border border-lavender/20 p-4 font-bold outline-none focus:ring-4 focus:ring-lavender/20" />
        <label className="grid gap-2 rounded-[1.35rem] bg-lavender/8 p-3">
          <span className="text-sm font-black text-navy">Als dit niet lukt</span>
          <select value={fallbackStrategyId} onChange={(event) => setFallbackStrategyId(event.target.value)} className="min-h-12 rounded-2xl border border-lavender/20 bg-white px-4 font-bold">
            <option value="">Flowi kiest automatisch</option>
            {calmStrategies.map((strategy) => <option key={strategy.id} value={strategy.id}>{strategy.title}</option>)}
          </select>
          <span className="text-xs font-bold leading-5 text-navy/48">Bijvoorbeeld bij tablet kijken: kies vooraf een rust-oefening of laat Flowi kiezen op basis van boos, moe, te veel of in de war.</span>
        </label>
        <label className="flex items-center justify-between rounded-2xl bg-lavender/8 p-3 font-bold">Actief <input type="checkbox" checked={isEnabled} onChange={(event) => setIsEnabled(event.target.checked)} /></label>
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
  const [age, setAge] = useState("4-5");
  const [category, setCategory] = useState("Alles");
  const { data: templates } = useLiveData(() => db.taskTemplates.where("ageGroup").equals(age).toArray(), [], [age]);
  const categories = ["Alles", ...Array.from(new Set(templates.map((template) => template.category))).sort()];
  const visibleTemplates = templates
    .filter((template) => category === "Alles" || template.category === category)
    .sort((a, b) => a.category.localeCompare(b.category) || a.title.localeCompare(b.title));
  const add = async (template: TaskTemplate) => {
    const targetDayPart = forcedDayPart ?? template.defaultDayPart;
    const currentTasks = await db.tasks.where("dayPart").equals(targetDayPart).toArray();
    await db.tasks.add({ id: id(), childProfileId: "default-child", title: template.title, icon: template.icon, visualKey: template.visualKey, category: template.category, ageGroup: template.ageGroup, dayPart: targetDayPart, sortOrder: currentTasks.length, steps: template.suggestedSteps, repeatPattern: "elkeDag", estimatedMinutes: template.estimatedMinutes, rewardEnabled: true, requiresHelp: false, isDefault: false, isEnabled: true, createdAt: now(), updatedAt: now() });
    if (returnTo) navigate(returnTo);
  };
  return (
    <>
      <div className="phone-screen px-4 pb-5 pt-4">
      <PageHeader title="Takenbibliotheek" subtitle="Voeg rustig iets toe." />
      <div className="mb-4 grid grid-cols-4 gap-2">{["4-5", "6-7", "8-9", "10-12"].map((tab) => <button key={tab} onClick={() => setAge(tab)} className={`min-h-11 rounded-2xl font-black ${tab === age ? "bg-lavender text-white" : "bg-white text-navy"}`}>{tab}</button>)}</div>
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {categories.map((item) => (
          <button key={item} onClick={() => setCategory(item)} className={`min-h-10 shrink-0 rounded-2xl px-4 text-sm font-black ${item === category ? "bg-mint text-white" : "bg-white text-navy/62 shadow-card"}`}>{item}</button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">{visibleTemplates.map((template) => <button key={template.id} onClick={() => add(template)} className="rounded-[1.4rem] bg-white p-3 text-left shadow-card"><TaskArt title={template.title} visualKey={template.visualKey as TaskVisualKey | undefined} /><h3 className="mt-2 font-black">{template.title}</h3><p className="text-xs font-bold text-navy/50">{template.category}</p></button>)}</div>
      </div>
    </>
  );
}

function RewardsPage() {
  const { data: rewards } = useLiveData(() => db.rewards.orderBy("earnedAt").reverse().toArray(), [], []);
  const todaysRewards = rewards.filter((reward) => reward.earnedAt.slice(0, 10) === today());
  const weekStart = startOfWeek();
  const weekRewards = rewards.filter((reward) => reward.earnedAt.slice(0, 10) >= weekStart);
  const treeStages = ["Zaadje", "Sprietje", "Plantje", "Boompje", "Rustboom"];
  const stageIndex = Math.min(treeStages.length - 1, Math.floor(weekRewards.length / 2));
  const weeklyGoal = 8;
  const progress = Math.min(100, (weekRewards.length / weeklyGoal) * 100);
  const weekMoments = Array.from({ length: weeklyGoal }, (_, index) => index < weekRewards.length);
  const flowiPhrases = [
    "Kleine stapjes laten je rustboom groeien.",
    "Proberen telt. Ook als het nog lastig voelt.",
    "Vandaag hoef je niet alles te kunnen.",
    "Elke rustige keuze is een beetje groei.",
    "Flowi ziet dat je oefent."
  ];
  const phrase = flowiPhrases[weekRewards.length % flowiPhrases.length];
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
        <p className="relative z-10 mt-2 text-center text-xs font-black text-navy/48">{weekRewards.length} van {weeklyGoal} groeimomenten deze week</p>
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
        <p className="mt-3 text-xs font-bold leading-5 text-navy/50">De boom begint elke week opnieuw klein. Wat eerder is gelukt, blijft wel bewaard in de app.</p>
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
  const { data: exercises } = useLiveData(() => db.practiceExercises.toArray(), [], []);
  const [category, setCategory] = useState("Alles");
  const [activeExercise, setActiveExercise] = useState<PracticeExercise | null>(null);
  const [duration, setDuration] = useState(90);
  const [rounds, setRounds] = useState(3);
  const [remaining, setRemaining] = useState(90);
  const [running, setRunning] = useState(false);
  const categories = ["Alles", ...Array.from(new Set(exercises.map((exercise) => exercise.category))).sort()];
  const visibleExercises = exercises
    .filter((exercise) => category === "Alles" || exercise.category === category)
    .sort((a, b) => a.category.localeCompare(b.category) || a.title.localeCompare(b.title));

  useEffect(() => {
    if (!activeExercise) return;
    const nextDuration = activeExercise.durationSeconds ?? 90;
    setDuration(nextDuration);
    setRemaining(nextDuration);
    setRounds(activeExercise.defaultRounds ?? 3);
    setRunning(false);
  }, [activeExercise]);

  useEffect(() => {
    if (!running) return;
    if (remaining <= 0) {
      setRunning(false);
      if (activeExercise) {
        db.rewards.add({ id: id(), childProfileId: "default-child", label: activeExercise.rewardLabel ?? "Ik oefende", icon: "⭐", reason: activeExercise.title, earnedAt: now() });
      }
      return;
    }
    const timer = window.setTimeout(() => setRemaining((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [running, remaining, activeExercise]);

  const setExerciseDuration = (value: number) => {
    const min = activeExercise?.minSeconds ?? 20;
    const max = activeExercise?.maxSeconds ?? 600;
    const next = Math.min(max, Math.max(min, value));
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
          <div className="mx-auto mt-5 grid h-28 w-28 place-items-center rounded-full bg-white text-3xl font-black text-lavender shadow-card ring-8 ring-lavender/10">{formatTime(remaining)}</div>
          <div className="mt-4 h-3 rounded-full bg-lilac/18"><div className="h-3 rounded-full bg-gradient-to-r from-mint via-honey to-lavender" style={{ width: `${progress}%` }} /></div>
        </section>
        <section className="mt-4 grid gap-3 rounded-[1.5rem] bg-white/92 p-4 shadow-card">
          <div className="flex items-center justify-between">
            <span className="font-black">Tijd</span>
            <div className="flex items-center gap-2">
              <button aria-label="Korter" className="grid h-10 w-10 place-items-center rounded-2xl bg-lavender/10 text-lavender" onClick={() => setExerciseDuration(duration - 30)}><Minus size={18} /></button>
              <span className="min-w-16 text-center font-black">{Math.round(duration / 60)} min</span>
              <button aria-label="Langer" className="grid h-10 w-10 place-items-center rounded-2xl bg-lavender/10 text-lavender" onClick={() => setExerciseDuration(duration + 30)}><Plus size={18} /></button>
            </div>
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
        <div className="mt-4 grid grid-cols-3 gap-2">
          <SecondaryButton onClick={() => { setRemaining(duration); setRunning(false); }}><RotateCcw className="mx-auto" size={20} /></SecondaryButton>
          <PrimaryButton className="col-span-2" onClick={() => setRunning((value) => !value)}>{running ? <><Pause className="mr-2 inline" size={18} /> Pauze</> : <><Play className="mr-2 inline" size={18} /> Start</>}</PrimaryButton>
        </div>
        <button className="mt-4 w-full text-center text-sm font-black text-lavender" onClick={() => setActiveExercise(null)}>Terug naar oefeningen</button>
      </div>
    );
  }

  return (
    <div className="phone-screen px-4 pb-5 pt-4">
      <PageHeader title="Oefeningen" subtitle="Rustkracht oefenen met Flowi." back={false} />
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {categories.map((item) => (
          <button key={item} onClick={() => setCategory(item)} className={`min-h-10 shrink-0 rounded-2xl px-4 text-sm font-black ${item === category ? "bg-lavender text-white" : "bg-white text-navy/62 shadow-card"}`}>{item}</button>
        ))}
      </div>
      <div className="grid gap-3">
        {visibleExercises.map((exercise) => (
          <button key={exercise.id} onClick={() => setActiveExercise(exercise)} className="flex items-center gap-3 rounded-[1.5rem] bg-white/94 p-3 text-left shadow-card">
            <ExerciseArt title={exercise.title} compact />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-black text-lavender">{exercise.category}</div>
              <h2 className="font-black">{exercise.title}</h2>
              <p className="line-clamp-2 text-xs font-bold leading-5 text-navy/52">{exercise.description}</p>
              <div className="mt-2 flex gap-2 text-[0.68rem] font-black text-navy/48"><span>{Math.round((exercise.durationSeconds ?? 90) / 60)} min</span><span>{exercise.defaultRounds ?? 3}x</span></div>
            </div>
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
        <ParentCard icon={<Database />} title="Geen account nodig" text="Flowi gebruikt geen externe database." />
        <ParentCard icon={<ShieldCheck />} title="Backup mogelijk" text="Exporteer en importeer JSON." to="/backup" />
        <ParentCard icon={<SlidersHorizontal />} title="Profiel & instellingen" text="Naam, leeftijd, helper en voorkeuren." to="/settings" />
        <ParentCard icon={<CalendarDays />} title="Dagindeling" text="Taken beheren en routines maken." to="/day-settings" />
        <ParentCard icon={<Palette />} title="Mijn Flowi" text="Het vaste giraffe-maatje van de app." to="/avatar" />
        <ParentCard icon={<BookOpen />} title="Takenbibliotheek" text="Taken per leeftijd toevoegen." to="/task-library" />
        <ParentCard icon={<HeartHandshake />} title="Privacy" text="Lokale opslag en veiligheid." to="/privacy" />
      </div>
    </>
  );
}

function SettingsPage() {
  const { data: profile } = useProfile();
  const { data: settings } = useLiveData(() => db.settings.get("app"), undefined, []);
  const [name, setName] = useState("");
  const [age, setAge] = useState(7);
  const [caregiverLabel, setCaregiverLabel] = useState("ouder");
  useEffect(() => { if (profile) { setName(profile.name); setAge(profile.age); setCaregiverLabel(profile.caregiverLabel); } }, [profile]);
  const save = async () => { if (profile) await db.childProfiles.update(profile.id, { name, age, caregiverLabel, updatedAt: now() }); };
  return (
    <>
      <PageHeader title="Instellingen" subtitle="Geen account. Geen tracking." />
      <div className="grid gap-3 rounded-[1.6rem] bg-white p-4 shadow-soft">
        <input value={name} onChange={(event) => setName(event.target.value)} className="min-h-12 rounded-2xl border border-lavender/20 px-4 font-bold" />
        <input type="number" min={4} max={12} value={age} onChange={(event) => setAge(Number(event.target.value))} className="min-h-12 rounded-2xl border border-lavender/20 px-4 font-bold" />
        <select value={caregiverLabel} onChange={(event) => setCaregiverLabel(event.target.value)} className="min-h-12 rounded-2xl border border-lavender/20 px-4 font-bold"><option>mama</option><option>papa</option><option>ouder</option><option>verzorger</option></select>
        <label className="flex items-center justify-between rounded-2xl bg-lavender/8 p-3 font-bold">Beloningen aan <input type="checkbox" checked={settings?.rewardsEnabled ?? true} onChange={(event) => db.settings.update("app", { rewardsEnabled: event.target.checked })} /></label>
        <label className="flex items-center justify-between rounded-2xl bg-lavender/8 p-3 font-bold">Reduced motion <input type="checkbox" checked={settings?.reducedMotion ?? false} onChange={(event) => db.settings.update("app", { reducedMotion: event.target.checked })} /></label>
        <PrimaryButton onClick={save}>Opslaan</PrimaryButton>
      </div>
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
        <label className="grid min-h-12 cursor-pointer place-items-center rounded-2xl border border-lavender/20 bg-white px-5 font-extrabold text-navy shadow-card"><icons.Upload className="mr-2 inline" size={18} />Backup terugzetten<input type="file" accept="application/json" className="sr-only" onChange={(event) => upload(event.target.files?.[0])} /></label>
        <p className="text-sm font-bold text-navy/55">Alles blijft lokaal op dit apparaat. Maak af en toe een backup als je gegevens wilt bewaren.</p>
        {message ? <p className="font-black text-mint">{message}</p> : null}
      </div>
    </>
  );
}

function PrivacyPage() {
  return <><PageHeader title="Privacy" /><div className="rounded-[1.6rem] bg-white p-5 shadow-soft"><p className="font-bold leading-7 text-navy/70">Flowi slaat gegevens alleen lokaal op dit apparaat op. Er wordt niets naar een server gestuurd. Als je appdata of sitegegevens wist, kunnen gegevens verdwijnen. Maak af en toe een backup als je gegevens wilt bewaren.</p><p className="mt-4 text-sm font-bold text-navy/55">Flowi is een hulpmiddel voor rust, dagstructuur en communicatie. Het vervangt geen professionele hulp, diagnose of behandeling. Bij ernstige zorgen of direct gevaar: neem contact op met huisarts, behandelaar of noodhulp.</p></div></>;
}

function AboutPage() {
  return <><PageHeader title="Over Flowi" /><div className="rounded-[1.6rem] bg-white p-5 shadow-soft"><h2 className="text-3xl font-black">Flowi</h2><p className="mt-2 font-bold text-navy/60">Hoe is het in je lijf?</p><p className="mt-4 font-bold leading-7 text-navy/70">Flowi helpt je voelen, begrijpen wat je nodig hebt en kleine stappen zetten die je goed doen.</p><p className="mt-4 text-xl font-black text-lavender">Flowi is er voor jou. Jij mag er zijn.</p></div></>;
}

function AppRoutes() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/check-in" element={<CheckInPage />} />
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
        <Route path="/backup" element={<BackupPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </AppShell>
  );
}

function Bootstrap() {
  const [ready, setReady] = useState(false);
  useEffect(() => { seedDatabase().finally(() => setReady(true)); }, []);
  const loader = useMemo(() => <div className="grid min-h-dvh place-items-center bg-cream text-2xl font-black text-lavender">Flowi</div>, []);
  if (!ready) return loader;
  return <BrowserRouter><AppRoutes /></BrowserRouter>;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Bootstrap />
  </React.StrictMode>
);

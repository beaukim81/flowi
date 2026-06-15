import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes, useNavigate, useParams } from "react-router-dom";
import { BookOpen, CalendarDays, Database, HeartHandshake, Moon, Palette, ShieldCheck, SlidersHorizontal, Sparkles, Trash2 } from "lucide-react";
import { avatarAssets } from "../data/avatars";
import { calmStrategies } from "../data/calmStrategies";
import { emotions } from "../data/emotions";
import { needs } from "../data/needs";
import { rewardStickers } from "../data/rewards";
import { exportBackup, importBackup } from "../db/backup";
import { db } from "../db/db";
import { seedDatabase } from "../db/seed";
import { useLiveData } from "../hooks/useLiveData";
import { useCurrentFlow } from "../state/appStore";
import "../styles/index.css";
import type { Avatar, CalmStrategy, DayPart, EmotionType, NeedType, Task, TaskTemplate } from "../types/schema";
import { AppShell, AvatarMascot, DayPartCard, EmotionCard, icons, NeedCard, PageHeader, ParentCard, PrimaryButton, RewardSticker, SecondaryButton, TaskArt, TaskCard } from "../components/ui";

const dayParts: Record<DayPart, { title: string; icon: string }> = {
  ochtend: { title: "Ochtend", icon: "☀️" },
  naSchool: { title: "Na school", icon: "🎒" },
  avond: { title: "Avond", icon: "🌙" },
  bedtijd: { title: "Bedtijd", icon: "🛌" },
  vrij: { title: "Vrij", icon: "⭐" }
};

const today = () => new Date().toISOString().slice(0, 10);
const id = () => crypto.randomUUID();
const now = () => new Date().toISOString();
const taskIcons = ["👕", "🥣", "🪥", "🎒", "👟", "🧥", "🧼", "🍎", "🥤", "🍃", "🚿", "🌙", "🛏️", "📚", "✏️", "🧸", "🎧", "⛺", "⭐", "🌱", "🍽️", "🧺", "🧹", "🐾"];
const sortTasks = (tasks: Task[]) => [...tasks].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.createdAt.localeCompare(b.createdAt));

function useProfile() {
  return useLiveData(async () => (await db.childProfiles.get("default-child")) ?? null, null, []);
}

function useAvatar(profileAvatarId?: string): Avatar {
  return avatarAssets.find((avatar) => avatar.id === profileAvatarId) ?? avatarAssets[0];
}

function chooseStrategy(emotion?: EmotionType, need?: NeedType) {
  return calmStrategies.find((strategy) => (!emotion || strategy.linkedEmotionTypes.includes(emotion)) && (!need || strategy.linkedNeedTypes.includes(need))) ?? calmStrategies[0];
}

function HomePage() {
  const navigate = useNavigate();
  const { data: profile } = useProfile();
  const avatar = useAvatar(profile?.selectedAvatarId);
  return (
    <section className="phone-screen home-scene relative overflow-hidden px-5 pb-5 pt-6">
      <div className="cloud cloud-a" />
      <div className="cloud cloud-b" />
      <div className="leaf-float leaf-a" />
      <div className="leaf-float leaf-b" />
      <div className="relative z-10">
        <div className="flowi-logo mb-1">Flowi<span>♥</span></div>
        <p className="text-[1.35rem] font-black text-lavender">Hoe is het in je lijf?</p>
        <p className="mt-3 max-w-[15rem] text-sm font-bold leading-6 text-navy/62">Flowi helpt je voelen, kiezen en kleine stappen zetten die je goed doen.</p>
        <div className="relative mt-1">
          <AvatarMascot avatar={avatar} size="large" />
          <div className="speech-bubble">Ik ben jouw maatje.<br /><span>♥</span></div>
        </div>
        <div className="mt-5 grid gap-3">
          <PrimaryButton onClick={() => navigate("/check-in")} className="flowi-pill">♥ Hoe voel ik me?</PrimaryButton>
          <button onClick={() => navigate("/day")} className="flowi-pill min-h-12 rounded-[1.35rem] bg-gradient-to-b from-[#9bd886] to-[#59b477] px-5 font-extrabold text-white shadow-[0_14px_24px_rgba(89,180,119,.24)]">🍃 Mijn dag</button>
          <SecondaryButton onClick={() => navigate("/help-now")} className="flowi-pill">Help mij nu</SecondaryButton>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          {["Voelen", "Kiezen", "Groeien"].map((word, index) => <div key={word} className="mini-value-card p-3 text-xs font-black">{["♡", "🍃", "⭐"][index]}<br />{word}<span>{["Herken je gevoel", "Wat heb je nodig?", "Elke dag een stapje"][index]}</span></div>)}
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
  return (
    <>
      <div className="phone-screen px-4 pb-5 pt-4">
      <PageHeader title="Wat heb ik nu nodig?" subtitle="Kies wat je nu kan helpen." />
      <div className="grid grid-cols-2 gap-3">
        {filteredNeeds.map((need) => (
          <NeedCard key={need.id} need={need} label={need.id === "praatMetOuder" ? `Praat met ${caregiver}` : undefined} onClick={() => {
            const strategy = chooseStrategy(selectedEmotion, need.id);
            setNeed(need.id);
            setAction(strategy.id);
            navigate(`/action/${strategy.id}`);
          }} />
        ))}
      </div>
      </div>
    </>
  );
}

function ActionPage() {
  const navigate = useNavigate();
  const { actionId } = useParams();
  const { selectedEmotion, selectedNeed } = useCurrentFlow();
  const { data: profile } = useProfile();
  const avatar = useAvatar(profile?.selectedAvatarId);
  const action = calmStrategies.find((strategy) => strategy.id === actionId) ?? chooseStrategy(selectedEmotion, selectedNeed);
  return (
    <section className="phone-screen action-scene p-5 text-center">
      <PageHeader title={action.title} back />
      <AvatarMascot avatar={avatar} emotion={selectedEmotion} size="large" />
      <p className="mx-auto mt-5 max-w-sm text-sm font-bold leading-6 text-navy/65">{action.childText}</p>
      <PrimaryButton className="mt-5 w-full" onClick={() => navigate("/reflection")}>Start nu</PrimaryButton>
      {action.durationSeconds ? <div className="mx-auto mt-3 inline-flex rounded-full bg-lavender/10 px-4 py-2 text-xs font-black text-lavender">⏱ {Math.round(action.durationSeconds / 60)} minuten</div> : null}
      <div className="mt-5 grid gap-2">
        <SecondaryButton onClick={() => navigate("/need")}>Iets anders kiezen</SecondaryButton>
        <button className="font-extrabold text-lavender" onClick={() => navigate("/parents")}>Vraag hulp</button>
      </div>
    </section>
  );
}

function HelpNowPage() {
  const navigate = useNavigate();
  const fast = ["Ga naar je rustige plek", "Adem zacht", "Zeg: stop, ik heb hulp nodig", "Pak iets zachts"].map((title) => calmStrategies.find((strategy) => strategy.title === title)).filter(Boolean) as CalmStrategy[];
  return (
    <>
      <PageHeader title="Help mij nu" subtitle="Eén rustig stapje." />
      <div className="grid gap-3">
        {fast.map((strategy) => <button key={strategy.id} onClick={() => navigate(`/action/${strategy.id}`)} className="rounded-[1.4rem] bg-white p-4 text-left shadow-card"><span className="text-3xl">{strategy.icon}</span><h2 className="mt-2 font-black">{strategy.title}</h2><p className="text-sm font-semibold text-navy/55">{strategy.childText}</p></button>)}
      </div>
    </>
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

function DayPage() {
  const navigate = useNavigate();
  const { data: tasks } = useLiveData(() => db.tasks.where("childProfileId").equals("default-child").toArray(), [] as Task[], []);
  const { data: completions } = useLiveData(() => db.taskCompletions.where("date").equals(today()).toArray(), [], []);
  return (
    <>
      <div className="phone-screen px-4 pb-5 pt-4">
      <PageHeader title="Mijn dag" subtitle="Kleine stappen. Tijd is optioneel." />
      <div className="grid gap-3">
        {(["ochtend", "naSchool", "avond", "bedtijd"] as DayPart[]).map((part) => {
          const partTasks = tasks.filter((task) => task.dayPart === part && task.isEnabled);
          const done = partTasks.filter((task) => completions.some((completion) => completion.taskId === task.id && completion.status === "done")).length;
          return <DayPartCard key={part} title={dayParts[part].title} icon={dayParts[part].icon} progress={partTasks.length ? (done / partTasks.length) * 100 : 0} to={`/day/${part}`} />;
        })}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3"><SecondaryButton onClick={() => navigate("/tasks/new")}>Tijd toevoegen</SecondaryButton><PrimaryButton onClick={() => navigate("/tasks/new")}>Taak toevoegen</PrimaryButton></div>
      </div>
    </>
  );
}

function DayPartPage() {
  const navigate = useNavigate();
  const { dayPart = "ochtend" } = useParams();
  const part = dayPart as DayPart;
  const { data: tasks, reload } = useLiveData(() => db.tasks.where("dayPart").equals(part).toArray(), [] as Task[], [part]);
  const { data: completions, reload: reloadCompletions } = useLiveData(() => db.taskCompletions.where("date").equals(today()).toArray(), [], [part]);
  const [helpTask, setHelpTask] = useState<Task | null>(null);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const visibleTasks = sortTasks(tasks.filter((task) => task.isEnabled));
  const complete = async (task: Task) => {
    await db.taskCompletions.put({ id: `${task.id}-${today()}`, childProfileId: "default-child", taskId: task.id, date: today(), status: "done", completedAt: now() });
    await db.rewards.add({ id: id(), childProfileId: "default-child", label: "Ik maakte het af", icon: "✅", reason: task.title, earnedAt: now() });
    await reloadCompletions();
    await reload();
  };
  const moveTask = async (targetTaskId: string) => {
    if (!draggedTaskId || draggedTaskId === targetTaskId) return;
    const current = sortTasks(tasks.filter((task) => task.isEnabled));
    const fromIndex = current.findIndex((task) => task.id === draggedTaskId);
    const toIndex = current.findIndex((task) => task.id === targetTaskId);
    if (fromIndex < 0 || toIndex < 0) return;
    const reordered = [...current];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    await db.transaction("rw", db.tasks, async () => {
      await Promise.all(reordered.map((task, sortOrder) => db.tasks.update(task.id, { sortOrder, updatedAt: now() })));
    });
    setDraggedTaskId(null);
    await reload();
  };
  return (
    <>
      <div className="phone-screen px-4 pb-5 pt-4">
      <PageHeader title={`${dayParts[part]?.title ?? "Dag"}routine`} subtitle="Tijd optioneel" />
      <div className="grid gap-3">
        {visibleTasks.map((task) => (
          <div
            key={task.id}
            draggable
            onDragStart={() => setDraggedTaskId(task.id)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => moveTask(task.id)}
            className={draggedTaskId === task.id ? "opacity-60" : ""}
          >
            <TaskCard task={task} done={completions.some((completion) => completion.taskId === task.id && completion.status === "done")} onDone={() => complete(task)} onHelp={() => setHelpTask(task)} onEdit={() => navigate(`/tasks/${task.id}/edit`)} />
          </div>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3"><SecondaryButton onClick={() => navigate("/task-library")}>Uit bibliotheek</SecondaryButton><PrimaryButton onClick={() => navigate("/tasks/new")}>Taak toevoegen</PrimaryButton></div>
      <p className="mt-3 text-center text-xs font-bold text-navy/45">Sleep taken omhoog of omlaag om de volgorde te veranderen.</p>
      {helpTask ? <div className="mt-4 rounded-[1.5rem] bg-white p-4 shadow-soft"><h2 className="font-black">Help mij starten</h2><p className="text-sm font-bold text-navy/55">Eerste mini-stap: {helpTask.steps[0] ?? "Begin klein."}</p><div className="mt-3 grid grid-cols-2 gap-2">{["Te veel", "Boos", "Moe", "In de war"].map((label) => <span key={label} className="rounded-2xl bg-lavender/10 px-3 py-2 text-center text-xs font-black text-lavender">{label}</span>)}</div></div> : null}
      </div>
    </>
  );
}

function TaskFormPage() {
  const navigate = useNavigate();
  const { taskId } = useParams();
  const editing = Boolean(taskId);
  const { data: existing } = useLiveData(() => taskId ? db.tasks.get(taskId) : Promise.resolve(undefined), undefined as Task | undefined, [taskId]);
  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState("⭐");
  const [dayPart, setDayPart] = useState<DayPart>("ochtend");
  const [optionalTime, setOptionalTime] = useState("");
  const [steps, setSteps] = useState("Begin klein.\nKlaar.");
  const [isEnabled, setIsEnabled] = useState(true);
  useEffect(() => { if (existing) { setTitle(existing.title); setIcon(existing.icon); setDayPart(existing.dayPart); setOptionalTime(existing.optionalTime ?? ""); setSteps(existing.steps.join("\n")); setIsEnabled(existing.isEnabled); } }, [existing]);
  const save = async () => {
    const currentTasks = await db.tasks.where("dayPart").equals(dayPart).toArray();
    const task: Task = { id: existing?.id ?? id(), childProfileId: "default-child", title: title || "Nieuwe taak", icon, category: "Eigen", ageGroup: "vrij", dayPart, sortOrder: existing?.sortOrder ?? currentTasks.length, steps: steps.split("\n").filter(Boolean), repeatPattern: "elkeDag", optionalTime: optionalTime || undefined, rewardEnabled: true, requiresHelp: false, isDefault: false, isEnabled, createdAt: existing?.createdAt ?? now(), updatedAt: now() };
    await db.tasks.put(task);
    navigate(`/day/${dayPart}`);
  };
  const remove = async () => {
    if (!existing || !confirm("Wil je deze taak verwijderen?")) return;
    await db.tasks.delete(existing.id);
    navigate(`/day/${existing.dayPart}`);
  };
  return (
    <>
      <div className="phone-screen px-4 pb-5 pt-4">
      <PageHeader title={editing ? "Taak aanpassen" : "Nieuwe taak"} subtitle="Tijd is optioneel." />
      <div className="grid gap-3 rounded-[1.6rem] bg-white/90 p-4 shadow-soft">
        <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Titel" className="min-h-12 rounded-2xl border border-lavender/20 px-4 font-bold outline-none focus:ring-4 focus:ring-lavender/20" />
        <section className="rounded-[1.45rem] bg-gradient-to-br from-sky/12 via-white to-lavender/12 p-4 text-center shadow-card">
          <TaskArt title={title || "Nieuwe taak"} />
          <p className="mt-3 text-sm font-black text-navy">Flowi-plaatje</p>
          <p className="text-xs font-bold text-navy/48">Het plaatje past zich aan op de taaknaam.</p>
        </section>
        <section className="rounded-[1.4rem] bg-lavender/8 p-3">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-black">Kies een icoontje</span>
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-2xl shadow-card">{icon}</span>
          </div>
          <div className="grid grid-cols-6 gap-2">
            {taskIcons.map((taskIcon) => (
              <button
                key={taskIcon}
                type="button"
                onClick={() => setIcon(taskIcon)}
                className={`flowi-icon-token grid h-11 w-full place-items-center rounded-2xl text-2xl ring-2 ${icon === taskIcon ? "ring-lavender" : "ring-transparent"}`}
                aria-label={`Kies icoon ${taskIcon}`}
              >
                {taskIcon}
              </button>
            ))}
          </div>
        </section>
        <select value={dayPart} onChange={(event) => setDayPart(event.target.value as DayPart)} className="min-h-12 rounded-2xl border border-lavender/20 px-4 font-bold"><option value="ochtend">Ochtend</option><option value="naSchool">Na school</option><option value="avond">Avond</option><option value="bedtijd">Bedtijd</option><option value="vrij">Vrij</option></select>
        <input value={optionalTime} onChange={(event) => setOptionalTime(event.target.value)} placeholder="Tijd optioneel, bv. 07:30" className="min-h-12 rounded-2xl border border-lavender/20 px-4 font-bold outline-none focus:ring-4 focus:ring-lavender/20" />
        <textarea value={steps} onChange={(event) => setSteps(event.target.value)} className="min-h-32 rounded-2xl border border-lavender/20 p-4 font-bold outline-none focus:ring-4 focus:ring-lavender/20" />
        <label className="flex items-center justify-between rounded-2xl bg-lavender/8 p-3 font-bold">Actief <input type="checkbox" checked={isEnabled} onChange={(event) => setIsEnabled(event.target.checked)} /></label>
        <PrimaryButton onClick={save}>Opslaan</PrimaryButton>
        {editing ? <button onClick={remove} className="min-h-12 rounded-2xl bg-coral/10 px-5 font-extrabold text-coral">Verwijderen</button> : null}
      </div>
      </div>
    </>
  );
}

function TaskLibraryPage() {
  const [age, setAge] = useState("4-5");
  const { data: templates } = useLiveData(() => db.taskTemplates.where("ageGroup").equals(age).toArray(), [], [age]);
  const add = async (template: TaskTemplate) => {
    const currentTasks = await db.tasks.where("dayPart").equals(template.defaultDayPart).toArray();
    await db.tasks.add({ id: id(), childProfileId: "default-child", title: template.title, icon: template.icon, category: template.category, ageGroup: template.ageGroup, dayPart: template.defaultDayPart, sortOrder: currentTasks.length, steps: template.suggestedSteps, repeatPattern: "elkeDag", estimatedMinutes: template.estimatedMinutes, rewardEnabled: true, requiresHelp: false, isDefault: false, isEnabled: true, createdAt: now(), updatedAt: now() });
  };
  return (
    <>
      <div className="phone-screen px-4 pb-5 pt-4">
      <PageHeader title="Takenbibliotheek" subtitle="Voeg rustig iets toe." />
      <div className="mb-4 grid grid-cols-4 gap-2">{["4-5", "6-7", "8-9", "10-12"].map((tab) => <button key={tab} onClick={() => setAge(tab)} className={`min-h-11 rounded-2xl font-black ${tab === age ? "bg-lavender text-white" : "bg-white text-navy"}`}>{tab}</button>)}</div>
      <div className="grid grid-cols-2 gap-3">{templates.map((template) => <button key={template.id} onClick={() => add(template)} className="rounded-[1.4rem] bg-white p-3 text-left shadow-card"><TaskArt title={template.title} /><h3 className="mt-2 font-black">{template.title}</h3><p className="text-xs font-bold text-navy/50">{template.category}</p></button>)}</div>
      </div>
    </>
  );
}

function RewardsPage() {
  const { data: rewards } = useLiveData(() => db.rewards.orderBy("earnedAt").reverse().toArray(), [], []);
  return (
    <>
      <PageHeader title="Mijn groei" subtitle="Proberen telt." back={false} />
      <section className="mb-4 rounded-[2rem] bg-white p-5 shadow-soft">
        <p className="font-black">Kleine gewoontes elke dag.</p>
        <div className="mt-4 flex items-end justify-between text-5xl"><span>🌰</span><span>🌱</span><span>🌿</span><span>🌳</span></div>
        <div className="mt-4 h-3 rounded-full bg-lilac/20"><div className="h-3 rounded-full bg-gradient-to-r from-mint via-honey to-lavender" style={{ width: `${Math.min(100, 18 + rewards.length * 9)}%` }} /></div>
      </section>
      <div className="grid grid-cols-3 gap-3">{(rewards.length ? rewards : rewardStickers.slice(0, 6)).map((reward, index) => <RewardSticker key={`${reward.label}-${index}`} icon={reward.icon} label={reward.label} />)}</div>
    </>
  );
}

function PracticePage() {
  const { data: exercises } = useLiveData(() => db.practiceExercises.toArray(), [], []);
  return (
    <>
      <PageHeader title="Ontdek" subtitle="Rustkracht oefenen." back={false} />
      <div className="grid gap-3">{exercises.map((exercise) => <article key={exercise.id} className="rounded-[1.4rem] bg-white p-4 shadow-card"><h2 className="font-black">{exercise.title}</h2><p className="text-sm font-semibold text-navy/55">{exercise.description}</p><PrimaryButton className="mt-3 w-full" onClick={async () => db.rewards.add({ id: id(), childProfileId: "default-child", label: exercise.rewardLabel ?? "Ik oefende", icon: "⭐", reason: exercise.title, earnedAt: now() })}>Oefen</PrimaryButton></article>)}</div>
    </>
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
        <ParentCard icon={<CalendarDays />} title="Dagindeling" text="Taken beheren en routines maken." to="/day" />
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

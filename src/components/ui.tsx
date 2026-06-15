import { ArrowLeft, Check, ChevronRight, Download, GripVertical, Heart, HelpCircle, Home, Leaf, MoreHorizontal, Pencil, Plus, Settings, Sparkles, Trash2, Upload, UserRound } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import type { Avatar, Emotion, EmotionType, Need, NeedType, Task } from "../types/schema";
import { getTaskVisualKey, type TaskVisualKey } from "../utils/taskVisuals";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flowi-bg portrait-locked min-h-dvh text-navy">
      <div className="portrait-guard" aria-hidden>
        <section className="portrait-guard-card">
          <AvatarMascot emotion="rustig" size="medium" showCaption={false} />
          <h1 className="mt-4 text-3xl font-black text-navy">Draai Flowi rechtop</h1>
          <p className="mt-2 text-lg font-bold leading-7 text-navy/62">Flowi werkt rustig en duidelijk als je tablet of telefoon rechtop staat.</p>
        </section>
      </div>
      <main className="app-content mx-auto min-h-dvh w-full px-0 pb-32 pt-0 sm:max-w-5xl sm:px-6 sm:pt-6 lg:max-w-6xl">{children}</main>
      <BottomNav />
    </div>
  );
}

function BottomNav() {
  const items = [
    { to: "/", label: "Home", icon: Home },
    { to: "/rewards", label: "Groei", icon: Heart },
    { to: "/practice", label: "Oefeningen", icon: Sparkles },
    { to: "/parents", label: "Meer", icon: MoreHorizontal }
  ];
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/80 bg-white/90 px-3 py-2.5 shadow-[0_-14px_40px_rgba(62,59,130,.12)] backdrop-blur-2xl">
      <div className="mx-auto grid max-w-lg grid-cols-4 gap-1.5 sm:max-w-4xl">
        {items.map((item) => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) => `flex min-h-16 flex-col items-center justify-center rounded-[1.45rem] text-sm font-black transition ${isActive ? "bg-gradient-to-b from-lilac/28 to-lavender/12 text-lavender shadow-[inset_0_1px_0_rgba(255,255,255,.8)]" : "text-navy/55"}`}>
            <item.icon aria-hidden size={24} strokeWidth={2.5} />
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export function PageHeader({ title, subtitle, back = true }: { title: string; subtitle?: string; back?: boolean }) {
  const navigate = useNavigate();
  return (
    <header className="mb-5 flex items-center gap-3">
      {back && (
        <button aria-label="Terug" className="grid h-14 w-14 place-items-center rounded-[1.25rem] border border-white bg-white/90 shadow-card focus:outline-none focus:ring-4 focus:ring-lavender/30" onClick={() => navigate(-1)}>
          <ArrowLeft size={25} />
        </button>
      )}
      <div>
        <h1 className="text-2xl font-black tracking-normal text-navy">{title}</h1>
        {subtitle ? <p className="text-base font-bold text-navy/55">{subtitle}</p> : null}
      </div>
    </header>
  );
}

export function PrimaryButton(props: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return <button {...props} className={`min-h-14 rounded-[1.45rem] bg-gradient-to-b from-[#b69cff] via-[#9473f5] to-[#7857df] px-6 text-lg font-black text-white shadow-[0_14px_24px_rgba(120,87,223,.28)] transition active:scale-[.98] focus:outline-none focus:ring-4 focus:ring-lavender/30 ${props.className ?? ""}`} />;
}

export function SecondaryButton(props: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return <button {...props} className={`min-h-14 rounded-[1.45rem] border border-lavender/14 bg-white/92 px-6 text-lg font-black text-navy shadow-card focus:outline-none focus:ring-4 focus:ring-lavender/20 ${props.className ?? ""}`} />;
}

export function AvatarMascot({ avatar, emotion, size = "large", showCaption = true }: { avatar?: Avatar; emotion?: EmotionType; size?: "small" | "medium" | "large"; showCaption?: boolean }) {
  const isGiraffe = !avatar || avatar.id === "giraffe";
  const dimensions = size === "large" ? "avatar-size-large" : size === "medium" ? "avatar-size-medium" : "avatar-size-small";
  if (!isGiraffe) {
    const textSize = size === "large" ? "text-8xl" : size === "medium" ? "text-6xl" : "text-4xl";
    return (
      <div className={`avatar-stage relative mx-auto grid ${dimensions} place-items-center`}>
        <span className={textSize} aria-hidden>{avatar.icon}</span>
      </div>
    );
  }
  const positions: Record<EmotionType | "happy", string> = {
    happy: "0% 0%",
    rustig: "0% 0%",
    verdrietig: "33.333% 0%",
    boos: "66.666% 0%",
    teVeel: "100% 0%",
    superDruk: "0% 100%",
    inDeWar: "33.333% 100%",
    moe: "66.666% 100%",
    weetIkNiet: "100% 100%"
  };
  return (
    <div
      className={`flowi-mascot-image relative mx-auto ${dimensions} ${size === "small" ? "small" : ""}`}
      style={{ backgroundPosition: positions[emotion ?? "happy"] }}
      aria-label="Flowi giraffe"
    >
      {showCaption ? <div className="giraffe-caption">{emotion ? emotionLabel(emotion) : "Flowi"}</div> : null}
    </div>
  );
}

function emotionLabel(emotion: EmotionType) {
  const labels: Record<EmotionType, string> = {
    rustig: "Rustig",
    verdrietig: "Verdrietig",
    boos: "Boos",
    teVeel: "Te veel",
    superDruk: "Super druk",
    inDeWar: "In de war",
    moe: "Moe",
    weetIkNiet: "Weet ik niet"
  };
  return labels[emotion];
}

export function EmotionCard({ emotion, avatar, onClick }: { emotion: Emotion; avatar?: Avatar; onClick: () => void }) {
  const positions: Record<EmotionType, string> = {
    rustig: "0% 0%",
    verdrietig: "33.333% 0%",
    boos: "66.666% 0%",
    teVeel: "100% 0%",
    superDruk: "0% 100%",
    inDeWar: "33.333% 100%",
    moe: "66.666% 100%",
    weetIkNiet: "100% 100%"
  };
  return (
    <button onClick={onClick} className={`emotion-card emotion-${emotion.id} min-h-52 rounded-[1.8rem] p-3 text-left transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-lavender/30`}>
      <div className="emotion-card-art" style={{ backgroundPosition: positions[emotion.id] }} aria-hidden />
      <div className="emotion-label relative z-10 rounded-[1.15rem] bg-white/90 px-3 py-2.5 text-center text-base font-black text-navy shadow-[inset_0_1px_0_rgba(255,255,255,.75)]">{emotion.label}</div>
    </button>
  );
}

function needVisualKey(need: NeedType) {
  return need === "knuffel" ? "hug" : need === "rustigePlek" ? "quiet" : need === "bewegen" ? "move" : need === "evenAlleen" ? "alone" : need === "praatMetOuder" ? "talk" : need === "ademen" ? "breathe" : need === "koptelefoon" ? "headphones" : "creative";
}

export function NeedArt({ need }: { need: NeedType }) {
  return <span className={`need-art need-art-${needVisualKey(need)}`} aria-hidden />;
}

export function NeedCard({ need, label, onClick }: { need: Need; label?: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`need-card need-card-${needVisualKey(need.id)} min-h-52 rounded-[1.8rem] p-3 text-center transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-lavender/30`}>
      <NeedArt need={need.id} />
      <span className="need-label relative z-10 rounded-[1.15rem] bg-white/90 px-3 py-2.5 text-base font-black text-navy shadow-[inset_0_1px_0_rgba(255,255,255,.75)]">{label ?? need.label}</span>
    </button>
  );
}

export function TaskArt({ title, visualKey, compact = false }: { title: string; visualKey?: TaskVisualKey; compact?: boolean }) {
  const key = visualKey ?? getTaskVisualKey(title);
  return <span className={`task-art task-art-${key} ${compact ? "compact" : ""}`} aria-hidden />;
}

export function PracticeArt({ category, title, compact = false }: { category: string; title: string; compact?: boolean }) {
  const text = `${category} ${title}`.toLowerCase();
  const emotion = text.includes("bewegen") || text.includes("spring") || text.includes("schud") || text.includes("dieren") ? "superDruk" : text.includes("samen") || text.includes("hulp") || text.includes("stop") ? "weetIkNiet" : text.includes("creatief") || text.includes("teken") || text.includes("kleur") ? "rustig" : text.includes("prikkel") || text.includes("kijk") || text.includes("5 dingen") ? "teVeel" : text.includes("start") || text.includes("keuze") ? "inDeWar" : "rustig";
  return <AvatarMascot emotion={emotion as EmotionType} size={compact ? "small" : "medium"} />;
}

function exerciseVisualKey(title: string) {
  const text = title.toLowerCase();
  if (text.includes("handen tegen elkaar")) return "handsPress";
  if (text.includes("dierenloop")) return "animalWalk";
  if (text.includes("schud je armen")) return "shakeArms";
  if (text.includes("spring 10")) return "jumpTen";
  if (text.includes("wiebel")) return "wiggleStop";
  if (text.includes("schildpad")) return "turtlePause";
  if (text.includes("waterpauze")) return "waterBreak";
  if (text.includes("gezicht zacht")) return "softFace";
  if (text.includes("rustdoos")) return "calmBox";
  if (text.includes("hulpzin")) return "helpSentence";
  if (text.includes("duimkeuze")) return "thumbChoice";
  if (text.includes("stop-zin")) return "stopSentence";
  if (text.includes("eerste stap") || text.includes("maak iets groots klein")) return "firstStep";
  if (text.includes("kleine keuze")) return "smallChoice";
  if (text.includes("wachthand")) return "waitHand";
  if (text.includes("samen plan")) return "planTogether";
  if (text.includes("robot")) return "robotRag";
  if (text.includes("slakkenstap")) return "snailStep";
  if (text.includes("veilig boos") || text.includes("boos op veilige")) return "safeAngry";
  if (text.includes("voel je voeten")) return "feelFeet";
  if (text.includes("kijk naar")) return "focusOne";
  if (text.includes("5 dingen")) return "fiveThings";
  if (text.includes("geluid")) return "softSound";
  if (text.includes("licht")) return "softLight";
  if (text.includes("blaadjes")) return "leafBreath";
  if (text.includes("ballon")) return "balloonBreath";
  if (text.includes("bloem") || text.includes("kaars")) return "flowerCandle";
  if (text.includes("slaapadem")) return "sleepBreath";
  if (text.includes("regenboog")) return "rainbowBreath";
  if (text.includes("adem zacht")) return "leafBreath";
  if (text.includes("hand op je hart")) return "heartHand";
  if (text.includes("lijf zwaar")) return "heavyBody";
  if (text.includes("teken je wolk")) return "drawCloud";
  if (text.includes("kleur rust")) return "colorCalm";
  if (text.includes("duw tegen de muur")) return "wallPushSpecific";
  if (text.includes("kussen")) return "pillowSqueezeSpecific";
  if (text.includes("draak")) return "dragonBreathSpecific";
  if (text.includes("rustige plek")) return "quietCorner";
  if (text.includes("schildpad") || text.includes("rustdoos")) return "quietCorner";
  if (text.includes("adem zacht") || text.includes("slaapadem") || text.includes("regenboog") || text.includes("blaadjes") || text.includes("ballon") || text.includes("bloem")) return "softBreath";
  if (text.includes("hulp nodig") || text.includes("vraag hulp") || text.includes("praat") || text.includes("samen plan") || text.includes("duim")) return "askHelp";
  if (text.includes("zachts") || text.includes("knuffel") || text.includes("waterpauze")) return "plush";
  if (text.includes("duw tegen de muur")) return "wallPush";
  if (text.includes("handen tegen elkaar") || text.includes("veilig boos")) return "wallPush";
  if (text.includes("draak")) return "dragonBreath";
  if (text.includes("kussen") || text.includes("robot")) return "pillowSqueeze";
  if (text.includes("stamp") || text.includes("spring") || text.includes("slakkenstap") || text.includes("wiebel")) return "stomping";
  if (text.includes("koptelefoon") || text.includes("geluid")) return "headphones";
  if (text.includes("deken") || text.includes("lijf zwaar")) return "blanket";
  if (text.includes("kijk naar") || text.includes("5 dingen") || text.includes("voeten") || text.includes("licht")) return "focusObject";
  if (text.includes("hart") || text.includes("gezicht") || text.includes("wachthand")) return "handHeart";
  return "softBreath";
}

export function ExerciseArt({ title, compact = false }: { title: string; compact?: boolean }) {
  return <span className={`exercise-art exercise-art-${exerciseVisualKey(title)} ${compact ? "compact" : ""}`} aria-hidden />;
}

export function DayPartCard({ title, progress, to }: { title: string; icon: string; progress: number; to: string }) {
  const dayPartVisual = title === "Ochtend" ? "wake" : title === "Na school" ? "school" : title === "Avond" ? "pajamas" : title === "Bedtijd" ? "sleep" : "rest";
  return (
    <NavLink to={to} className="flex min-h-28 items-center gap-4 rounded-[1.55rem] border border-white/85 bg-white/92 p-4 shadow-card ring-1 ring-lavender/8">
      <TaskArt title={title} visualKey={dayPartVisual as TaskVisualKey} />
      <div className="grid min-h-16 min-w-0 flex-1 content-center">
        <div className="text-center text-xl font-black">{title}</div>
        <div className="mt-2 h-2 rounded-full bg-lilac/18"><div className="h-2 rounded-full bg-gradient-to-r from-mint to-lavender" style={{ width: `${progress}%` }} /></div>
      </div>
      <ChevronRight className="text-lavender" />
    </NavLink>
  );
}

export function TaskCard({ task, done, needsHelp = false, onDone, onHelp, onEdit, onDelete, editable = false, showDetails = true }: { task: Task; done: boolean; needsHelp?: boolean; onDone?: () => void; onHelp?: () => void; onEdit?: () => void; onDelete?: () => void; editable?: boolean; showDetails?: boolean }) {
  return (
    <article className={`rounded-[1.6rem] border p-4 shadow-card ring-1 ${done ? "border-mint/35 bg-gradient-to-b from-white to-mint/10 ring-mint/12" : needsHelp ? "border-lavender/30 bg-gradient-to-b from-white to-lavender/8 ring-lavender/12" : "border-white/85 bg-white/94 ring-lavender/8"}`}>
      <div className="flex items-center gap-4">
        {editable ? <span data-drag-handle className="drag-handle grid h-14 w-10 place-items-center rounded-xl bg-lavender/8 text-lavender" aria-label="Vasthouden en slepen om te verplaatsen">
          <GripVertical size={22} />
        </span> : null}
        <TaskArt title={task.title} visualKey={task.visualKey as TaskVisualKey | undefined} compact />
        <div className="flex-1">
          <h3 className="text-xl font-black leading-tight">{task.title}</h3>
          {showDetails ? (task.optionalTime ? <span className="text-sm font-bold text-lavender">{task.optionalTime}</span> : <span className="text-sm font-bold text-navy/45">Tijd optioneel</span>) : null}
        </div>
        {onHelp ? <button aria-label={`Hulp bij ${task.title}`} onClick={onHelp} className="grid h-14 w-14 place-items-center rounded-2xl border-2 border-lilac/40 bg-white text-lavender">
          <HelpCircle size={27} />
        </button> : null}
        {editable && onDelete ? <button aria-label={`${task.title} verwijderen`} onClick={onDelete} className="grid h-14 w-14 place-items-center rounded-2xl border-2 border-coral/25 bg-coral/10 text-coral">
          <Trash2 size={25} />
        </button> : null}
        {!editable && onDone ? <button aria-label={`${task.title} afvinken`} onClick={onDone} className={`grid h-14 w-14 place-items-center rounded-2xl border-2 ${done ? "border-mint bg-mint text-white" : "border-lilac/40 bg-white text-lavender"}`}>
          <Check size={28} />
        </button> : null}
      </div>
      {!editable && done ? (
        <div className="mt-3 flex items-center gap-2 rounded-2xl bg-mint/10 px-3 py-2.5 text-sm font-black text-mint">
          <Sparkles size={17} />
          <span>Gelukt vandaag</span>
        </div>
      ) : !editable && needsHelp ? (
        <div className="mt-3 flex items-center gap-2 rounded-2xl bg-lavender/10 px-3 py-2.5 text-sm font-black text-lavender">
          <Sparkles size={17} />
          <span>Goed geprobeerd</span>
        </div>
      ) : null}
      {onEdit ? <div className="mt-3 flex gap-4">
        <button onClick={onEdit} className="inline-flex min-h-11 items-center gap-1 text-base font-black text-navy/55"><Pencil size={17} /> Aanpassen</button>
      </div> : null}
    </article>
  );
}

export function RewardSticker({ icon, label }: { icon: string; label: string }) {
  return <div className="reward-sticker rounded-[1.4rem] bg-white/92 p-4 text-center shadow-card"><div className="reward-sticker-icon mx-auto grid h-14 w-14 place-items-center rounded-full text-3xl">{icon}</div><div className="mt-2 text-xs font-black leading-tight">{label}</div></div>;
}

export function ParentCard({ icon, title, text, to }: { icon: ReactNode; title: string; text: string; to?: string }) {
  const body = <><div className="grid h-11 w-11 place-items-center rounded-2xl bg-lavender/10 text-lavender">{icon}</div><div className="flex-1"><h3 className="font-black">{title}</h3><p className="text-sm font-semibold text-navy/55">{text}</p></div>{to ? <ChevronRight className="text-lavender" /> : null}</>;
  return to ? <NavLink to={to} className="flex items-center gap-3 rounded-[1.4rem] bg-white p-4 shadow-card">{body}</NavLink> : <article className="flex items-center gap-3 rounded-[1.4rem] bg-white p-4 shadow-card">{body}</article>;
}

export const icons = { Plus, Settings, Leaf, Download, Upload, UserRound };

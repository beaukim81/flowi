import { ArrowLeft, Check, ChevronRight, Download, GripVertical, Heart, HelpCircle, Home, Leaf, MoreHorizontal, Pencil, Plus, Settings, Sparkles, Trash2, Upload, UserRound } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import type { Avatar, Emotion, EmotionType, Need, NeedType, Task } from "../types/schema";
import { getTaskVisualKey, type TaskVisualKey } from "../utils/taskVisuals";

export function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const isFixedScreen = location.pathname === "/" || location.pathname === "/rewards";
  return (
    <div className={`flowi-bg portrait-locked text-navy ${isFixedScreen ? "fixed-shell" : "scroll-shell"}`}>
      <div className="portrait-guard" aria-hidden>
        <section className="portrait-guard-card">
          <AvatarMascot emotion="rustig" size="medium" showCaption={false} />
          <h1 className="mt-4 text-3xl font-black text-navy">Draai Flowi rechtop</h1>
          <p className="mt-2 text-lg font-bold leading-7 text-navy/62">Flowi werkt rustig en duidelijk als je tablet of telefoon rechtop staat.</p>
        </section>
      </div>
      <main className={`app-content mx-auto w-full max-w-full px-0 pt-0 sm:max-w-5xl sm:px-6 lg:max-w-6xl ${isFixedScreen ? "fixed-main pb-0 sm:pt-0" : "scroll-main pb-32 sm:pt-6"}`}>{children}</main>
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
    <nav className="fixed inset-x-0 bottom-0 z-30 w-full max-w-full overflow-hidden border-t border-white/80 bg-white/90 px-2 py-2.5 shadow-[0_-14px_40px_rgba(62,59,130,.12)] backdrop-blur-2xl sm:px-3">
      <div className="mx-auto grid w-full max-w-lg grid-cols-4 gap-1.5 sm:max-w-4xl">
        {items.map((item) => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) => `flex min-h-16 min-w-0 flex-col items-center justify-center rounded-[1.25rem] px-1 text-[0.8rem] font-black leading-tight transition sm:rounded-[1.45rem] sm:text-sm ${isActive ? "bg-gradient-to-b from-lilac/28 to-lavender/12 text-lavender shadow-[inset_0_1px_0_rgba(255,255,255,.8)]" : "text-navy/55"}`}>
            <item.icon aria-hidden size={24} strokeWidth={2.5} />
            <span className="truncate">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export function PageHeader({ title, subtitle, back = true, backTo }: { title: string; subtitle?: string; back?: boolean; backTo?: string }) {
  const navigate = useNavigate();
  return (
    <header className={`mb-5 flex items-center gap-3 ${back ? "" : "justify-center text-center"}`}>
      {back && (
        <button aria-label="Terug" className="grid h-14 w-14 place-items-center rounded-[1.25rem] border border-white bg-white/90 shadow-card focus:outline-none focus:ring-4 focus:ring-lavender/30" onClick={() => backTo ? navigate(backTo) : navigate(-1)}>
          <ArrowLeft size={25} />
        </button>
      )}
      <div className={back ? "min-w-0 flex-1" : "mx-auto max-w-[18rem]"}>
        <h1 className="break-words text-2xl font-black tracking-normal text-navy">{title}</h1>
        {subtitle && title !== "Help mij nu" ? <p className="text-base font-bold leading-6 text-navy/55">{subtitle}</p> : null}
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
    blij: "25% 0%",
    verdrietig: "50% 0%",
    boos: "75% 0%",
    spannend: "100% 0%",
    overprikkeld: "0% 50%",
    druk: "25% 50%",
    superDruk: "25% 50%",
    inDeWar: "0% 100%",
    moe: "50% 50%",
    weetIkNiet: "75% 50%",
    teVeel: "100% 50%",
    snapNiet: "0% 100%",
    durfNiet: "25% 100%",
    wilHulp: "75% 100%"
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
    blij: "Blij",
    verdrietig: "Verdrietig",
    boos: "Boos",
    spannend: "Spannend",
    overprikkeld: "Overprikkeld",
    druk: "Druk",
    superDruk: "Druk",
    inDeWar: "Ik snap het niet",
    moe: "Moe",
    weetIkNiet: "Weet ik niet",
    teVeel: "Het is te veel",
    snapNiet: "Ik snap het niet",
    durfNiet: "Ik durf niet",
    wilHulp: "Ik wil hulp"
  };
  return labels[emotion];
}

export function EmotionCard({ emotion, avatar, onClick }: { emotion: Emotion; avatar?: Avatar; onClick: () => void }) {
  const files: Record<EmotionType, string> = {
    rustig: "rustig",
    blij: "blij",
    verdrietig: "verdrietig",
    boos: "boos",
    spannend: "spannend",
    overprikkeld: "overprikkeld",
    druk: "druk",
    superDruk: "druk",
    inDeWar: "snap-niet",
    moe: "moe",
    weetIkNiet: "weet-ik-niet",
    teVeel: "te-veel",
    snapNiet: "snap-niet",
    durfNiet: "durf-niet",
    wilHulp: "wil-hulp"
  };
  return (
    <button onClick={onClick} className={`emotion-card emotion-${emotion.id} transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-lavender/30`}>
      <span className="emotion-picture-art">
        <span className="emotion-card-art" style={{ backgroundImage: `url("/assets/emotions/flowi-emotion-${files[emotion.id]}.jpg?v=emotion-square-20260615")` }} aria-hidden />
      </span>
      <span className="emotion-label">{emotion.label}</span>
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
  const key = getTaskVisualKey(title, visualKey ?? "rest");
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

export function ChildTaskCard({ task, done, needsHelp = false, onDone, onHelp }: { task: Task; done: boolean; needsHelp?: boolean; onDone: () => void; onHelp?: () => void }) {
  return (
    <article className={`child-task-card ${done ? "is-done" : needsHelp ? "needs-help" : ""}`}>
      <div className="child-task-main">
        <TaskArt title={task.title} visualKey={task.visualKey as TaskVisualKey | undefined} />
        <h3>{task.title}</h3>
      </div>
      <div className="child-task-actions" aria-label={`Acties voor ${task.title}`}>
        <button type="button" aria-label={done ? `${task.title} weer open zetten` : `${task.title} is gelukt`} aria-pressed={done} onClick={onDone} className="child-task-done">
          <Check size={30} />
        </button>
        {onHelp ? (
          <button type="button" aria-label={`Hulp bij ${task.title}`} onClick={onHelp} className="child-task-help">
            <HelpCircle size={28} />
          </button>
        ) : null}
      </div>
    </article>
  );
}

export function TaskCard({ task, done, needsHelp = false, onDone, onHelp, onEdit, onDelete, editable = false, showDetails = true }: { task: Task; done: boolean; needsHelp?: boolean; onDone?: () => void; onHelp?: () => void; onEdit?: () => void; onDelete?: () => void; editable?: boolean; showDetails?: boolean }) {
  return (
    <article className={`rounded-[1.6rem] border p-4 shadow-card ring-1 ${done ? "border-mint/35 bg-gradient-to-b from-white to-mint/10 ring-mint/12" : needsHelp ? "border-lavender/30 bg-gradient-to-b from-white to-lavender/8 ring-lavender/12" : "border-white/85 bg-white/94 ring-lavender/8"}`}>
      <div className="flex min-w-0 items-center gap-2 sm:gap-4">
        {editable ? <span data-drag-handle className="drag-handle flex h-16 w-14 shrink-0 flex-col items-center justify-center rounded-[1.15rem] bg-gradient-to-b from-lilac/30 to-lavender/14 text-lavender shadow-[inset_0_1px_0_rgba(255,255,255,.75)] ring-1 ring-lavender/12" aria-label="Pak hier vast en sleep om te verplaatsen">
          <GripVertical size={24} strokeWidth={3} />
          <span className="mt-0.5 text-[0.62rem] font-black leading-none">Sleep</span>
        </span> : null}
        <TaskArt title={task.title} visualKey={task.visualKey as TaskVisualKey | undefined} compact />
        <div className="min-w-0 flex-1">
          <h3 className="break-words text-lg font-black leading-tight sm:text-xl">{task.title}</h3>
          {showDetails && task.optionalTime ? <span className="text-sm font-bold text-lavender">{task.optionalTime}</span> : null}
        </div>
        {onHelp ? <button aria-label={`Hulp bij ${task.title}`} onClick={onHelp} className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border-2 border-lilac/40 bg-white text-lavender sm:h-14 sm:w-14">
          <HelpCircle size={27} />
        </button> : null}
        {editable && onDelete ? <button aria-label={`${task.title} verwijderen`} onClick={onDelete} className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border-2 border-coral/25 bg-coral/10 text-coral sm:h-14 sm:w-14">
          <Trash2 size={25} />
        </button> : null}
        {!editable && onDone ? <button aria-label={done ? `${task.title} weer open zetten` : `${task.title} afvinken`} aria-pressed={done} onClick={onDone} className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl border-2 sm:h-14 sm:w-14 ${done ? "border-mint bg-mint text-white" : "border-lilac/40 bg-white text-lavender"}`}>
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

import { ArrowLeft, Check, ChevronRight, Download, GripVertical, Heart, Home, Leaf, MoreHorizontal, Pencil, Plus, Settings, Sparkles, Upload, UserRound } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import type { Avatar, Emotion, EmotionType, Need, Task } from "../types/schema";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flowi-bg min-h-dvh text-navy">
      <main className="mx-auto min-h-dvh w-full max-w-md px-4 pb-28 pt-4 sm:max-w-3xl sm:pt-8">{children}</main>
      <BottomNav />
    </div>
  );
}

function BottomNav() {
  const items = [
    { to: "/", label: "Home", icon: Home },
    { to: "/rewards", label: "Groei", icon: Heart },
    { to: "/practice", label: "Ontdek", icon: Sparkles },
    { to: "/parents", label: "Meer", icon: MoreHorizontal }
  ];
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/80 bg-white/88 px-3 py-2 shadow-[0_-14px_40px_rgba(62,59,130,.12)] backdrop-blur-2xl">
      <div className="mx-auto grid max-w-md grid-cols-4 gap-1 sm:max-w-3xl">
        {items.map((item) => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) => `flex min-h-14 flex-col items-center justify-center rounded-[1.35rem] text-xs font-bold transition ${isActive ? "bg-gradient-to-b from-lilac/28 to-lavender/12 text-lavender shadow-[inset_0_1px_0_rgba(255,255,255,.8)]" : "text-navy/55"}`}>
            <item.icon aria-hidden size={21} strokeWidth={2.4} />
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
    <header className="mb-4 flex items-center gap-3">
      {back && (
        <button aria-label="Terug" className="grid h-11 w-11 place-items-center rounded-[1.15rem] border border-white bg-white/90 shadow-card focus:outline-none focus:ring-4 focus:ring-lavender/30" onClick={() => navigate(-1)}>
          <ArrowLeft size={21} />
        </button>
      )}
      <div>
        <h1 className="text-xl font-extrabold tracking-normal text-navy">{title}</h1>
        {subtitle ? <p className="text-sm font-semibold text-navy/55">{subtitle}</p> : null}
      </div>
    </header>
  );
}

export function PrimaryButton(props: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return <button {...props} className={`min-h-12 rounded-[1.35rem] bg-gradient-to-b from-[#b69cff] via-[#9473f5] to-[#7857df] px-5 font-extrabold text-white shadow-[0_14px_24px_rgba(120,87,223,.28)] transition active:scale-[.98] focus:outline-none focus:ring-4 focus:ring-lavender/30 ${props.className ?? ""}`} />;
}

export function SecondaryButton(props: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return <button {...props} className={`min-h-12 rounded-[1.35rem] border border-lavender/14 bg-white/92 px-5 font-extrabold text-navy shadow-card focus:outline-none focus:ring-4 focus:ring-lavender/20 ${props.className ?? ""}`} />;
}

export function AvatarMascot({ avatar, emotion, size = "large" }: { avatar?: Avatar; emotion?: EmotionType; size?: "small" | "medium" | "large" }) {
  const isGiraffe = !avatar || avatar.id === "giraffe";
  const dimensions = size === "large" ? "h-56 w-56" : size === "medium" ? "h-36 w-36" : "h-24 w-24";
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
      <div className="giraffe-caption">{emotion ? emotionLabel(emotion) : "Flowi"}</div>
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
    <button onClick={onClick} className={`emotion-card emotion-${emotion.id} min-h-44 rounded-[1.7rem] p-3 text-left transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-lavender/30`}>
      <div className="emotion-card-art" style={{ backgroundPosition: positions[emotion.id] }} aria-hidden />
      <div className="emotion-label relative z-10 rounded-[1.1rem] bg-white/90 px-3 py-2 text-center text-sm font-black text-navy shadow-[inset_0_1px_0_rgba(255,255,255,.75)]">{emotion.label}</div>
    </button>
  );
}

export function NeedCard({ need, label, onClick }: { need: Need; label?: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="min-h-32 rounded-[1.55rem] border border-white/90 bg-white/92 p-4 text-center shadow-card transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-lavender/30">
      <div className="flowi-icon-token mx-auto mb-3 grid h-16 w-16 place-items-center rounded-[1.25rem] text-4xl">{need.icon}</div>
      <span className="text-sm font-black text-navy">{label ?? need.label}</span>
    </button>
  );
}

export function DayPartCard({ title, icon, progress, to }: { title: string; icon: string; progress: number; to: string }) {
  return (
    <NavLink to={to} className="flex min-h-20 items-center gap-4 rounded-[1.45rem] border border-white/85 bg-white/92 p-4 shadow-card ring-1 ring-lavender/8">
      <span className="grid h-13 w-13 min-h-12 min-w-12 place-items-center rounded-[1.1rem] bg-gradient-to-br from-sky/28 to-lilac/18 text-2xl shadow-[inset_0_1px_0_rgba(255,255,255,.8)]">{icon}</span>
      <div className="min-w-0 flex-1">
        <div className="font-black">{title}</div>
        <div className="mt-2 h-2 rounded-full bg-lilac/18"><div className="h-2 rounded-full bg-gradient-to-r from-mint to-lavender" style={{ width: `${progress}%` }} /></div>
      </div>
      <ChevronRight className="text-lavender" />
    </NavLink>
  );
}

export function TaskCard({ task, done, onDone, onHelp, onEdit }: { task: Task; done: boolean; onDone: () => void; onHelp?: () => void; onEdit?: () => void }) {
  return (
    <article className="rounded-[1.45rem] border border-white/85 bg-white/94 p-4 shadow-card ring-1 ring-lavender/8">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-8 place-items-center rounded-xl bg-lavender/8 text-lavender" aria-label="Sleep om te verplaatsen">
          <GripVertical size={18} />
        </span>
        <span className="flowi-icon-token grid h-12 w-12 place-items-center rounded-2xl text-2xl">{task.icon}</span>
        <div className="flex-1">
          <h3 className="font-black">{task.title}</h3>
          {task.optionalTime ? <span className="text-xs font-bold text-lavender">{task.optionalTime}</span> : <span className="text-xs font-bold text-navy/45">Tijd optioneel</span>}
        </div>
        <button aria-label={`${task.title} afvinken`} onClick={onDone} className={`grid h-12 w-12 place-items-center rounded-2xl border-2 ${done ? "border-mint bg-mint text-white" : "border-lilac/40 bg-white text-lavender"}`}>
          <Check size={24} />
        </button>
      </div>
      <div className="mt-3 flex gap-4">
        {onHelp ? <button onClick={onHelp} className="text-sm font-extrabold text-lavender">Lukt het niet?</button> : null}
        {onEdit ? <button onClick={onEdit} className="inline-flex items-center gap-1 text-sm font-extrabold text-navy/55"><Pencil size={14} /> Aanpassen</button> : null}
      </div>
    </article>
  );
}

export function RewardSticker({ icon, label }: { icon: string; label: string }) {
  return <div className="rounded-[1.4rem] bg-white p-4 text-center shadow-card"><div className="text-4xl">{icon}</div><div className="mt-2 text-xs font-black">{label}</div></div>;
}

export function ParentCard({ icon, title, text, to }: { icon: ReactNode; title: string; text: string; to?: string }) {
  const body = <><div className="grid h-11 w-11 place-items-center rounded-2xl bg-lavender/10 text-lavender">{icon}</div><div className="flex-1"><h3 className="font-black">{title}</h3><p className="text-sm font-semibold text-navy/55">{text}</p></div>{to ? <ChevronRight className="text-lavender" /> : null}</>;
  return to ? <NavLink to={to} className="flex items-center gap-3 rounded-[1.4rem] bg-white p-4 shadow-card">{body}</NavLink> : <article className="flex items-center gap-3 rounded-[1.4rem] bg-white p-4 shadow-card">{body}</article>;
}

export const icons = { Plus, Settings, Leaf, Download, Upload, UserRound };

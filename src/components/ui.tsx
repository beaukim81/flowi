import { ArrowLeft, Check, ChevronRight, Download, Heart, Home, Leaf, MoreHorizontal, Plus, Settings, Sparkles, Upload, UserRound } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import type { Avatar, Emotion, EmotionType, Need, Task } from "../types/schema";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-[radial-gradient(circle_at_18%_5%,#eef7ff_0,#fbf9ff_34%,#fff_100%)] text-navy">
      <main className="mx-auto min-h-dvh w-full max-w-md px-4 pb-28 pt-4 sm:max-w-3xl">{children}</main>
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
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/70 bg-white/86 px-3 py-2 shadow-[0_-10px_30px_rgba(72,63,137,.08)] backdrop-blur-xl">
      <div className="mx-auto grid max-w-md grid-cols-4 gap-1 sm:max-w-3xl">
        {items.map((item) => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) => `flex min-h-14 flex-col items-center justify-center rounded-2xl text-xs font-bold transition ${isActive ? "bg-lavender/12 text-lavender" : "text-navy/60"}`}>
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
        <button aria-label="Terug" className="grid h-11 w-11 place-items-center rounded-2xl bg-white shadow-card focus:outline-none focus:ring-4 focus:ring-lavender/30" onClick={() => navigate(-1)}>
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
  return <button {...props} className={`min-h-12 rounded-2xl bg-gradient-to-b from-lilac to-lavender px-5 font-extrabold text-white shadow-card transition active:scale-[.98] focus:outline-none focus:ring-4 focus:ring-lavender/30 ${props.className ?? ""}`} />;
}

export function SecondaryButton(props: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return <button {...props} className={`min-h-12 rounded-2xl border border-lavender/15 bg-white px-5 font-extrabold text-navy shadow-card focus:outline-none focus:ring-4 focus:ring-lavender/20 ${props.className ?? ""}`} />;
}

export function AvatarMascot({ avatar, emotion, size = "large" }: { avatar?: Avatar; emotion?: EmotionType; size?: "small" | "medium" | "large" }) {
  const faces: Partial<Record<EmotionType, string>> = {
    rustig: "˘‿˘",
    verdrietig: "ಥ_ಥ",
    boos: "ಠ_ಠ",
    teVeel: "⊙_⊙",
    superDruk: "≧◡≦",
    inDeWar: "؟_؟",
    moe: "-_-",
    weetIkNiet: "•_•?"
  };
  const dimensions = size === "large" ? "h-44 w-44 text-7xl" : size === "medium" ? "h-28 w-28 text-5xl" : "h-16 w-16 text-3xl";
  return (
    <div className={`relative mx-auto grid ${dimensions} place-items-center rounded-[2rem] bg-gradient-to-br from-yellow-100 via-white to-lilac/40 shadow-soft`}>
      <span className="drop-shadow-sm" aria-hidden>{avatar?.icon ?? "🦒"}</span>
      <span className="absolute bottom-4 rounded-full bg-white/85 px-3 py-1 text-xs font-black text-navy shadow-card">{emotion ? faces[emotion] : "Flowi"}</span>
    </div>
  );
}

export function EmotionCard({ emotion, avatar, onClick }: { emotion: Emotion; avatar?: Avatar; onClick: () => void }) {
  const dark = emotion.id === "moe";
  return (
    <button onClick={onClick} className={`min-h-40 rounded-[1.75rem] bg-gradient-to-br ${emotion.colors} p-3 text-left shadow-card ring-1 ring-white/70 transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-lavender/30`}>
      <div className="mb-2 flex justify-end text-2xl">{emotion.marks}</div>
      <AvatarMascot avatar={avatar} emotion={emotion.id} size="small" />
      <div className={`mt-3 rounded-2xl bg-white/88 px-3 py-2 text-center text-sm font-black ${dark ? "text-navy" : "text-navy"}`}>{emotion.label}</div>
    </button>
  );
}

export function NeedCard({ need, label, onClick }: { need: Need; label?: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="min-h-32 rounded-[1.6rem] border border-white bg-white p-4 text-center shadow-card transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-lavender/30">
      <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-lavender/10 text-3xl">{need.icon}</div>
      <span className="text-sm font-black text-navy">{label ?? need.label}</span>
    </button>
  );
}

export function DayPartCard({ title, icon, progress, to }: { title: string; icon: string; progress: number; to: string }) {
  return (
    <NavLink to={to} className="flex min-h-20 items-center gap-4 rounded-[1.4rem] bg-white p-4 shadow-card ring-1 ring-lavender/8">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-sky/18 text-2xl">{icon}</span>
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
    <article className="rounded-[1.4rem] bg-white p-4 shadow-card ring-1 ring-lavender/8">
      <div className="flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-honey/18 text-2xl">{task.icon}</span>
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
        {onEdit ? <button onClick={onEdit} className="text-sm font-extrabold text-navy/55">Aanpassen</button> : null}
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

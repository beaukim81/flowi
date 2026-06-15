import type { CalmStrategy, EmotionType, NeedType } from "../types/schema";

const now = () => new Date().toISOString();
const make = (title: string, emotion: EmotionType[], needs: NeedType[], icon: string, childText: string, seconds = 120): CalmStrategy => ({
  id: title.toLowerCase().replaceAll(" ", "-").replaceAll(":", ""),
  title,
  childText,
  parentText: "Blijf dichtbij, geef weinig woorden en benoem de kleine stap.",
  linkedEmotionTypes: emotion,
  linkedNeedTypes: needs,
  icon,
  durationSeconds: seconds,
  isDefault: true,
  isEnabled: true,
  createdAt: now(),
  updatedAt: now()
});

export const calmStrategies: CalmStrategy[] = [
  make("Duw tegen de muur", ["boos"], ["bewegen"], "🧱", "Zet je voeten stevig op de grond. Duw 5 keer rustig tegen de muur."),
  make("Adem als een draak", ["boos"], ["ademen"], "🐉", "Adem diep in. Blaas langzaam uit alsof je zachte rook maakt."),
  make("Knijp in een kussen", ["boos"], ["knuffel"], "🟨", "Pak een kussen. Knijp hard en laat weer los."),
  make("Stamp 10 keer", ["boos"], ["bewegen"], "👣", "Stamp 10 keer stevig op de vloer. Daarna sta je stil."),
  make("Zeg: stop, ik heb hulp nodig", ["boos"], ["praatMetOuder"], "✋", "Zeg rustig: stop, ik heb hulp nodig."),
  make("Zet je koptelefoon op", ["teVeel"], ["koptelefoon"], "🎧", "Zet je koptelefoon op. Kies een plek met minder geluid."),
  make("Ga naar je rustige plek", ["teVeel"], ["rustigePlek"], "⛺", "Loop naar je rustige plek. Je hoeft even niets."),
  make("Kruip onder een deken", ["teVeel"], ["evenAlleen"], "🛏️", "Kruip onder een deken. Voel hoe je lijf gedragen wordt."),
  make("Kijk naar één ding", ["teVeel"], ["ademen"], "🔵", "Kies één ding om naar te kijken. Adem 5 keer zacht."),
  make("Maak het licht zachter", ["teVeel"], ["rustigePlek"], "💡", "Vraag of het licht zachter mag. Maak je plek rustiger."),
  make("Spring 10 keer", ["superDruk"], ["bewegen"], "⭐", "Spring 10 keer. Land zacht en tel mee."),
  make("Schud je armen los", ["superDruk"], ["bewegen"], "🙌", "Schud je armen los. Eerst snel, dan langzaam."),
  make("Ren heen en terug", ["superDruk"], ["bewegen"], "🏃", "Ren naar een veilige plek en terug. Daarna adem je uit."),
  make("Draag iets zwaars", ["superDruk"], ["bewegen"], "🎒", "Draag iets zwaars naar de tafel. Je lijf krijgt werk."),
  make("Doe een dierenloop", ["superDruk"], ["bewegen"], "🐾", "Loop als een dier naar de andere kant van de kamer."),
  make("Pak iets zachts", ["verdrietig"], ["knuffel"], "🧸", "Pak iets zachts. Of vraag of je even tegen je ouder aan mag zitten."),
  make("Kies dichtbij of ruimte", ["verdrietig"], ["evenAlleen", "praatMetOuder"], "🤍", "Kies: wil je iemand dichtbij, even vastgehouden worden, of juist ruimte?"),
  make("Hand op je hart", ["verdrietig"], ["ademen"], "💛", "Leg je hand op je hart. Adem rustig in en uit."),
  make("Teken je wolk", ["verdrietig"], ["creatief"], "☁️", "Teken een wolk voor je gevoel. Alles mag erop."),
  make("Vraag een knuffel", ["verdrietig"], ["knuffel"], "💜", "Vraag: mag ik een knuffel of even vastgehouden worden? Hulp vragen is knap."),
  make("Wijs aan waar je het voelt", ["inDeWar"], ["praatMetOuder"], "👉", "Wijs aan waar je het voelt in je lijf."),
  make("Kies samen", ["inDeWar", "weetIkNiet"], ["praatMetOuder"], "🧑‍🧒", "Vraag iemand om samen één kleine keuze te maken."),
  make("Teken je warboel", ["inDeWar"], ["creatief"], "🌀", "Teken de warboel. Het hoeft niet mooi."),
  make("Maak één kleine keuze", ["inDeWar", "weetIkNiet"], ["rustigePlek"], "1️⃣", "Kies één ding: zitten, drinken of ademen."),
  make("Zeg: ik weet het even niet", ["inDeWar", "weetIkNiet"], ["praatMetOuder"], "?", "Zeg: ik weet het even niet. Dat is genoeg."),
  make("Maak je lijf zwaar", ["moe"], ["rustigePlek"], "🌙", "Ga zitten of liggen. Laat je schouders zakken."),
  make("Adem zacht", ["moe", "rustig"], ["ademen"], "🌬️", "Adem zacht in. Adem nog zachter uit."),
  make("Zoek een rustig plekje", ["moe"], ["rustigePlek"], "🛋️", "Zoek een rustig plekje. Je lijf mag opladen."),
  make("Even niets", ["moe"], ["evenAlleen"], "⏸️", "Doe even niets. Alleen zitten telt ook."),
  make("Licht zachter", ["moe"], ["rustigePlek"], "🌘", "Maak het licht zachter en je stem stiller."),
  make("Bewaar dit gevoel", ["rustig"], ["creatief"], "🌿", "Merk op wat fijn voelt. Bewaar het als rustkracht."),
  make("Geef je rustkracht water", ["rustig"], ["ademen"], "🌱", "Adem 3 keer. Je rustkracht krijgt water."),
  make("Kies iets fijns", ["rustig"], ["creatief"], "💛", "Kies iets kleins dat fijn is om te doen."),
  make("Oefen een rustkaart", ["rustig"], ["ademen"], "🃏", "Kies een rustkaart en probeer hem rustig uit.")
];

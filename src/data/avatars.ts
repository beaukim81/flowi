import type { Avatar } from "../types/schema";

export const avatarAssets: Avatar[] = [
  { id: "giraffe", label: "Giraffe", icon: "🦒", defaultImage: "giraffe", isDefault: true, isEnabled: true },
  { id: "koala", label: "Koala", icon: "🐨", defaultImage: "koala", isDefault: false, isEnabled: true },
  { id: "vos", label: "Vos", icon: "🦊", defaultImage: "vos", isDefault: false, isEnabled: true },
  { id: "konijn", label: "Konijn", icon: "🐰", defaultImage: "konijn", isDefault: false, isEnabled: true },
  { id: "panda", label: "Panda", icon: "🐼", defaultImage: "panda", isDefault: false, isEnabled: true },
  { id: "dino", label: "Dino", icon: "🦕", defaultImage: "dino", isDefault: false, isEnabled: true }
];

export const emotionVariantByAvatar = {
  giraffe: "premium-giraffe-v1",
  koala: "future-koala-v1",
  vos: "future-fox-v1",
  konijn: "future-rabbit-v1",
  panda: "future-panda-v1",
  dino: "future-dino-v1"
} as const;

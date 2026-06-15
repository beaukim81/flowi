import type { Avatar } from "../types/schema";

export const avatarAssets: Avatar[] = [
  { id: "giraffe", label: "Flowi", icon: "🦒", defaultImage: "giraffe", isDefault: true, isEnabled: true }
];

export const emotionVariantByAvatar = {
  giraffe: "premium-giraffe-v1",
  koala: "future-koala-v1",
  vos: "future-fox-v1",
  konijn: "future-rabbit-v1",
  panda: "future-panda-v1",
  dino: "future-dino-v1"
} as const;

import { create } from "zustand";
import type { EmotionType, NeedType } from "../types/schema";

interface CurrentFlowState {
  selectedEmotion?: EmotionType;
  selectedNeed?: NeedType;
  selectedActionId?: string;
  setEmotion: (emotion: EmotionType) => void;
  setNeed: (need: NeedType) => void;
  setAction: (actionId: string) => void;
}

export const useCurrentFlow = create<CurrentFlowState>((set) => ({
  selectedEmotion: (localStorage.getItem("flowi:selectedEmotion") || undefined) as EmotionType | undefined,
  selectedNeed: (localStorage.getItem("flowi:selectedNeed") || undefined) as NeedType | undefined,
  selectedActionId: localStorage.getItem("flowi:selectedAction") || undefined,
  setEmotion: (emotion) => {
    localStorage.setItem("flowi:selectedEmotion", emotion);
    set({ selectedEmotion: emotion });
  },
  setNeed: (need) => {
    localStorage.setItem("flowi:selectedNeed", need);
    set({ selectedNeed: need });
  },
  setAction: (selectedActionId) => {
    localStorage.setItem("flowi:selectedAction", selectedActionId);
    set({ selectedActionId });
  }
}));

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ThemeState {
  theme: "light" | "dark";
  toggle: () => void;
  set: (t: "light" | "dark") => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "dark",
      toggle: () => {
        const novo = get().theme === "light" ? "dark" : "light";
        document.documentElement.classList.toggle("dark", novo === "dark");
        set({ theme: novo });
      },
      set: (t) => {
        document.documentElement.classList.toggle("dark", t === "dark");
        set({ theme: t });
      },
    }),
    { name: "3aq-talent-theme" }
  )
);

import { defineStore } from "pinia";

export const useGeneralStore = defineStore("general", {
  state() {
    return {
      _themeMode: "ligth",
    };
  },
  getters: {
    themeMode(state) {
      return state._themeMode;
    },
  },
  actions: {
    onSetMode(mode: string) {
      if (this.themeMode) {
        document.documentElement.classList.remove(this.themeMode);
      }
      document.documentElement.classList.add(mode);
      this._themeMode = mode;
      localStorage.theme = mode;
    },
    onGetMode() {
      if (
        localStorage.theme === "dark" ||
        (!("theme" in localStorage) &&
          window.matchMedia("(prefers-color-scheme: dark)").matches)
      ) {
        this.onSetMode("dark");
      } else {
        this.onSetMode("light");
      }
    },
  },
});

import { CustomError } from "@/utils/customError";
import { defineStore } from "pinia";

export const useGeneralStore = defineStore("general", {
  state() {
    return {
      _themeMode: "ligth",
      _error: null as CustomError | null,
    };
  },
  getters: {
    themeMode(state) {
      return state._themeMode;
    },
    error(state) {
      return state._error;
    },
  },
  actions: {
    setError(error: CustomError | null) {
      this._error = error;
    },
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

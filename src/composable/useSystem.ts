import { computed } from "vue";

export const useSystem = () => {
  const isElectron = computed(
    () =>
      typeof navigator === "object" &&
      typeof navigator.userAgent === "string" &&
      navigator.userAgent.indexOf("Electron") >= 0
  );

  return {
    isElectron,
  };
};

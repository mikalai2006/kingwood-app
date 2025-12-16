import fs from "node:fs";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

import Components from "unplugin-vue-components/vite";
import { AntDesignVueResolver } from "unplugin-vue-components/resolvers";

export default defineConfig(({ mode, command }) => {
  return {
    base: "/app-site/",
    outDir: "app-site",
    resolve: {
      alias: [{ find: "@", replacement: "/src" }],
    },
    plugins: [
      vue(),
      Components({
        resolvers: [
          AntDesignVueResolver({
            importStyle: false,
          }),
        ],
      }),
    ],
    clearScreen: false,
  };
});

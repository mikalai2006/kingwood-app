import fs from "node:fs";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import electron from "vite-plugin-electron/simple";
import pkg from "./package.json";

import vueDevTools from "vite-plugin-vue-devtools";

import Components from "unplugin-vue-components/vite";
import { AntDesignVueResolver } from "unplugin-vue-components/resolvers";

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  fs.rmSync("dist-electron", { recursive: true, force: true });

  const isServe = command === "serve";
  const isBuild = command === "build";
  const sourcemap = isServe || !!process.env.VSCODE_DEBUG;

  return {
    resolve: {
      alias: [
        { find: "@", replacement: "/src" },
        // {
        //   find: 'vue',
        //   replacement: 'vue/dist/vue.esm-bundler.js',
        // },
      ],
    },
    plugins: [
      vueDevTools(),
      vue(),
      // electron({
      //   main: {
      //     // Shortcut of `build.lib.entry`
      //     entry: "electron/main/index.ts",
      //     onstart({ startup }) {
      //       if (process.env.VSCODE_DEBUG) {
      //         console.log(
      //           /* For `.vscode/.debug.script.mjs` */ "[startup] Electron App"
      //         );
      //       } else {
      //         startup();
      //       }
      //     },
      //     vite: {
      //       build: {
      //         sourcemap,
      //         minify: isBuild,
      //         outDir: "dist-electron/main",
      //         rollupOptions: {
      //           // Some third-party Node.js libraries may not be built correctly by Vite, especially `C/C++` addons,
      //           // we can use `external` to exclude them to ensure they work correctly.
      //           // Others need to put them in `dependencies` to ensure they are collected into `app.asar` after the app is built.
      //           // Of course, this is not absolute, just this way is relatively simple. :)
      //           external: Object.keys(
      //             "dependencies" in pkg ? pkg.dependencies : {}
      //           ),
      //         },
      //       },
      //     },
      //   },
      //   preload: {
      //     // Shortcut of `build.rollupOptions.input`.
      //     // Preload scripts may contain Web assets, so use the `build.rollupOptions.input` instead `build.lib.entry`.
      //     input: "electron/preload/index.ts",
      //     vite: {
      //       build: {
      //         sourcemap: sourcemap ? "inline" : undefined, // #332
      //         minify: isBuild,
      //         outDir: "dist-electron/preload",
      //         rollupOptions: {
      //           external: Object.keys(
      //             "dependencies" in pkg ? pkg.dependencies : {}
      //           ),
      //         },
      //       },
      //     },
      //   },
      //   // Ployfill the Electron and Node.js API for Renderer process.
      //   // If you want use Node.js in Renderer process, the `nodeIntegration` needs to be enabled in the Main process.
      //   // See 👉 https://github.com/electron-vite/vite-plugin-electron-renderer
      //   renderer: {},
      // }),
      Components({
        resolvers: [
          AntDesignVueResolver({
            importStyle: false, // css in js
          }),
        ],
      }),
    ],
    // server:
    //   process.env.VSCODE_DEBUG &&
    //   (() => {
    //     const url = new URL(pkg.debug.env.VITE_DEV_SERVER_URL);
    //     return {
    //       host: url.hostname,
    //       port: +url.port,
    //     };
    //   })(),

    // server: {
    //   proxy: {
    //     "/api/v1": {
    //       target: "http://localhost:8000/", //https://kingwood-apps.ru/ - http://localhost:8000/
    //       changeOrigin: true,
    //       secure: false,
    //       ws: true,
    //       configure: (proxy, _options) => {
    //         proxy.on("error", (err, _req, _res) => {
    //           console.log("proxy error", err);
    //         });
    //         proxy.on("proxyReq", (proxyReq, req, _res) => {
    //           console.log(
    //             "Sending Request to the Target:",
    //             req.method,
    //             req.url
    //           );
    //         });
    //         proxy.on("proxyRes", (proxyRes, req, _res) => {
    //           console.log(
    //             "Received Response from the Target:",
    //             proxyRes.statusCode,
    //             req.url
    //           );
    //         });
    //       },
    //     },
    //   },
    // },
    clearScreen: false,
  };
});

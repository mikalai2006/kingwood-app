import { app, BrowserWindow, shell, ipcMain, nativeImage } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import os from "node:os";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const log = require("electron-log");
const { autoUpdater } = require("electron-updater");
//-------------------------------------------------------------------
// Logging
//
// THIS SECTION IS NOT REQUIRED
//
// This logging setup is not required for auto-updates to work,
// but it sure makes debugging easier :)
//-------------------------------------------------------------------
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = "info";
log.info("App starting...");

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.mjs   > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.APP_ROOT = path.join(__dirname, "../..");

export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

// Disable GPU Acceleration for Windows 7
if (os.release().startsWith("6.1")) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === "win32") app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

let win: BrowserWindow | null = null;
const preload = path.join(__dirname, "../preload/index.mjs");
const indexHtml = path.join(RENDERER_DIST, "index.html");

// const appIcon = nativeImage.createFromPath("../public/icon_black.ico");

async function createWindow() {
  win = new BrowserWindow({
    title: "App",
    icon: path.join(process.env.VITE_PUBLIC, "icon_black.ico"),
    webPreferences: {
      preload,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // nodeIntegration: true,

      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      contextIsolation: true,
    },
    width: 1600,
    height: 900,
    autoHideMenuBar: true,
    frame: false,
    titleBarStyle: "hidden",
    titleBarOverlay: {
      color: "#2f324100",
      // symbolColor: "#111",
      // height: 20,
    },
  });

  if (VITE_DEV_SERVER_URL) {
    // #298
    win.loadURL(VITE_DEV_SERVER_URL);
    // Open devTool if the app is not packaged
    win.webContents.openDevTools();
    win.webContents.session.clearCache();
  } else {
    win.loadFile(indexHtml);
    win.webContents.openDevTools();
  }

  // Test actively push message to the Electron-Renderer
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:")) shell.openExternal(url);
    return { action: "deny" };
  });
  // win.webContents.on('will-navigate', (event, url) => { }) #344
}

app.whenReady().then(async () => {
  await createWindow();

  //-------------------------------------------------------------------
  // Auto updates - Option 1 - Simplest version
  //
  // This will immediately download an update, then install when the
  // app quits.
  //-------------------------------------------------------------------

  autoUpdater.checkForUpdatesAndNotify();
});

app.on("window-all-closed", () => {
  win = null;
  if (process.platform !== "darwin") app.quit();
});

app.on("second-instance", () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

app.on("activate", () => {
  const allWindows = BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    createWindow();
  }
});

// New window example arg: new windows url
ipcMain.handle("open-win", (_, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  if (VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${VITE_DEV_SERVER_URL}#${arg}`);
  } else {
    childWindow.loadFile(indexHtml, { hash: arg });
  }
});

// updater.
function sendStatusToWindow(text) {
  log.info(text);
  win.webContents.send("message", text);
}

autoUpdater.on("checking-for-update", () => {
  sendStatusToWindow("Проверка обновлений...");
});
// autoUpdater.on("update-available", (info) => {
//   sendStatusToWindow("Доступно обновление для программы!");
// });
// autoUpdater.on("update-not-available", (info) => {
//   sendStatusToWindow("Update not available.");
// });
autoUpdater.on("error", (err) => {
  sendStatusToWindow("Ошибка в автообновлении: " + err);
});
// autoUpdater.on("download-progress", (progressObj) => {
//   let log_message = ""; // "Download speed: " + progressObj.bytesPerSecond;
//   log_message = log_message + "Скачано " + progressObj.percent + "%";
//   log_message =
//     log_message +
//     " (" +
//     progressObj.transferred +
//     "/" +
//     progressObj.total +
//     ")";
//   sendStatusToWindow(log_message);
// });
autoUpdater.on("update-downloaded", (info) => {
  sendStatusToWindow(
    "Обновления для программы успешно загружены! Перезапустите программу для применения обновлений!"
  );
});

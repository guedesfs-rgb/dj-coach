// App de Mac: uma janela transparente, sempre por cima do Serato, que deixa os cliques passarem.
const { app, BrowserWindow, screen, globalShortcut, ipcMain, session, Menu } = require("electron");
const path = require("path");

let win;

function createOverlay() {
  const { workArea } = screen.getPrimaryDisplay();
  win = new BrowserWindow({
    ...workArea,
    transparent: true,
    frame: false,
    hasShadow: false,
    resizable: false,
    movable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    backgroundColor: "#00000000",
    webPreferences: { preload: path.join(__dirname, "preload.js") },
  });
  // Fica acima até do Serato em tela cheia.
  win.setAlwaysOnTop(true, "screen-saver");
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  win.setIgnoreMouseEvents(true, { forward: true });
  win.loadFile(path.join(__dirname, "..", "overlay.html"));
}

app.whenReady().then(() => {
  // Libera o MIDI (a controladora) sem perguntar.
  const allowMidi = (perm) => perm === "midi" || perm === "midiSysex";
  session.defaultSession.setPermissionRequestHandler((_wc, perm, cb) => cb(allowMidi(perm)));
  session.defaultSession.setPermissionCheckHandler((_wc, perm) => allowMidi(perm));

  Menu.setApplicationMenu(
    Menu.buildFromTemplate([
      {
        label: "DJ Coach",
        submenu: [
          { label: "Mostrar/esconder overlay", accelerator: "CommandOrControl+Shift+D", click: toggle },
          { type: "separator" },
          { role: "quit", label: "Sair" },
        ],
      },
    ])
  );
  globalShortcut.register("CommandOrControl+Shift+D", toggle);
  createOverlay();
});

function toggle() {
  if (win.isVisible()) win.hide();
  else win.showInactive();
}

ipcMain.on("click-through", (_e, on) => win.setIgnoreMouseEvents(on, { forward: true }));

app.on("will-quit", () => globalShortcut.unregisterAll());
app.on("window-all-closed", () => app.quit());

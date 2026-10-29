// App de Mac: uma janela transparente, sempre por cima do Serato, que deixa os cliques passarem.
const { app, BrowserWindow, screen, globalShortcut, ipcMain, session, Menu, Tray, nativeImage } = require("electron");
const path = require("path");

let win;
let tray;

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
  // skipTransformProcessType mantém o ícone no Dock (sem ele o macOS esconde o app).
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true, skipTransformProcessType: true });
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
          { label: "Voltar um passo", accelerator: "CommandOrControl+Shift+Left", click: () => nav(-1) },
          { label: "Pular passo", accelerator: "CommandOrControl+Shift+Right", click: () => nav(1) },
          { type: "separator" },
          { role: "quit", label: "Sair" },
        ],
      },
    ])
  );
  // Atalhos globais: funcionam mesmo com o Serato em foco.
  // Ícone 🎧 na barra de menus: sempre dá para mostrar/esconder e sair por aqui.
  tray = new Tray(nativeImage.createEmpty());
  tray.setTitle("🎧");
  tray.setToolTip("DJ Coach");
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: "Mostrar/esconder overlay (⌘⇧D)", click: toggle },
      { label: "Voltar um passo (⌘⇧←)", click: () => nav(-1) },
      { label: "Pular passo (⌘⇧→)", click: () => nav(1) },
      { type: "separator" },
      { label: "Sair do DJ Coach (⌘⇧Q)", click: () => app.quit() },
    ])
  );
  if (app.dock) app.dock.show();

  globalShortcut.register("CommandOrControl+Shift+D", toggle);
  globalShortcut.register("CommandOrControl+Shift+Left", () => nav(-1));
  globalShortcut.register("CommandOrControl+Shift+Right", () => nav(1));
  globalShortcut.register("CommandOrControl+Shift+Q", () => app.quit());
  createOverlay();
});

function toggle() {
  if (win.isVisible()) win.hide();
  else win.showInactive();
}

function nav(dir) {
  win.webContents.send("nav", dir);
}

ipcMain.on("quit", () => app.quit());
ipcMain.on("click-through", (_e, on) => win.setIgnoreMouseEvents(on, { forward: true }));

app.on("will-quit", () => globalShortcut.unregisterAll());
app.on("window-all-closed", () => app.quit());

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("overlay", {
  setClickThrough: (on) => ipcRenderer.send("click-through", on),
  quit: () => ipcRenderer.send("quit"),
  onNav: (cb) => ipcRenderer.on("nav", (_e, dir) => cb(dir)),
});

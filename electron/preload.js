const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("overlay", {
  setClickThrough: (on) => ipcRenderer.send("click-through", on),
});

// Só no app de Mac: a janela deixa os cliques passarem para o Serato,
// exceto quando o mouse está sobre uma área .interactive (menus e botões do DJ Coach).
if (!window.overlay) document.querySelector("#quit").style.display = "none";
if (window.overlay) {
  document.querySelector("#quit").onclick = () => window.overlay.quit();
  window.overlay.onNav((dir) => (dir < 0 ? prevStep() : nextStep()));
  document.querySelectorAll(".interactive").forEach((el) => {
    el.addEventListener("mouseenter", () => window.overlay.setClickThrough(false));
    el.addEventListener("mouseleave", () => window.overlay.setClickThrough(true));
  });
}

// Sai da frente da lista de músicas enquanto você escolhe a próxima:
// girar/apertar o BROWSE (ou um passo que pede para escolher música) deixa
// a pista e a controladora quase invisíveis e reduz o cartão a uma linha.
let browseTimer = null;
let stepNeedsBrowse = false;
const setBrowsing = () =>
  document.body.classList.toggle("browsing", stepNeedsBrowse || browseTimer !== null);

window.addEventListener("dj-input", (e) => {
  if (!/^browse/.test(e.detail.id)) return;
  clearTimeout(browseTimer);
  browseTimer = setTimeout(() => { browseTimer = null; setBrowsing(); }, 5000);
  setBrowsing();
});
window.addEventListener("dj-step", (e) => {
  stepNeedsBrowse = !!(e.detail && e.detail.hl.includes("browse"));
  setBrowsing();
});

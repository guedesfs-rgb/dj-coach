// Só no app de Mac: a janela deixa os cliques passarem para o Serato,
// exceto quando o mouse está sobre uma área .interactive (menus e botões do DJ Coach).
if (window.overlay) {
  document.querySelectorAll(".interactive").forEach((el) => {
    el.addEventListener("mouseenter", () => window.overlay.setClickThrough(false));
    el.addEventListener("mouseleave", () => window.overlay.setClickThrough(true));
  });
}

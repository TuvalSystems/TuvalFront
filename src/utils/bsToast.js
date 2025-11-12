function scapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function bsToast({
  title = "Notificación",
  text = "",
  iconClass = "",
  delay = 4000,
  autohide = true,
  //   placement = "topRight",
  //   animation = "true",
}) {
  //Asegurar el contendor
  let container = document.getElementById("toast-stack");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-stack";
    container.className = "toast-container position-fixed bottom-0 end-0 p-3";
    container.style.zIndex = 9999;
    document.body.appendChild(container);
  }

  // 🔹 Limita a 5 toasts: elimina el más antiguo
  while (container.childElementCount >= 5)
    container.firstElementChild?.remove();

  //crea el toast
  const el = document.createElement("div");
  el.className = "toast";
  el.setAttribute("role", "alert");
  el.setAttribute("aria-live", "assertive");
  el.setAttribute("aria-atomic", "true");
  el.innerHTML = `
    <div class="toast-header">
      ${iconClass ? `<i class="${iconClass} me-2"></i>` : ""}
      <strong class="me-auto">${scapeHtml(title)}</strong>
      <small class="text-muted">just now</small>
      <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
    <div class="toast-body">${scapeHtml(text)}</div>
  `;

  container.appendChild(el);
  const t = new window.bootstrap.Toast(el, { delay, autohide });
  t.show();
  el.addEventListener("hidden.bs.toast", () => el.remove());

  return t;
}

function scapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function bsToast({
  title = "Notificacion",
  text = "",
  iconClass = "",
  delay = 4000,
  autohide = true,
}) {
  let container = document.getElementById("toast-stack");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-stack";
    container.className =
      "toast-container tuval-toast-stack position-fixed bottom-0 end-0 p-3 space-y-3";
    document.body.appendChild(container);
  }

  while (container.childElementCount >= 5) {
    container.firstElementChild?.remove();
  }

  const el = document.createElement("div");
  el.className = "toast tuval-notification-toast border-0 rounded overflow-hidden";
  el.setAttribute("role", "alert");
  el.setAttribute("aria-live", "assertive");
  el.setAttribute("aria-atomic", "true");
  el.innerHTML = `
    <div class="toast-header tuval-notification-toast-header border-bottom px-3 py-2">
      <span class="tuval-notification-toast-icon me-2">
        <i class="${iconClass || "fa fa-bell"}"></i>
      </span>
      <div class="min-w-0 flex-grow-1">
        <strong class="d-block fs-sm fw-semibold text-truncate">${scapeHtml(title)}</strong>
        <small class="tuval-notification-toast-time">Ahora</small>
      </div>
      <button type="button" class="btn-close ms-2" data-bs-dismiss="toast" aria-label="Cerrar"></button>
    </div>
    <div class="toast-body px-3 py-3">
      <p class="mb-0 fs-sm tuval-notification-toast-message">${scapeHtml(text)}</p>
    </div>
  `;

  container.appendChild(el);
  const t = new window.bootstrap.Toast(el, { delay, autohide });
  t.show();
  el.addEventListener("hidden.bs.toast", () => el.remove());

  return t;
}

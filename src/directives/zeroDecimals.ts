import type { Directive } from "vue";

type ZDHandlers = {
  normalize: () => void;
  setZeroIfEmpty: () => void;
  blockKeys: (e: KeyboardEvent) => void;
  onPaste: (e: ClipboardEvent) => void;
  onInput: () => void;
};

const zeroDecimals: Directive<HTMLInputElement, void> = {
  mounted(el) {
    const setZeroIfEmpty = () => {
      if (el.value === "" || el.value === null) {
        el.value = "0";
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
      }
    };
    const normalize = () => {
      if (el.value === "" || el.value == null) {
        setZeroIfEmpty();
        return;
      }
      const n = Number(el.value);
      const next = Number.isFinite(n) ? Math.trunc(n) : 0;
      if (next < 0) {
        el.value = "0";
        el.dispatchEvent(new Event("input", { bubbles: true }));
        return;
      }
      if (el.value !== String(next)) {
        el.value = String(next);
        el.dispatchEvent(new Event("input", { bubbles: true }));
      }
    };

    const blockKeys = (e: KeyboardEvent) => {
      const k = e.key;
      // bloquea negativos, exponente y decimales
      if (
        k === "-" ||
        k === "+" ||
        k === "e" ||
        k === "E" ||
        k === "." ||
        k === ","
      ) {
        e.preventDefault();
      }
    };

    const onPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      const raw =
        (e.clipboardData || (window as any).clipboardData)?.getData("text") ||
        "";
      const digits = raw.replace(/[^\d]/g, ""); // solo 0-9
      const start = el.selectionStart ?? el.value.length;
      const end = el.selectionEnd ?? el.value.length;
      el.value = el.value.slice(0, start) + digits + el.value.slice(end);
      el.dispatchEvent(new Event("input", { bubbles: true }));
    };

    const onInput = () => {
      // si aparece '-', quítalo (IME/móvil)
      if (el.value.includes("-")) {
        el.value = el.value.replace(/-/g, "");
        el.dispatchEvent(new Event("input", { bubbles: true }));
      }
    };

    (el as any)._zd = {
      normalize,
      setZeroIfEmpty,
      blockKeys,
      onPaste,
      onInput,
    } as ZDHandlers;

    el.addEventListener("keydown", blockKeys);
    el.addEventListener("paste", onPaste);
    el.addEventListener("input", onInput);
    el.addEventListener("blur", normalize);
    el.addEventListener("change", normalize);
    // inicial: asegura "0" si viene vacío; luego normaliza
    setZeroIfEmpty();
    normalize(); // inicial
  },

  updated(el) {
    const h = (el as any)._zd as ZDHandlers | undefined;
    if (!h) return;
    // Si el modelo vació el input al reabrir el modal, restáuralo a "0".
    // Si no está enfocado, también normaliza (para evitar saltos de caret mientras el usuario escribe).
    if (el.value === "" || el.value == null) {
      h.setZeroIfEmpty();
    } else if (document.activeElement !== el) {
      h.normalize();
    }
  },
  unmounted(el) {
    const h = (el as any)._zd as ZDHandlers | undefined;
    if (!h) return;
    el.removeEventListener("keydown", h.blockKeys);
    el.removeEventListener("paste", h.onPaste);
    el.removeEventListener("input", h.onInput);
    el.removeEventListener("blur", h.normalize);
    el.removeEventListener("change", h.normalize);
    delete (el as any)._zd;
  },
};

export default zeroDecimals;

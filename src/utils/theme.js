const allowedThemes = new Set([
  "",
  "minimal",
  "amethyst",
  "city",
  "flat",
  "modern",
  "smooth",
]);
const allowedThemeClasses = new Set(
  [...allowedThemes]
    .filter(Boolean)
    .map((colorTheme) => `theme-${colorTheme}`)
);

let transitionFrameId = null;

function normalizeColorTheme(colorTheme) {
  return allowedThemes.has(colorTheme) ? colorTheme : "minimal";
}

function removeThemeClasses(root) {
  [...root.classList]
    .filter((className) => allowedThemeClasses.has(className))
    .forEach((className) => root.classList.remove(className));
}

function releaseThemeTransition(root) {
  if (transitionFrameId !== null) {
    window.cancelAnimationFrame(transitionFrameId);
  }

  transitionFrameId = window.requestAnimationFrame(() => {
    transitionFrameId = window.requestAnimationFrame(() => {
      root.classList.remove("theme-switching");
      transitionFrameId = null;
    });
  });
}

export function applyDocumentTheme({ darkMode, colorTheme }) {
  if (typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;
  const normalizedTheme = normalizeColorTheme(colorTheme);
  const isDark = Boolean(darkMode);

  root.classList.add("theme-switching");
  removeThemeClasses(root);
  root.classList.toggle("dark-mode", isDark);

  if (normalizedTheme) {
    root.classList.add(`theme-${normalizedTheme}`);
  }

  root.dataset.colorTheme = normalizedTheme || "default";
  root.style.colorScheme = isDark ? "dark" : "light";

  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", isDark ? "#0f172a" : "#ffffff");

  releaseThemeTransition(root);
}

<script setup>
import { onBeforeUnmount, watchEffect } from "vue";
import { useTemplateStore } from "@/stores/template";
import { applyDocumentTheme } from "@/utils/theme";

const templateStore = useTemplateStore();
const darkModeMediaQuery =
  typeof window !== "undefined" && window.matchMedia
    ? window.matchMedia("(prefers-color-scheme: dark)")
    : null;

function handleSystemThemeChange(event) {
  if (!templateStore.settings.darkModeSystem) return;
  templateStore.darkMode({ mode: event.matches ? "on" : "off" });
}

darkModeMediaQuery?.addEventListener("change", handleSystemThemeChange);

onBeforeUnmount(() => {
  darkModeMediaQuery?.removeEventListener("change", handleSystemThemeChange);
});

watchEffect(() => {
  applyDocumentTheme({
    darkMode: templateStore.settings.darkMode,
    colorTheme: templateStore.settings.colorTheme,
  });
});
</script>
<template>
  <RouterView />
</template>

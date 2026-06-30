<script setup>
import { ref, onMounted } from "vue";
import { useTemplateStore } from "@/stores/template";
import BaseLayout from "@/layouts/BaseLayout.vue";

const templateStore = useTemplateStore();

// Layout Setup
templateStore.setLayout({
  header: true,
  sidebar: true,
  sideOverlay: true,
  footer: true,
});
templateStore.headerStyle({ mode: "light" });
templateStore.mainContent({ mode: "full" });

const toast1 = ref(null);
const titulo = ref(null);
const mensaje = ref(null);

onMounted(() => {
  const toastEl = document.getElementById("toast-example-1");
  if (toastEl) {
    toast1.value = new window.bootstrap.Toast(toastEl);
  }
});
</script>

<template>
  <BaseLayout />
  <div
    class="position-fixed bottom-0 end-0 p-3 space-y-3"
    style="z-index: 9999"
  >
    <div id="toast-example-1" class="toast fade hide" role="alert">
      <div class="toast-header">
        <strong class="me-auto">{{ titulo }}</strong>
        <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
      </div>
      <div class="toast-body" v-html="mensaje"></div>
    </div>
  </div>
</template>

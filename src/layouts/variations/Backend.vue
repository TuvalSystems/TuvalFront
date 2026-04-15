<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useStore } from 'vuex'
import { useTemplateStore } from "@/stores/template";
import { useRoute, useRouter } from "vue-router";
import actions from '@/store'
import BaseLayout from "@/layouts/BaseLayout.vue";
import { swalWarning, } from "@/functions/swal-alert.js";

const route = useRoute();
const router = useRouter();
const templateStore = useTemplateStore();
const store = useStore();



// Layout Setup
templateStore.setLayout({ header: true, sidebar: true, sideOverlay: true, footer: true });
templateStore.headerStyle({ mode: "light" });
templateStore.mainContent({ mode: "full" });



const toast1 = ref(null);
const titulo = ref(null);
const mensaje = ref(null);




// Usamos un computed para que navigation sea reactivo y no undefined
const navigation = computed(() => store.state.menu);
const currentPath = computed(() => route.name);

function checkSecurity() {
  const path = currentPath.value;
  if (path === 'notificaciones' || path === 'Login' || path === actions.state.home) {
    return true;
  }
  const menu = navigation.value;
  if (!menu || !Array.isArray(menu)) return true;

  return isPathInMenu(menu, path);
}

function isPathInMenu(items, targetPath) {
  for (const item of items) {
    // Si el item tiene el destino que buscamos
    if (item.to === targetPath) {
      return true;
    }
    // Si tiene submenú, buscamos dentro (Recursividad)
    if (item.sub && Array.isArray(item.sub)) {
      if (isPathInMenu(item.sub, targetPath)) {
        return true;
      }
    }
  }
  return false;
}


watch([() => route.name, () => store.state.menu], ([newPath, newMenu]) => {

  if (!newMenu || newMenu.length === 0) return;
  const excepciones = ['Login', 'notificaciones', actions.state.home];
  if (excepciones.includes(newPath)) return;

  // Ejecutamos la validación real
  if (!isPathInMenu(newMenu, newPath)) {
    swalWarning('Acceso denegado: No tienes permisos para esta sección.');
    router.push({ name: actions.state.home });
  }
}, { immediate: true });

onMounted(() => {
  const toastEl = document.getElementById("toast-example-1");
  if (toastEl) {
    toast1.value = new window.bootstrap.Toast(toastEl);
  }

  if (route.name !== actions.state.home) {
    if (!checkSecurity()) {
      swalWarning('Su usuario no tiene permisos para esta sección.');
      router.push({ name: actions.state.home });
    }
  }

});


</script>

<template>
  <BaseLayout />
  <div class="position-fixed bottom-0 end-0 p-3 space-y-3" style="z-index: 9999">
    <div id="toast-example-1" class="toast fade hide" role="alert">
      <div class="toast-header">
        <strong class="me-auto">{{ titulo }}</strong>
        <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
      </div>
      <div class="toast-body" v-html="mensaje"></div>
    </div>
  </div>
</template>

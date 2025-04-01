<script setup>
import { ref, onMounted, computed } from "vue";
import { useStore} from 'vuex'
import { useTemplateStore } from "@/stores/template";
import { useRoute, useRouter } from "vue-router";
import actions from '@/store'
import BaseLayout from "@/layouts/BaseLayout.vue";
import { swalSimple, swalInfo, swalSuccess, swalWarning, swalError, toast } from "@/functions/swal-alert.js";

const route = useRoute();
const router = useRouter();

// Main store
const templateStore = useTemplateStore();
const store = useStore();

// Set default elements for this layout
templateStore.setLayout({
  header: true,
  sidebar: true,
  sideOverlay: true,
  footer: true,
});

// Set various template options for this layout variation
templateStore.headerStyle({ mode: "light" });
templateStore.mainContent({ mode: "full" });

const toast1 = ref(null);
const titulo = ref(null);
const mensaje = ref(null);

setInterval(() => {

  store.dispatch('notificaciones').then((res) => {
    if(res.notificacion === true){
      titulo.value = res.titulo;
      mensaje.value = res.mensaje;
      toast1.value.show();
    }
  });
}, "10000")
onMounted(() => {
  toast1.value = new window.bootstrap.Toast(
    document.getElementById("toast-example-1")
  );
});

const navigation = store.state.menu;
const path = computed(() =>route.name).value

if(!seguridad()){
  swalWarning('Su usuario no tiene permisos para esta sección, ha sido redirigido a su sección inicial');
  router.push({
    name: actions.state.home
  })
}
function seguridad(){

  if(path === 'notificaciones'){
    return true;
  }

  let estoy = false;
  navigation.map( padre => {
    padre.sub.map( url => {
      if(url.to === path){
        estoy = true;
      }
    })
  });
  return estoy;
}



</script>

<template>
  <BaseLayout />
  
  <div
    class="position-fixed bottom-0 end-0 p-3 space-y-3"
    style="z-index: 9999"
    >
    <!-- Toast Example 1 -->
    <div
      id="toast-example-1"
      class="toast fade hide"
      data-bs-autohide="false"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      >
      <div class="toast-header">
        <i class="fa fa-message text-primary me-2"></i>
        <strong class="me-auto">{{ titulo }}</strong>
        <small class="text-muted">Ahora</small>
        <button
          type="button"
          class="btn-close"
          data-bs-dismiss="toast"
          aria-label="Close"
        ></button>
      </div>
      <div class="toast-body">
        <p v-html="mensaje"></p>
      </div>
    </div>
    <!-- END Toast Example 1 -->
  </div>
</template>

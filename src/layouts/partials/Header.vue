<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useTemplateStore } from "@/stores/template";
import { useStore } from 'vuex';
import { useNotificationCenter } from "@/composables/notificaciones/useNotificationCenter";

const { unreadCount } = useNotificationCenter();
// Grab example data

const notificaciones = {};
// Main store and Router
const store = useTemplateStore();
const actions = useStore();
const router = useRouter();

const user = actions.state.user.data;
const puntosdeventa = computed(() => actions.state.puntosdeventa);
const bodegas = computed(() => actions.state.bodegas);
const puntodeventaselect = actions.state.puntodeventaselect;
const currentCliente = ref(actions.state.currentCliente);
const currentSucursal = ref(actions.state.currentSucursal);

function selectpuntodeventa(event,) {
  sessionStorage.setItem('CURRENTCLIENTE', null);
  sessionStorage.setItem('CURRENTSUCURSAL', null);
  currentCliente.value = null;
  currentSucursal.value = null;
  sessionStorage.setItem('PTO_ANTERIOR', actions.state.puntodeventaselect);

  sessionStorage.setItem('PUNTODEVENTASELECT', puntosdeventa.value[event.target.value].PTO_VTA_ID);
  actions.state.puntodeventaselect = puntosdeventa.value[event.target.value].PTO_VTA_ID;
  actions.state.bodegas = puntosdeventa.value[event.target.value].bodegas;
  sessionStorage.setItem('BODEGAS', JSON.stringify(puntosdeventa.value[event.target.value].bodegas));

  const url = new URL(window.location.href);
  if (url.searchParams.has('draft')) {
    url.searchParams.delete('draft'); // Borramos el rastro de California
    // Reemplazamos la URL actual sin el draft para que al recargar empiece limpio
    window.history.replaceState({}, '', url.toString());
  }

  location.reload();
}

// Reactive variables
const baseSearchTerm = ref("");

function logout() {
  actions.dispatch('logout')
    .then(() => {
      router.push({
        name: 'Login'
      });
    });

}

// On form search submit functionality
function onSubmitSearch() {
  router.push("/backend/pages/generic/search?" + baseSearchTerm.value);
}

// When ESCAPE key is hit close the header search section
function eventHeaderSearch(event) {
  if (event.which === 27) {
    event.preventDefault();
    store.headerSearch({ mode: "off" });
  }
}

function vernotificaciones() {
  router.push({
    name: 'notificaciones'
  });
}

// Attach ESCAPE key event listener
onMounted(() => {
  document.addEventListener("keydown", eventHeaderSearch);
});

// Remove keydown event listener
onUnmounted(() => {
  document.removeEventListener("keydown", eventHeaderSearch);
});
</script>

<template>
  <header id="page-header">
    <slot>
      <div class="content-header">
        <slot name="content">
          <div class="d-flex align-items-center">
            <slot name="content-left">
              <button type="button" class="btn btn-sm btn-alt-secondary me-2 d-lg-none"
                @click="store.sidebar({ mode: 'toggle' })">
                <i class="fa fa-fw fa-bars"></i>
              </button>

              <button type="button" class="btn btn-sm btn-alt-secondary me-2 d-none d-lg-inline-block"
                @click="store.sidebarMini({ mode: 'toggle' })">
                <i class="fa fa-fw fa-ellipsis-v"></i>
              </button>

              <div class="d-flex align-items-center ms-2">
                <label for="select-punto-venta" class="fs-sm fw-medium me-2 d-none d-sm-inline-block mb-0">
                  <i class="fa fa-store me-1 opacity-50"></i> Punto de venta:
                </label>
                <select class="form-select form-select-sm border-0 bg-body-extra-light fw-semibold" 
                  id="select-punto-venta" 
                  style="width: 200px;"
                  @change="selectpuntodeventa($event)">
                  <option v-for="(punto, index) in puntosdeventa" :key="index" :value="index"
                    :selected="punto.PTO_VTA_ID == puntodeventaselect">
                    {{ punto.PTO_VTA_DESCRIPCION }}
                  </option>
                </select>
              </div>
            </slot>
          </div>

          <div class="d-flex align-items-center">
            <slot name="content-right">
              
              <div class="dropdown d-inline-block ms-2">
                <button type="button" class="btn btn-sm btn-alt-secondary d-flex align-items-center"
                  id="page-header-user-dropdown" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  <img class="rounded-circle" src="/assets/media/avatars/avatar10.jpg" alt="Header Avatar"
                    style="width: 21px" />
                  <span class="d-none d-sm-inline-block ms-2 fs-sm fw-medium">{{ user.USERID }}</span>
                  <i class="fa fa-fw fa-angle-down d-none d-sm-inline-block opacity-50 ms-1 mt-1"></i>
                </button>
                <div class="dropdown-menu dropdown-menu-md dropdown-menu-end p-0 border-0 shadow-sm"
                  aria-labelledby="page-header-user-dropdown">
                  <div class="p-3 text-center bg-body-light border-bottom rounded-top">
                    <img class="img-avatar img-avatar48 img-avatar-thumb" src="/assets/media/avatars/avatar10.jpg"
                      alt="Header Avatar" />
                    <p class="mt-2 mb-0 fw-medium">{{ user.USERNAME }}</p>
                  </div>
                  <div class="p-2">
                    <a @click="logout"
                      class="dropdown-item d-flex align-items-center justify-content-between text-danger cursor-pointer rounded">
                      <span class="fs-sm fw-medium">Cerrar Sesión</span>
                      <i class="fa fa-fw fa-sign-out-alt opacity-50 ms-1"></i>
                    </a>
                  </div>
                </div>
              </div>

              <div class="d-inline-block ms-2">
                <button type="button" class="btn btn-sm btn-alt-secondary position-relative" 
                  @click="vernotificaciones()">
                  <i class="fa fa-fw fa-bell"></i>
                  <span v-if="unreadCount > 0"
                    class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                    style="font-size: 10px; padding: 2px 4px;"> 
                    {{ unreadCount > 9 ? "9+" : unreadCount }}
                  </span>
                </button>
              </div>

            </slot>
          </div>
        </slot>
      </div>

      <div id="page-header-search" class="overlay-header bg-body-extra-light"
        :class="{ show: store.settings.headerSearch }">
        <div class="content-header">
          <form class="w-100" @submit.prevent="onSubmitSearch">
            <div class="input-group">
              <button type="button" class="btn btn-alt-danger" @click="store.headerSearch({ mode: 'off' })">
                <i class="fa fa-fw fa-times-circle"></i>
              </button>
              <input type="text" class="form-control border-0" placeholder="Buscar.." id="page-header-search-input" v-model="baseSearchTerm" />
            </div>
          </form>
        </div>
      </div>

      <div id="page-header-loader" class="overlay-header bg-body-extra-light"
        :class="{ show: store.settings.headerLoader }">
        <div class="content-header">
          <div class="w-100 text-center">
            <i class="fa fa-fw fa-circle-notch fa-spin text-primary"></i>
          </div>
        </div>
      </div>
    </slot>
  </header>
</template>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>
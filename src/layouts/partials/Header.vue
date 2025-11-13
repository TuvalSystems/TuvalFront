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
  sessionStorage.setItem('PUNTODEVENTASELECT', puntosdeventa.value[event.target.value].PTO_VTA_ID);
  actions.state.puntodeventaselect = puntosdeventa.value[event.target.value].PTO_VTA_ID;
  actions.state.bodegas = puntosdeventa.value[event.target.value].bodegas;
  sessionStorage.setItem('BODEGAS', JSON.stringify(puntosdeventa.value[event.target.value].bodegas));
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
  <!-- Header -->
  <header id="page-header">
    <slot>
      <!-- Header Content -->
      <div class="content-header">
        <slot name="content">
          <!-- Left Section -->
          <div class="d-flex align-items-center">
            <slot name="content-left">
              <!-- Toggle Sidebar -->
              <button type="button" class="btn btn-sm btn-alt-secondary me-2 d-lg-none"
                @click="store.sidebar({ mode: 'toggle' })">
                <i class="fa fa-fw fa-bars"></i>
              </button>
              <!-- END Toggle Sidebar -->

              <!-- Toggle Mini Sidebar -->
              <button type="button" class="btn btn-sm btn-alt-secondary me-2 d-none d-lg-inline-block"
                @click="store.sidebarMini({ mode: 'toggle' })">
                <i class="fa fa-fw fa-ellipsis-v"></i>
              </button>
              <!-- END Toggle Mini Sidebar -->

              <div class="row">
                <label for="select-punto-venta" class="col-auto col-form-label text-right d-none d-sm-block">Punto de
                  venta:</label>
                <div class="col-auto">
                  <select class="form-select" id="select-punto-venta" name="select-punto-venta"
                    @change="selectpuntodeventa($event)">
                    <option v-for="(punto, index) in puntosdeventa" :key="index" :value="index"
                      :selected="punto.PTO_VTA_ID == puntodeventaselect">{{ punto.PTO_VTA_DESCRIPCION }}</option>
                  </select>
                </div>
              </div>
            </slot>
          </div>
          <!-- END Left Section -->

          <!-- Right Section -->
          <div class="d-flex align-items-center">
            <slot name="content-right">
              <!-- User Dropdown -->
              <div class="dropdown d-inline-block ms-2">
                <button type="button" class="btn btn-sm btn-alt-secondary d-flex align-items-center"
                  id="page-header-user-dropdown" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  <img class="rounded-circle" src="/assets/media/avatars/avatar10.jpg" alt="Header Avatar"
                    style="width: 21px" />
                  <span class="d-none d-sm-inline-block ms-2">{{ user.USERID }}</span>
                  <i class="fa fa-fw fa-angle-down d-none d-sm-inline-block opacity-50 ms-1 mt-1"></i>
                </button>
                <div class="dropdown-menu dropdown-menu-md dropdown-menu-end p-0 border-0"
                  aria-labelledby="page-header-user-dropdown">
                  <div class="p-3 text-center bg-body-light border-bottom rounded-top">
                    <img class="img-avatar img-avatar48 img-avatar-thumb" src="/assets/media/avatars/avatar10.jpg"
                      alt="Header Avatar" />
                    <p class="mt-2 mb-0 fw-medium">{{ user.USERNAME }}</p>
                  </div>
                  <div role="separator" class="dropdown-divider m-0"></div>
                  <div class="p-2">

                    <a @click="logout"
                      class="dropdown-item d-flex align-items-center justify-content-between cursor-pointer">
                      <span class="fs-sm fw-medium">Salir</span>
                    </a>
                  </div>
                </div>
              </div>
              <!-- END User Dropdown -->

              <!-- Notifications Dropdown -->
              <div class="dropdown d-inline-block ms-2">
                <button type="button" class="btn btn-sm btn-alt-secondary" id="page-header-notifications-dropdown"
                  @click="vernotificaciones()">
                  <i class="fa fa-fw fa-bell"></i>
                  <span v-if="unreadCount > 0"
                    class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                    style="font-size: 0.6rem;"> {{ unreadCount > 9 ? "9+" : unreadCount }}</span>
                </button>
                <div class="dropdown-menu dropdown-menu-lg dropdown-menu-end p-0 border-0 fs-sm"
                  aria-labelledby="page-header-notifications-dropdown">
                  <div class="p-2 bg-body-light border-bottom text-center rounded-top">
                    <h5 class="dropdown-header text-uppercase">
                      Notificaciones
                    </h5>
                  </div>
                  <ul class="nav-items mb-0">
                    <li v-for="(notificacion, index) in notificaciones" :key="`notificacion-${index}`">
                      <a class="text-dark d-flex py-2" :href="`${notificacion.href}`">
                        <div class="flex-shrink-0 me-2 ms-3">
                          <i :class="`${notificacion.icon}`"></i>
                        </div>
                        <div class="flex-grow-1 pe-2">
                          <div class="fw-semibold">
                            {{ notificacion.title }}
                          </div>
                          <span class="fw-medium text-muted">
                            {{ notificacion.time }}
                          </span>
                        </div>
                      </a>
                    </li>
                    <li v-if="!notificaciones.length" class="p-2">
                      <div class="alert alert-light d-flex align-items-center space-x-2 mb-0" role="alert">
                        <i class="fa fa-exclamation-triangle opacity-50"></i>
                        <p class="mb-0">No new ones!</p>
                      </div>
                    </li>
                  </ul>
                  <div v-if="notificaciones.length > 0" class="p-2 border-top text-center">
                    <a class="d-inline-block fw-medium" href="javascript:void(0)">
                      <i class="fa fa-fw fa-arrow-down me-1 opacity-50"></i>
                      Load More..
                    </a>
                  </div>
                </div>
              </div>
              <!-- END Notifications Dropdown -->


            </slot>
          </div>
          <!-- END Right Section -->
        </slot>
      </div>
      <!-- END Header Content -->

      <!-- Header Search -->
      <div id="page-header-search" class="overlay-header bg-body-extra-light"
        :class="{ show: store.settings.headerSearch }">
        <div class="content-header">
          <form class="w-100" @submit.prevent="onSubmitSearch">
            <div class="input-group">
              <button type="button" class="btn btn-alt-danger" @click="store.headerSearch({ mode: 'off' })">
                <i class="fa fa-fw fa-times-circle"></i>
              </button>
              <input type="text" class="form-control" placeholder="Search or hit ESC.." id="page-header-search-input"
                name="page-header-search-input" v-model="baseSearchTerm" />
            </div>
          </form>
        </div>
      </div>
      <!-- END Header Search -->

      <!-- Header Loader -->
      <div id="page-header-loader" class="overlay-header bg-body-extra-light"
        :class="{ show: store.settings.headerLoader }">
        <div class="content-header">
          <div class="w-100 text-center">
            <i class="fa fa-fw fa-circle-notch fa-spin"></i>
          </div>
        </div>
      </div>
      <!-- END Header Loader -->
    </slot>
  </header>
  <!-- END Header -->
</template>
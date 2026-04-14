<script setup>
import { ref, watch, onMounted, onUnmounted } from "vue";
import { useTemplateStore } from "@/stores/template";
import { useStore } from "vuex";
import BaseNavigation from "@/components/BaseNavigation.vue";
import SimpleBar from "simplebar";

const store = useTemplateStore();
const actions = useStore();
const navigation = actions.state.menu;

const radioDarkMode = ref();
let simpleBarInstance = null;

// Sincronización de estado de Dark Mode
function setDarkModeRadioDefault() {
  if (store.settings.darkModeSystem) {
    radioDarkMode.value = "system";
  } else {
    radioDarkMode.value = store.settings.darkMode ? "dark" : "light";
  }
}

function onDarkModeRadioChange() {
  if (radioDarkMode.value === "system") {
    store.darkModeSystem({ mode: "on" });
  } else {
    store.darkModeSystem({ mode: "off" });
    store.darkMode({ mode: radioDarkMode.value === "dark" ? "on" : "off" });
  }
}

setDarkModeRadioDefault();

watch(() => [store.settings.darkModeSystem, store.settings.darkMode], () => {
  setDarkModeRadioDefault();
});

onMounted(() => {
  // Verificación de seguridad para evitar el error de SimpleBar
  const container = document.getElementById("simplebar-sidebar");
  if (container) {
    simpleBarInstance = new SimpleBar(container);
  }
});

onUnmounted(() => {
  if (simpleBarInstance) {
    simpleBarInstance.unMount();
  }
});
</script>

<template>
  <nav id="sidebar" aria-label="Main Navigation">
    <slot>
      <div class="content-header">
        <slot name="header">
          <RouterLink :to="{ name: 'Login' }" class="fw-semibold text-dual">
            <span class="smini-visible text-center w-20 py-3 mt-5">
              <i class="fa fa-store text-primary fs-3"></i>
            </span>
            <span class="smini-hide fs-5 tracking-wider">
              <img src="/assets/images/tuval-logo.jpg" class="img-fluid" style="max-height: 200px;" alt="Logo" />
            </span>
          </RouterLink>
        </slot>

        <div class="d-flex align-items-center">
          <slot name="header-extra">
            <div class="dropdown d-inline-block ms-1">
              <button type="button" class="btn btn-sm btn-alt-secondary" id="sidebar-dark-mode-dropdown"
                data-bs-toggle="dropdown" data-bs-auto-close="outside">
                <i :class="store.settings.darkMode ? 'fa fa-moon' : 'far fa-moon'"></i>
              </button>
              <div class="dropdown-menu dropdown-menu-end fs-sm smini-hide border-0 shadow-sm" style="min-width: 8rem">
                <div class="px-3 py-2 space-y-2 text-dark">
                  <div class="form-check">
                    <input class="form-check-input" type="radio" id="rd-light" value="light" v-model="radioDarkMode" @change="onDarkModeRadioChange" />
                    <label class="form-check-label fw-medium" for="rd-light">Claro</label>
                  </div>
                  <div class="form-check">
                    <input class="form-check-input" type="radio" id="rd-dark" value="dark" v-model="radioDarkMode" @change="onDarkModeRadioChange" />
                    <label class="form-check-label fw-medium" for="rd-dark">Oscuro</label>
                  </div>
                  <div class="form-check mb-0">
                    <input class="form-check-input" type="radio" id="rd-system" value="system" v-model="radioDarkMode" @change="onDarkModeRadioChange" />
                    <label class="form-check-label fw-medium" for="rd-system">Sistema</label>
                  </div>
                </div>
              </div>
            </div>

            <div class="dropdown d-inline-block ms-1">
              <button type="button" class="btn btn-sm btn-alt-secondary" id="sidebar-themes-dropdown"
                data-bs-toggle="dropdown" data-bs-auto-close="outside">
                <i class="fa fa-paint-brush"></i>
              </button>
              <div class="dropdown-menu dropdown-menu-end fs-sm smini-hide border-0 shadow-sm" aria-labelledby="sidebar-themes-dropdown">
                <h6 class="dropdown-header border-bottom">Paleta de Colores</h6>
                <button type="button" class="dropdown-item d-flex align-items-center justify-content-between fw-medium" @click="store.setColorTheme({ theme: '' })">
                  <span>Por defecto</span> <i class="fa fa-circle text-default"></i>
                </button>
                <button type="button" class="dropdown-item d-flex align-items-center justify-content-between fw-medium" @click="store.setColorTheme({ theme: 'city' })">
                  <span>Ciudad</span> <i class="fa fa-circle text-city"></i>
                </button>
                <button type="button" class="dropdown-item d-flex align-items-center justify-content-between fw-medium" @click="store.setColorTheme({ theme: 'modern' })">
                  <span>Moderno</span> <i class="fa fa-circle text-modern"></i>
                </button>
                <button type="button" class="dropdown-item d-flex align-items-center justify-content-between fw-medium" @click="store.setColorTheme({ theme: 'smooth' })">
                  <span>Suave</span> <i class="fa fa-circle text-smooth"></i>
                </button>

                <div v-if="!store.settings.darkMode">
                  <div class="dropdown-divider"></div>
                  <h6 class="dropdown-header">Fondo Lateral</h6>
                  <div class="row g-2 px-3 pb-2">
                    <div class="col-6">
                      <button type="button" class="btn btn-sm btn-alt-primary w-100" @click="store.sidebarStyle({ mode: 'light' })">Claro</button>
                    </div>
                    <div class="col-6">
                      <button type="button" class="btn btn-sm btn-dark w-100" @click="store.sidebarStyle({ mode: 'dark' })">Oscuro</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </slot>

          <button type="button" class="d-lg-none btn btn-sm btn-alt-secondary ms-1" @click="store.sidebar({ mode: 'close' })">
            <i class="fa fa-fw fa-times"></i>
          </button>
        </div>
      </div>

      <div id="simplebar-sidebar" class="js-sidebar-scroll">
        <slot name="content">
          <div class="content-side">
            <BaseNavigation :nodes="navigation" />
          </div>
        </slot>
      </div>
    </slot>
  </nav>
</template>

<style scoped>
/* Evitar que el dropdown se vea cortado en el sidebar */
.dropdown-menu {
  margin-top: 10px !important;
}
</style>
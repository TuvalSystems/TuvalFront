<script setup>
import { computed, onBeforeUnmount, reactive, ref, watchEffect } from "vue";
import { useRouter } from "vue-router";
import axios from "../../axios";
import actions from "@/store";
import { useTemplateStore } from "@/stores/template";
import useVuelidate from "@vuelidate/core";
import { minLength, required } from "@vuelidate/validators";
import { swalSuccess } from "@/functions/swal-alert.js";

const router = useRouter();
const templateStore = useTemplateStore();
const form = reactive({
  password: "",
});

const errors = reactive({});
const errorMsg = ref("");
const loading = ref(false);
const showPassword = ref(false);
const rules = {
  password: { required, minLength: minLength(8) },
};

const v$ = useVuelidate(rules, form);
const darkModeMediaQuery =
  typeof window !== "undefined" && window.matchMedia
    ? window.matchMedia("(prefers-color-scheme: dark)")
    : null;

const syncDarkModeWithSystem = (matches) => {
  if (!templateStore.settings.darkModeSystem) {
    return;
  }

  templateStore.darkMode({ mode: matches ? "on" : "off" });
};

templateStore.setColorTheme({
  theme: templateStore.settings.colorTheme,
});

if (darkModeMediaQuery) {
  syncDarkModeWithSystem(darkModeMediaQuery.matches);
}

const handleSystemThemeChange = (event) => {
  syncDarkModeWithSystem(event.matches);
};

darkModeMediaQuery?.addEventListener("change", handleSystemThemeChange);

onBeforeUnmount(() => {
  darkModeMediaQuery?.removeEventListener("change", handleSystemThemeChange);
});

watchEffect(() => {
  if (typeof document === "undefined") {
    return;
  }

  document.body.classList.toggle("dark-mode", templateStore.settings.darkMode);
  document.documentElement.dataset.bsTheme = templateStore.settings.darkMode
    ? "dark"
    : "light";
  document.documentElement.dataset.colorTheme =
    templateStore.settings.colorTheme || "default";
});

const hasPasswordError = computed(() => {
  return v$.value.password.$error || Boolean(errors.password?.length);
});

const passwordFeedback = computed(() => {
  if (errors.password?.length) {
    return errors.password[0];
  }

  if (!v$.value.password.$error) {
    return "";
  }

  if (v$.value.password.$errors.some((error) => error.$validator === "required")) {
    return "La contraseña es requerida.";
  }

  if (v$.value.password.$errors.some((error) => error.$validator === "minLength")) {
    return "Mínimo 8 caracteres.";
  }

  return "Contraseña inválida.";
});

const resetErrors = () => {
  Object.keys(errors).forEach((key) => delete errors[key]);
  errorMsg.value = "";
};

const submit = async () => {
  resetErrors();

  const isValid = await v$.value.$validate();
  if (!isValid) {
    return;
  }

  loading.value = true;

  try {
    const response = await axios.post("usuario/change-password", form);

    actions.commit(
      "setMustChangePassword",
      response.data?.data?.must_change_password
    );
    await swalSuccess(response.data.message);
    router.push({ name: actions.state.home });
  } catch (error) {
    if (error.response?.status === 422) {
      Object.assign(errors, error.response.data.errors ?? {});
      return;
    }

    errorMsg.value =
      error.response?.data?.error ??
      error.response?.data?.message ??
      "Error al cambiar la contraseña";
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <main class="password-change-page d-flex align-items-center">
    <div class="content content-full">
      <div class="row justify-content-center">
        <div class="col-sm-10 col-md-8 col-lg-5 col-xl-4">
          <BaseBlock
            title="Actualización de Contraseña"
            class="mb-0"
            bordered
            content-full
          >
            <template #options>
              <span class="password-change-icon" aria-hidden="true">
                <i class="fa-solid fa-key"></i>
              </span>
            </template>

            <p class="password-change-copy fw-medium mb-4">
              Para poder acceder al sistema debes actualizar tu contraseña.
            </p>

            <div
              v-if="errorMsg"
              class="alert alert-danger d-flex align-items-start gap-2 mb-4"
              role="alert"
            >
              <i class="fa-solid fa-circle-exclamation mt-1"></i>
              <span>{{ errorMsg }}</span>
            </div>

            <form novalidate @submit.prevent="submit">
              <div class="mb-4">
                <label class="form-label" for="password-change-input">
                  Nueva contraseña
                </label>
                <div class="input-group has-validation">
                  <input
                    id="password-change-input"
                    v-model="form.password"
                    :type="showPassword ? 'text' : 'password'"
                    class="form-control form-control-lg form-control-alt"
                    placeholder="Nueva contraseña"
                    autocomplete="new-password"
                    :class="{ 'is-invalid': hasPasswordError }"
                    :disabled="loading"
                    @blur="v$.password.$touch()"
                    @input="resetErrors"
                  />

                  <button
                    type="button"
                    class="btn btn-alt-secondary password-toggle"
                    :aria-label="
                      showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                    "
                    :title="
                      showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                    "
                    :disabled="loading"
                    @click="showPassword = !showPassword"
                  >
                    <i
                      :class="
                        showPassword ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash'
                      "
                    ></i>
                  </button>

                  <div
                    v-if="passwordFeedback"
                    class="invalid-feedback password-feedback animated fadeIn"
                  >
                    {{ passwordFeedback }}
                  </div>
                </div>
              </div>

              <button
                class="btn btn-alt-primary password-submit w-100 d-inline-flex align-items-center justify-content-center"
                type="submit"
                :disabled="loading"
              >
                <span
                  v-if="loading"
                  class="spinner-border spinner-border-sm"
                  aria-hidden="true"
                ></span>
                <i v-else class="fa-solid fa-lock opacity-50"></i>
                <span>{{ loading ? "Guardando..." : "Cambiar contraseña" }}</span>
              </button>
            </form>
          </BaseBlock>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.password-change-page {
  min-height: 100vh;
  color: var(--bs-body-color);
  background: var(--bs-body-bg);
}

.password-change-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  color: var(--tuval-primary-strong);
  background: var(--tuval-primary-soft);
  border-radius: var(--tuval-radius-sm);
}

.password-change-copy {
  color: var(--tuval-text-muted);
  line-height: 1.5;
}

.password-toggle {
  min-width: 3.25rem;
  color: var(--tuval-text);
}

.password-submit {
  min-height: 3rem;
  gap: 0.5rem;
}

.password-feedback {
  flex-basis: 100%;
  margin-top: 0.5rem;
}

@media (max-width: 575.98px) {
  .password-change-page {
    padding-inline: 1rem;
  }
}
</style>

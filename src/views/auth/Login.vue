<template>
  <main class="login-page">
    <section class="login-shell" aria-label="Acceso TUVAL">
      <section class="login-panel" aria-labelledby="login-title">
        <div class="login-panel-header">
          <img class="login-logo" src="/assets/images/tuval-logo.jpg" alt="TUVAL" />
          <h2 id="login-title">Iniciar sesión</h2>
          <p>Ingresa tus credenciales para continuar.</p>
        </div>

        <div v-if="errorMsg" class="login-alert" role="alert">
          <i class="fa fa-fw fa-exclamation-triangle"></i>
          <span>{{ errorMsg }}</span>
        </div>

        <form class="login-form" @submit.prevent="login" novalidate>
          <div class="login-control">
            <label for="login-username">Usuario</label>
            <div class="login-field" :class="{ 'is-invalid': v$.username.$error }">
              <i class="fa fa-user"></i>
              <input
                id="login-username"
                v-model.trim="state.username"
                type="text"
                name="login-username"
                placeholder="Ingrese su usuario"
                autocomplete="username"
                :disabled="isLoading"
                @blur="v$.username.$touch"
                @input="clearError"
              />
            </div>
            <div v-if="v$.username.$error" class="login-feedback">
              {{ getUsernameError }}
            </div>
          </div>

          <div class="login-control">
            <label for="login-password">Contraseña</label>
            <div class="login-field" :class="{ 'is-invalid': v$.password.$error }">
              <i class="fa fa-lock"></i>
              <input
                id="login-password"
                v-model="state.password"
                :type="showPassword ? 'text' : 'password'"
                name="login-password"
                placeholder="Ingrese su contraseña"
                autocomplete="current-password"
                :disabled="isLoading"
                @blur="v$.password.$touch"
                @input="clearError"
              />
              <button
                type="button"
                class="password-toggle"
                :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                :disabled="isLoading"
                @click="showPassword = !showPassword"
              >
                <i :class="showPassword ? 'fa fa-eye-slash' : 'fa fa-eye'"></i>
              </button>
            </div>
            <div v-if="v$.password.$error" class="login-feedback">
              Por favor ingrese su contraseña
            </div>
          </div>

          <button type="submit" class="btn login-btn" :disabled="isLoading">
            <template v-if="isLoading">
              <span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
              Validando acceso...
            </template>

            <template v-else>
              <i class="fa fa-fw fa-sign-in-alt"></i>
              Ingresar
            </template>
          </button>
        </form>

        <p class="login-footer">
          <strong>{{ store.app.name + " " + store.app.version }}</strong>
          <span>&copy; {{ store.app.copyright }}</span>
        </p>
      </section>
    </section>
  </main>
</template>

<script setup>
import { reactive, computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useTemplateStore } from "@/stores/template";
import actions from "@/store";

import useVuelidate from "@vuelidate/core";
import { required, minLength } from "@vuelidate/validators";

const store = useTemplateStore();
const router = useRouter();

const isLoading = ref(false);
const errorMsg = ref("");
const showPassword = ref(false);

const state = reactive({
  username: "",
  password: "",
});

const rules = computed(() => ({
  username: {
    required,
    minLength: minLength(3),
  },
  password: {
    required,
  },
}));

const v$ = useVuelidate(rules, state);

const getUsernameError = computed(() => {
  if (!v$.value.username.$errors.length) {
    return "";
  }

  const error = v$.value.username.$errors[0];

  if (error.$validator === "required") {
    return "Por favor ingrese su nombre de usuario";
  }

  if (error.$validator === "minLength") {
    return "El usuario debe tener al menos 3 caracteres";
  }

  return "Usuario inválido";
});

function clearError() {
  if (errorMsg.value) {
    errorMsg.value = "";
  }
}

function debeCambiarPassword(value) {
  return value === true || value === 1 || value === "1" || value === "true";
}

async function login() {
  errorMsg.value = "";

  const isValid = await v$.value.$validate();

  if (!isValid) {
    return;
  }

  if (isLoading.value) {
    return;
  }

  isLoading.value = true;

  try {
    await actions.dispatch("login", {
      username: state.username,
      password: state.password,
    });

    const mustChangePassword = debeCambiarPassword(
      actions.state.must_change_password
    );

    if (mustChangePassword) {
      router.push({ name: "password-change" });
      return;
    }

    router.push({ name: actions.state.home });
  } catch (error) {
    errorMsg.value =
      error.response?.data?.error ||
      error.response?.data?.message ||
      "Error al iniciar sesión";
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: grid;
  align-items: center;
  padding: clamp(1rem, 3vw, 2rem);
  color: var(--login-text);
  background-color: var(--login-bg);
  background-image:
    linear-gradient(rgba(15, 23, 42, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(15, 23, 42, 0.04) 1px, transparent 1px);
  background-size: 32px 32px;
  --login-bg: #f6f7f9;
  --login-surface: #ffffff;
  --login-surface-muted: #f8fafc;
  --login-border: #e2e8f0;
  --login-border-strong: #cbd5e1;
  --login-text: #0f172a;
  --login-muted: #64748b;
  --login-primary: #2563eb;
  --login-action: #c2410c;
  --login-action-hover: #9a3412;
  --login-danger: #dc2626;
  --login-focus: 0 0 0 0.16rem rgba(37, 99, 235, 0.18);
}

.login-shell {
  width: min(100%, 460px);
  margin: 0 auto;
  overflow: hidden;
  background: var(--login-surface);
  border: 1px solid var(--login-border);
  border-radius: 8px;
  box-shadow: 0 1rem 2.5rem rgba(15, 23, 42, 0.1);
}

.login-logo {
  display: block;
  width: 148px;
  max-width: 70%;
  height: auto;
  margin: 0 auto 1.75rem;
  object-fit: contain;
}

.login-panel-header h2 {
  margin: 0;
  color: inherit;
  font-weight: 700;
  letter-spacing: 0;
}

.login-panel-header p,
.login-footer {
  color: var(--login-muted);
}

.login-panel {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: clamp(2rem, 5vw, 3.5rem);
}

.login-panel-header {
  margin-bottom: 2rem;
  text-align: center;
}

.login-panel-header h2 {
  font-size: clamp(1.75rem, 4vw, 2.25rem);
  line-height: 1.1;
}

.login-panel-header p {
  margin: 0.75rem 0 0;
}

.login-alert {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  padding: 0.875rem 1rem;
  margin-bottom: 1.25rem;
  color: #991b1b;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  font-size: 0.925rem;
}

.login-alert i {
  margin-top: 0.125rem;
}

.login-form {
  display: grid;
  gap: 1.125rem;
}

.login-control label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--login-text);
  font-size: 0.875rem;
  font-weight: 700;
}

.login-field {
  display: grid;
  grid-template-columns: 2.75rem minmax(0, 1fr) auto;
  align-items: center;
  min-height: 48px;
  background: var(--login-surface-muted);
  border: 1px solid var(--login-border);
  border-radius: 8px;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease;
}

.login-field:focus-within {
  background: var(--login-surface);
  border-color: var(--login-primary);
  box-shadow: var(--login-focus);
}

.login-field.is-invalid {
  border-color: var(--login-danger);
}

.login-field > i {
  color: var(--login-muted);
  text-align: center;
}

.login-field input {
  width: 100%;
  min-width: 0;
  height: 46px;
  padding: 0;
  color: var(--login-text);
  background: transparent;
  border: 0;
  outline: 0;
}

.login-field input::placeholder {
  color: var(--login-muted);
}

.login-field input:disabled,
.password-toggle:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

.password-toggle {
  display: grid;
  width: 42px;
  height: 46px;
  padding: 0;
  color: var(--login-muted);
  background: transparent;
  border: 0;
  place-items: center;
}

.password-toggle:hover,
.password-toggle:focus {
  color: var(--login-text);
  outline: 0;
}

.login-feedback {
  margin-top: 0.45rem;
  color: var(--login-danger);
  font-size: 0.8125rem;
  font-weight: 600;
}

.login-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  gap: 0.625rem;
  margin-top: 0.25rem;
  color: #ffffff;
  background-color: var(--login-action);
  border-color: var(--login-action);
  border-radius: 8px;
  font-weight: 700;
  box-shadow: none;
}

.login-btn:hover,
.login-btn:focus {
  color: #ffffff;
  background-color: var(--login-action-hover);
  border-color: var(--login-action-hover);
}

.login-btn:focus {
  box-shadow: 0 0 0 0.16rem rgba(194, 65, 12, 0.2);
}

.login-btn:disabled {
  color: #ffffff;
  background-color: var(--login-action);
  border-color: var(--login-action);
  cursor: not-allowed;
  opacity: 0.75;
}

.login-footer {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  justify-content: center;
  margin: 2rem 0 0;
  font-size: 0.8125rem;
}

@media (max-width: 480px) {
  .login-page {
    align-items: stretch;
    padding: 0;
    background-image: none;
  }

  .login-shell {
    min-height: 100vh;
    border: 0;
    border-radius: 0;
  }

  .login-panel {
    justify-content: center;
    padding: 1.5rem;
  }
}
</style>

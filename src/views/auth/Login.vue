<template>
  <div class="login-page hero-static d-flex align-items-center">
    <div class="content">
      <div class="row justify-content-center">
        <div class="col-sm-10 col-md-7 col-lg-5 col-xl-4">
          <div class="login-card">
            <BaseBlock class="mb-0 overflow-hidden border-0 shadow-lg rounded-4">
              <div class="p-4 p-sm-5">

                <!-- Logo / Header -->
                <div class="text-center mb-4">
                  <!-- <div class="login-logo mx-auto mb-3">
                    <span>T</span>
                  </div> -->

                  <h1 class="h3 fw-bold mb-1">TUVAL</h1>
                  <p class="text-muted mb-0">
                    Ingresa tus credenciales para continuar
                  </p>
                </div>

                <!-- Error -->
                <div v-if="errorMsg" class="alert alert-danger d-flex align-items-center rounded-3" role="alert">
                  <i class="fa fa-fw fa-exclamation-triangle me-2"></i>
                  <span>{{ errorMsg }}</span>
                </div>

                <!-- Formulario -->
                <form @submit.prevent="login">
                  <div class="mb-4">
                    <label class="form-label fw-semibold" for="login-username">
                      Usuario
                    </label>

                    <div class="input-group input-group-lg">
                      <span class="input-group-text bg-body border-end-0">
                        <i class="fa fa-user text-muted"></i>
                      </span>

                      <input type="text" class="form-control border-start-0 ps-0" id="login-username"
                        name="login-username" placeholder=" Ingrese su usuario" autocomplete="username"
                        v-model.trim="state.username" :disabled="isLoading"
                        :class="{ 'is-invalid': v$.username.$error }" @blur="v$.username.$touch" @input="clearError" />

                      <div v-if="v$.username.$error" class="invalid-feedback animated fadeIn">
                        {{ getUsernameError }}
                      </div>
                    </div>
                  </div>

                  <div class="mb-4">
                    <label class="form-label fw-semibold" for="login-password">
                      Contraseña
                    </label>

                    <div class="input-group input-group-lg">
                      <span class="input-group-text bg-body border-end-0">
                        <i class="fa fa-lock text-muted"></i>
                      </span>

                      <input type="password" class="form-control border-start-0 ps-0" id="login-password"
                        name="login-password" placeholder=" Ingrese su contraseña" autocomplete="current-password"
                        v-model="state.password" :disabled="isLoading" :class="{ 'is-invalid': v$.password.$error }"
                        @blur="v$.password.$touch" @input="clearError" />

                      <div v-if="v$.password.$error" class="invalid-feedback animated fadeIn">
                        Por favor ingrese su contraseña
                      </div>
                    </div>
                  </div>

                  <button type="submit"  class="btn btn-lg w-100 login-btn" :disabled="isLoading">
                    <template v-if="isLoading">
                      <span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                      Validando acceso...
                    </template>

                    <template v-else>
                      <i class="fa fa-fw fa-sign-in-alt me-2"></i>
                      Ingresar
                    </template>
                  </button>
                </form>
              </div>
            </BaseBlock>
          </div>

          <div class="fs-sm text-muted text-center mt-4">
            <strong>{{ store.app.name + " " + store.app.version }}</strong> &copy;
            {{ store.app.copyright }}
          </div>
        </div>
      </div>
    </div>
  </div>
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
  background:
    radial-gradient(circle at top left, rgba(13, 110, 253, 0.16), transparent 35%),
    radial-gradient(circle at bottom right, rgba(32, 201, 151, 0.12), transparent 35%),
    linear-gradient(135deg, #f6f8fb 0%, #eef2f7 100%);
}

.login-card {
  animation: fadeInUp 0.35s ease-out;
}

.login-logo {
  width: 72px;
  height: 72px;
  border-radius: 22px;
  background: linear-gradient(135deg, #0d6efd, #0b5ed7);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 34px;
  font-weight: 800;
  box-shadow: 0 12px 30px rgba(13, 110, 253, 0.3);
}

.login-btn {
  border-radius: 12px;
  font-weight: 600;
  padding-top: 0.85rem;
  padding-bottom: 0.85rem;
  background-color: #EA580C;
  border-color: #EA580C;
  color: #fff;
  box-shadow: 0 10px 24px rgba(234, 88, 12, 0.25);
}

.login-btn:hover {
  background-color: #C2410C;
  border-color: #C2410C;
  color: #fff;
}

.login-btn:disabled {
  background-color: #EA580C;
  border-color: #EA580C;
  color: #fff;
  opacity: 0.75;
  cursor: not-allowed;
}

.input-group-text {
  border-radius: 12px 0 0 12px;
}

.form-control {
  border-radius: 0 12px 12px 0;
}

.form-control:focus {
  box-shadow: none;
  border-color: #86b7fe;
}

.input-group:focus-within .input-group-text {
  border-color: #86b7fe;
}

.alert {
  font-size: 0.925rem;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(14px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
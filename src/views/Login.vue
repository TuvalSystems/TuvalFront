<template>
  <!-- Page Content -->
  <div class="hero-static d-flex align-items-center">
    <div class="content">
      <div class="row justify-content-center push">
        <div class="col-md-8 col-lg-6 col-xl-4">
          <!-- Sign In Block -->
          <BaseBlock title="Acceso" class="mb-0">
            <template #options>
              
            </template>

            <div class="p-sm-3 px-lg-4 px-xxl-5 py-lg-5">
              <h1 class="h2 mb-1">TUVAL</h1>
              <p class="fw-medium text-muted">Bienvenido</p>
              <p v-if="errorMsg" class="alert alert-danger">{{errorMsg}}</p>
              <!-- Sign In Form -->
              <form @submit.prevent="login">
                <div class="py-3">
                  <div class="mb-4">
                    <input
                      type="text"
                      class="form-control form-control-alt form-control-lg"
                      id="login-username"
                      name="login-username"
                      placeholder="Usuario"
                      :class="{
                        'is-invalid': v$.username.$errors.length,
                      }"
                      v-model="state.username"
                      @blur="v$.username.$touch"
                    />
                    <div
                      v-if="v$.username.$errors.length"
                      class="invalid-feedback animated fadeIn"
                    >
                      Por favor ingrese su nombre de usuario
                    </div>
                  </div>
                  <div class="mb-4">
                    <input
                      type="password"
                      class="form-control form-control-alt form-control-lg"
                      id="login-password"
                      name="login-password"
                      placeholder="Password"
                      :class="{
                        'is-invalid': v$.password.$errors.length,
                      }"
                      v-model="state.password"
                      @blur="v$.password.$touch"
                      @keyup.enter="login"
                    />
                    <div
                      v-if="v$.password.$errors.length"
                      class="invalid-feedback animated fadeIn"
                    >
                      Por favor ingrese su password
                    </div>
                  </div>
                  
                </div>
                <div class="row mb-4">
                  <div ref="boton" class="col-md-6 col-xl-5">
                    <button type="submit" class="btn w-100 btn-alt-primary">
                      <i class="fa fa-fw fa-sign-in-alt me-1 opacity-50"></i>
                      Ingresar
                    </button>
                  </div>
                </div>
                <div ref="cargando" class="text-center hide">
                  <div class="spinner-border text-primary mt-4" role="status"><span class="visually-hidden">Loading...</span></div>
                </div>
              </form>
              <!-- END Sign In Form -->
            </div>
          </BaseBlock>
          <!-- END Sign In Block -->
        </div>
      </div>
      <div class="fs-sm text-muted text-center">
        <strong>{{ store.app.name + " " + store.app.version }}</strong> &copy;
        {{ store.app.copyright }}
      </div>
    </div>
  </div>
  <!-- END Page Content -->
</template>
<script setup>

import { reactive, computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useTemplateStore } from '@/stores/template'
import actions from '@/store'

// Vuelidate, for more info and examples you can check out https://github.com/vuelidate/vuelidate
import useVuelidate from "@vuelidate/core";
import { required, minLength } from "@vuelidate/validators";

// Main store and Router
const store = useTemplateStore();
const router = useRouter();

const cargando = ref('cargando');
const boton = ref('boton');

// Input state variables
const state = reactive({
  username: null,
  password: null,
});

// Validation rules
const rules = computed(() => {
  return {
    username: {
      required,
      minLength: minLength(3),
    },
    password: {
      required
    },
  };
});

// Use vuelidate
const v$ = useVuelidate(rules, state);


let errorMsg = ref('');

async function login() {

  const result = await v$.value.$validate();

  if (!result) {
    // notify user form is invalid
    return;
  }
  cargando.value.classList.remove('hide');

  boton.value.classList.add('hide');
  actions.dispatch('login', state)
    .then((res) => {
      boton.value.classList.remove('hide');
      cargando.value.classList.add('hide');
      router.push({
        name: actions.state.home
      })
    })
    .catch(err => {
      boton.value.classList.remove('hide');
      cargando.value.classList.add('hide');
      errorMsg.value = err.response.data.error
    });
}

</script>
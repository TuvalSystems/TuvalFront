<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import axios from '../../axios';
import actions from '@/store'
import useVuelidate from "@vuelidate/core";
import { required, minLength } from "@vuelidate/validators";
import { swalSuccess, } from "@/functions/swal-alert.js";

const router = useRouter();
const form = reactive({
    password: '',
});

const errors = reactive({});
let errorMsg = ref('');
const cargando = ref('cargando');
const loading = ref(false);
const showPassword = ref(false);
const rules = {
    password: { required, minLength: minLength(8) },
}

const v$ = useVuelidate(rules, form)
const submit = async () => {
    loading.value = true;
    try {
        const response = await axios.post('usuario/change-password', form);

        actions.commit("setMustChangePassword", response.data.data.must_change_password);
        await swalSuccess(response.data.message);
        setTimeout(() => {
            loading.value = true;
            router.push({ name: actions.state.home });
        }, 1500);
        loading.value = false;
    } catch (error) {
        if (error.response?.status === 422) {
            Object.keys(errors).forEach(key => delete errors[key]);
            Object.assign(errors, error.response.data.errors);

        } else {
            errorMsg.value = error.response?.data?.errors ?? 'Error al cambiar la contraseña';
        }
    } finally {
        loading.value = false;
    }
};
</script>
<template>
    <div class="hero-static d-flex align-items-center">
        <div class="content">
            <div class="row justify-content-center push">
                <div class="col-md-8 col-lg-6 col-xl-4">
                    <BaseBlock title="Actualización de Contraseña" class="mb-0">
                        <template #options>
                        </template>
                        <div class="p-sm-3 px-lg-4 px-xxl-5 py-lg-5">
                            <p class="fw-medium text-muted">Para poder acceder al sistema debes actualizar tu contraseña
                            </p>
                            <p v-if="errors.password" class="alert alert-danger">{{ errors.password ? errors.password[0]
                                : '' }}</p>
                            <!-- form de cambio de contraseña -->
                            <form @submit.prevent="submit">
                                <div class="py-3">
                                    <div class="mb-4">
                                        <div class="input-group has-validation">
                                            <input :type="showPassword ? 'text' : 'password'"
                                                class="form-control form-control-lg form-control-alt pe-5"
                                                v-model="form.password" placeholder="Nueva Contraseña"
                                                :class="{ 'is-invalid': v$.password.$error }"
                                                @blur="v$.password.$touch" />

                                            <button type="button" @click="showPassword = !showPassword"
                                                class="btn btn-outline-secondary" tabindex="-1"
                                                aria-label="Mostrar/Ocultar contraseña">
                                                <i
                                                    :class="showPassword ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash'"></i>
                                            </button>
                                            <div v-if="v$.password.$error"
                                                class="invalid-feedback animated fadeIn mt-1">
                                                <span
                                                    v-if="v$.password.$errors.find(e => e.$validator === 'required')">La
                                                    contraseña es
                                                    requerida.</span>
                                                <span
                                                    v-if="v$.password.$errors.find(e => e.$validator === 'minLength')">Mínimo
                                                    8
                                                    caracteres.</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="row justify-content-center mb-4">
                                    <div class="col-sm-12 ">
                                        <button class="btn w-100 btn-alt-primary" type="submit" :disabled="loading">
                                            <i class="fa-solid fa-lock me-1 opacity-50"></i> {{ loading ? 'Guardando...'
                                                :
                                                'Cambiar contraseña'
                                            }}</button>
                                    </div>
                                </div>
                                <div ref="cargando" class="text-center hide">
                                    <div class="spinner-border text-primary mt-4"><span
                                            class="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </BaseBlock>
                </div>
            </div>
        </div>
    </div>
</template>

<style>
/* Asegurar que los mensajes de error no afecten el diseño */
.invalid-feedback {
    position: absolute;
    width: 100%;
}

/* Espaciado consistente */
.mb-4 {
    margin-bottom: 1.5rem !important;
    position: relative;
}

/* Estilo para el botón del ojo */
.btn-outline-secondary {
    border-color: #ced4da;
    background-color: white;

}

.btn-outline-secondary:hover {
    background-color: #57585a;
}
</style>

<script setup>
import { onMounted, computed, watch, nextTick } from 'vue';
import { useDireccionProcess } from "@/composables/venta/cotizaciones/crearCotizacion/useDireccionProcess";
import {
    swalError,
    swalSuccess,
    swalWarning
} from "@/functions/swal-alert";

import useVuelidate from "@vuelidate/core";
import {
    required,
    maxLength,
    email,
    helpers,
} from "@vuelidate/validators";

const emit = defineEmits(['closeModal']);

const props = defineProps({
    cliente: {
        type: Object,
        default: null,
    },
});

const {
    loading,
    form,
    createNewAddress,

    loadingTerritories,
    fetchAllTerritories,
    allTerritories,

    loadingProvincies,
    fetchAllProvincies,
    allProvincies,

    loadingCities,
    fetchAllCities,
    allCities,

    resetModalForm,
} = useDireccionProcess();

const infoClient = computed(() => props.cliente);

/*
 * Reglas de validación adaptadas a la estructura nueva del formulario.
 */
const rules = computed(() => ({
    direccion: {
        required: helpers.withMessage(
            'La dirección es obligatoria.',
            required
        ),
        maxLength: helpers.withMessage(
            'La dirección no puede superar los 122 caracteres.',
            maxLength(122)
        ),
    },

    contacto: {
        required: helpers.withMessage(
            'El contacto es obligatorio.',
            required
        ),
        maxLength: helpers.withMessage(
            'El contacto no puede superar los 61 caracteres.',
            maxLength(61)
        ),
    },

    referencia: {
        required: helpers.withMessage(
            'La referencia es obligatoria.',
            required
        ),
        maxLength: helpers.withMessage(
            'La referencia no puede superar los 100 caracteres.',
            maxLength(100)
        ),
    },

    territorio: {
        required: helpers.withMessage(
            'Debe seleccionar un territorio.',
            required
        ),
    },

    provincia: {
        required: helpers.withMessage(
            'Debe seleccionar una provincia.',
            required
        ),
    },

    ciudad: {
        required: helpers.withMessage(
            'Debe seleccionar una ciudad.',
            required
        ),
    },

    email: {
        required: helpers.withMessage(
            'El correo electrónico es obligatorio.',
            required
        ),
        email: helpers.withMessage(
            'Ingrese un correo electrónico válido.',
            email
        ),
        maxLength: helpers.withMessage(
            'El correo no puede superar los 200 caracteres.',
            maxLength(200)
        ),
    },
}));

const v$ = useVuelidate(rules, form);

async function crearDireccion() {
    const isValid = await v$.value.$validate();

    if (!isValid) {
        swalWarning(
            'Revise los campos obligatorios antes de crear la dirección.'
        );
        return;
    }

    const response = await createNewAddress(form.value);

    if (!response?.ok) {
        swalError(
            response?.message ||
            'No se pudo crear la dirección.'
        );
        return;
    }

    await swalSuccess(
        response?.message ||
        'Dirección creada correctamente.'
    );

    v$.value.$reset();

    emit('closeModal', props.cliente);
}

async function resetAddressForm() {
    resetModalForm();

    await nextTick();

    v$.value.$reset();
}

watch(
    () => props.cliente,
    async (newValue) => {
        if (!newValue) {
            return;
        }

        form.value.email = newValue.CLI_CORREO_ELECT_SRI || '';
        form.value.cliente_id = newValue.id;

        await nextTick();

        v$.value.$reset();
    },
    { immediate: true }
);

onMounted(() => {
    fetchAllTerritories();
    fetchAllProvincies();
});
</script>


<template>
    <BaseBlock title="Nueva Dirección" class="mb-0" transparent>
        <template #options>
            <button type="button" class="btn-block-option" data-bs-dismiss="modal" aria-label="Close"
                @click="resetAddressForm">
                <i class="fa fa-fw fa-times"></i>
            </button>
        </template>
        <template #content>
            <div class="block-content fs-sm pb-2 space-y-2">
                <div class="content-fluid">
                    <!-- cabecera -->
                    <div class="row g-2 mb-2">
                        <div class="col-12 col-lg-8">
                            <div class="kv">
                                <small class="text-muted">Cliente</small>
                                <div class="fw-semibold">{{ infoClient.CLI_RAZON_SOCIAL }}</div>
                            </div>
                        </div>
                        <div class="col-12 col-lg-4">
                            <div class="kv">
                                <small class="text-muted">Cliente</small>
                                <div class="fw-semibold">{{ infoClient.CLI_RUC }}</div>
                            </div>
                        </div>
                    </div>

                    <!-- detalle -->
                    <div class="row g-2">
                        <div class="col-12 col-lg-12">
                            <div class="kv">
                                <small class="text-muted">Dirección</small>

                                <textarea id="input-direccion" v-model="form.direccion" class="form-control"
                                    :class="{ 'is-invalid': v$.direccion.$error }" rows="3" maxlength="122"
                                    placeholder="Dirección completa..." @blur="v$.direccion.$touch()"></textarea>

                                <div v-if="v$.direccion.$error" class="invalid-feedback">
                                    {{ v$.direccion.$errors[0].$message }}
                                </div>

                                <small class="text-muted text-end mt-1">
                                    {{ form.direccion?.length ?? 0 }}/122
                                </small>
                            </div>
                        </div>
                        <div class="col-12 col-lg-6">
                            <div class="kv">
                                <small class="text-muted">Contacto</small>

                                <div class="fw-semibold">
                                    <input id="input-contacto" v-model="form.contacto" type="text" class="form-control"
                                        :class="{ 'is-invalid': v$.contacto.$error }" maxlength="61"
                                        placeholder="Contacto..." @blur="v$.contacto.$touch()">

                                    <div v-if="v$.contacto.$error" class="invalid-feedback">
                                        {{ v$.contacto.$errors[0].$message }}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="col-12 col-lg-6">
                            <div class="kv">
                                <small class="text-muted">Referencia</small>

                                <div class="fw-semibold">
                                    <input id="input-referencia" v-model="form.referencia" type="text"
                                        class="form-control" :class="{ 'is-invalid': v$.referencia.$error }"
                                        maxlength="100" placeholder="Referencia..." @blur="v$.referencia.$touch()">

                                    <div v-if="v$.referencia.$error" class="invalid-feedback">
                                        {{ v$.referencia.$errors[0].$message }}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-12 col-lg-6">
                            <div class="kv">
                                <small class="text-muted">Territorio</small>

                                <div class="fw-semibold">
                                    <select v-if="!loadingTerritories" id="select-territorio" v-model="form.territorio"
                                        class="form-select" :class="{ 'is-invalid': v$.territorio.$error }"
                                        @blur="v$.territorio.$touch()">
                                        <option value="" disabled>
                                            Seleccione un territorio
                                        </option>

                                        <option v-for="(territory, index) in allTerritories" :key="index"
                                            :value="territory.TERRITORIO_CODIGO">
                                            {{ territory.TERRITORIO_DESCRIPCION }}
                                        </option>
                                    </select>

                                    <div v-if="v$.territorio.$error" class="invalid-feedback">
                                        {{ v$.territorio.$errors[0].$message }}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-12 col-lg-6">
                            <div class="kv">
                                <small class="text-muted">Provincia</small>

                                <div class="fw-semibold">
                                    <select v-if="!loadingProvincies" id="select-provincia" v-model="form.provincia"
                                        class="form-select" :class="{ 'is-invalid': v$.provincia.$error }"
                                        @change="fetchAllCities()" @blur="v$.provincia.$touch()">
                                        <option value="" disabled>
                                            Seleccione una provincia
                                        </option>

                                        <option v-for="(province, index) in allProvincies" :key="index"
                                            :value="province.provincia">
                                            {{ province.provincia }}
                                        </option>
                                    </select>

                                    <div v-if="v$.provincia.$error" class="invalid-feedback">
                                        {{ v$.provincia.$errors[0].$message }}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-12 col-lg-6">
                            <div class="kv">
                                <small class="text-muted">Ciudad</small>

                                <div class="fw-semibold">
                                    <select v-if="!loadingCities" id="select-ciudad" v-model="form.ciudad"
                                        class="form-select" :class="{ 'is-invalid': v$.ciudad.$error }"
                                        @blur="v$.ciudad.$touch()">
                                        <option value="" disabled>
                                            Seleccione una ciudad
                                        </option>

                                        <option v-for="(city, index) in allCities" :key="index" :value="city.ciudad">
                                            {{ city.ciudad }}
                                        </option>
                                    </select>

                                    <div v-if="v$.ciudad.$error" class="invalid-feedback">
                                        {{ v$.ciudad.$errors[0].$message }}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-12 col-lg-6">
                            <div class="kv">
                                <small class="text-muted">Telefono</small>
                                <div class="fw-semibold">
                                    <input type="text" class="form-control" v-model="form.telefono">
                                </div>

                            </div>
                        </div>
                        <div class="col-12 col-lg-12">
                            <div class="kv">
                                <small class="text-muted">Correo electrónico</small>
                                <div class="fw-semibold">
                                    <input id="input-email" v-model="form.email" type="email" class="form-control"
                                        :class="{ 'is-invalid': v$.email.$error }" maxlength="200"
                                        placeholder="Correo electrónico..." @blur="v$.email.$touch()">

                                    <div v-if="v$.email.$error" class="invalid-feedback">
                                        {{ v$.email.$errors[0].$message }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </BaseBlock>
    <div class="content text-end mb-4 space-x-2">
        <button type="button" class="btn btn-sm btn-alt-secondary" data-bs-dismiss="modal" @click="resetAddressForm">
            Cerrar
        </button>
        <button type="button" class="btn btn-sm btn-primary" :disabled="loading" @click="crearDireccion">
            <span v-if="loading" class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>

            Crear
        </button>
    </div>
</template>

<style scoped>
.kv small {
    display: block;
    line-height: 1;
}

.kv .badge2 {
    white-space: normal;
    /* CLAVE: Permite que el texto haga salto de línea */
    text-align: left;
    /* Alinea el texto a la izquierda para leer mejor párrafos */
    display: block;
    /* Hace que ocupe el ancho disponible de la columna */
    line-height: 1.4;
    /* Da un poco de aire entre las líneas de texto */
    font-weight: 12px;
    /* Opcional: quita la negrita si el texto es muy largo */
}


.kv .fw-semibold {
    line-height: 1.2;
}

.text-monospace {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
}

@media (min-width: 992px) {
    .table.table-sm> :not(caption)>*>* {
        padding-top: .35rem;
        padding-bottom: .35rem;
    }
}


/* columnas numéricas alineadas */
.code {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace;
    font-size: 14px;
}
</style>

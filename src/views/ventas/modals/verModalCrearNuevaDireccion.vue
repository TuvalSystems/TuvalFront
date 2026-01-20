<script setup>
import { onMounted, computed, watch } from 'vue';
import { useDireccionProcess } from "@/composables/venta/cotizaciones/crearCotizacion/useDireccionProcess";
import { swalError, swalSuccess, swalWarning } from "@/functions/swal-alert";
const emit = defineEmits(['closeModal']);

const props = defineProps({
    'cliente': Object
});

const { loading,
    form,
    createNewAddress,
    //apis territorios
    loadingTerritories,
    fetchAllTerritories,
    allTerritories,

    loadingProvincies,
    fetchAllProvincies,
    allProvincies,

    loadingCities,
    fetchAllCities,
    allCities, resetModalForm} = useDireccionProcess();

const infoClient = computed(() => props.cliente);


async function crearDireccion(){
    const resp = await createNewAddress(form.value);
    if (!resp?.ok) {
        swalError(resp?.message);
        return;
    }
    await swalSuccess(resp?.message);
    emit('closeModal' , props.cliente);
}

watch(
    () => props.cliente,
    (newVal) => {
        // Solo asigna si el cliente existe
        if (newVal) {
            form.value.email = newVal.CLI_CORREO_ELECT_SRI || ''; // Usa cadena vacía si el campo viene null
            form.value.cliente_id = newVal.id;
        }
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
            <button type="button" class="btn-block-option" data-bs-dismiss="modal" aria-label="Close" @click="resetModalForm()">
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
                                <textarea name="" id="" class="form-control" rows="3"
                                    v-model="form.direccion"></textarea>
                            </div>
                        </div>
                        <div class="col-12 col-lg-6">
                            <div class="kv">
                                <small class="text-muted">Contacto</small>
                                <div class="fw-semibold">
                                    <input type="text" class="form-control" v-model="form.contacto">
                                </div>

                            </div>
                        </div>
                        <div class="col-12 col-lg-6">
                            <div class="kv">
                                <small class="text-muted">Referencia</small>
                                <div class="fw-semibold">
                                    <input type="text" class="form-control" v-model="form.referencia">
                                </div>

                            </div>
                        </div>
                        <div class="col-12 col-lg-6">
                            <div class="kv">
                                <small class="text-muted">Territorio</small>
                                <div class="fw-semibold">
                                    <select v-if="!loadingTerritories" class="form-select" v-model="form.territorio">
                                        <option v-for="(ter, index) in allTerritories" :key="index"
                                            :value="ter.TERRITORIO_CODIGO">
                                            {{ ter.TERRITORIO_DESCRIPCION }}
                                        </option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div class="col-12 col-lg-6">
                            <div class="kv">
                                <small class="text-muted">Provincias</small>
                                <div class="fw-semibold">
                                    <select v-if="!loadingProvincies" class="form-select" v-model="form.provincia"
                                        @click="fetchAllCities()">
                                        <option v-for="(prov, index) in allProvincies" :key="index"
                                            :value="prov.provincia">
                                            {{ prov.provincia }}
                                        </option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div class="col-12 col-lg-6">
                            <div class="kv">
                                <small class="text-muted">Ciudades</small>
                                <div class="fw-semibold">
                                    <select v-if="!loadingCities" class="form-select" v-model="form.ciudad">
                                        <option v-for="(prov, index) in allCities" :key="index" :value="prov.ciudad">
                                            {{ prov.ciudad }}
                                        </option>
                                    </select>
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
                                <small class="text-muted">Correo Electronico</small>
                                <div class="fw-semibold">
                                    <input type="email" class="form-control" v-model="form.email">
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </BaseBlock>
    <div class="content text-end mb-4 space-x-2">
        <button type="button" class="btn btn-sm btn-alt-secondary" data-bs-dismiss="modal" @click="resetModalForm()">
            Cerrar
        </button>
        <button type="button" class="btn btn-sm btn-primary" @click="crearDireccion()" :disabled="loading">
            <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
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

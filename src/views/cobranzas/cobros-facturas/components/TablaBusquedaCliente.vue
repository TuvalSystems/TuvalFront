<script setup>
import { onMounted, watch, ref } from 'vue';
const props = defineProps({
    clients: {
        type: Array,
        default: () => []
    },
    loading: {
        type: Boolean,
        default: false
    },
    errorSearch: {
        type: Boolean,
        default: false
    },
    showResults: {
        type: Boolean,
        default: true,
    },
});
const searchTerm = ref('');
const emit = defineEmits(['search-term-change', 'search-customers', 'select-customer']);

watch(searchTerm, (value) => {
    emit('search-term-change', value ?? '');
});

function requestCustomerSearch() {
    emit('search-customers');
}

function selectCustomer(client) {
    emit('select-customer', client);
    searchTerm.value = '';
}
</script>

<template>
    <div class="row g-2 mb-2">
        <div class="col">
            <div class="input-group input-group-sm">
                <input v-model="searchTerm" type="text" class="form-control" :class="{ 'is-invalid': errorSearch }"
                    placeholder="Buscar cliente..." autocomplete="off" @keyup.enter="requestCustomerSearch">

                <button class="btn btn-primary" type="button" :disabled="loading" @click="requestCustomerSearch">
                    <i v-if="!loading" class="fa fa-search"></i>
                    <i v-else class="fa fa-spinner fa-spin"></i>
                </button>

                <div v-if="errorSearch" class="invalid-feedback d-block">
                    Ingrese al menos 4 caracteres para buscar.
                </div>
            </div>
        </div>
    </div>

    <div v-if="loading" class="text-center py-4">
        <div class="spinner-border spinner-border-sm text-primary">
            <span class="visually-hidden">Cargando...</span>
        </div>
        <div class="fs-sm text-muted mt-2">
            Buscando clientes...
        </div>
    </div>

    <BaseBlock v-else-if="showResults && clients.length > 0" class="mb-2" transparent rounded>
        <div class="table-responsive">
            <table class="table table-hover table-sm align-middle">
                <thead>
                    <tr>
                        <th>RUC</th>
                        <th>Razón Social</th>
                        <th>Contacto</th>
                        <th>Ciudad</th>
                        <th>Provincia</th>
                        <th>Teléfono</th>
                        <th>Correo</th>
                    </tr>
                </thead>

                <tbody>
                    <tr v-for="(client, index) in clients" :key="client.id ?? client.CLI_RUC ?? index"
                        class="cursor-pointer" @click="selectCustomer(client)">
                        <td class="fs-sm">
                            <span class="text-primary fw-semibold">
                                {{ client.CLI_RUC }}
                            </span>
                        </td>

                        <td class="fs-sm">
                            <span class="text-primary fw-semibold">
                                {{ client.CLI_RAZON_SOCIAL }}
                            </span>
                        </td>

                        <td class="fs-sm">{{ client.CLI_CONTACTO }}</td>
                        <td class="fs-sm">{{ client.CLI_CIUDAD }}</td>
                        <td class="fs-sm">{{ client.CLI_PROVINCIA }}</td>
                        <td class="fs-sm">{{ client.CLI_TELEFONO_1 }}</td>

                        <td class="fs-sm">
                            <a v-if="client.CLI_CORREO_ELECT_SRI" :href="`mailto:${client.CLI_CORREO_ELECT_SRI}`"
                                @click.stop>
                                {{ client.CLI_CORREO_ELECT_SRI }}

                                <span v-if="!client.emails_validated" class="badge bg-danger text-white ms-1">
                                    correo no válido
                                </span>
                            </a>

                            <span v-else class="text-muted">
                                Sin correo
                            </span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </BaseBlock>
</template>

<style lang="css" scoped>
td input.form-control {
    min-width: 60px;
    /* Asegura que nunca sean inusables */
    width: 100%;
    /* Ocupa toda la celda */
    padding: 0.25rem;
    /* Padding pequeño */
}


@media (min-width: 992px) {
    .table.table-sm> :not(caption)>*>* {
        padding-top: .35rem;
        padding-bottom: .35rem;
    }
}
</style>

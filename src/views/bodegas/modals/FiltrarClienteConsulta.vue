<script setup>
import { ref, reactive, computed, watch } from "vue";
import { useStore } from 'vuex'

const emit = defineEmits(["filtrarClienteConsulta"]);
const store = useStore();

const verclientes = ref(false);
const clientes = computed(() => store.state.clientes);
let errorbuscarcliente = ref(false);
const buscarcliente = reactive({
    busqueda: null,
});
let errorMsg = ref('');


async function buscarclientes(ev) {
    if (buscarcliente.busqueda.length < 3) {
        errorbuscarcliente.value = true;
        return;
    }

    errorbuscarcliente.value = false;
    store.commit('nullCurrentcliente');

    verclientes.value = true;
    ev.preventDefault();
    store.dispatch('buscarclientes', buscarcliente)
        .catch(err => {
            verclientes.value = false;
            errorMsg.value = err.response.data.error
        });
}

function selectcliente(cliente) {
    verclientes.value = false;
    buscarcliente.busqueda = null;
    emit('filtrarClienteConsulta', cliente.CLI_RUC);

}


</script>
<template>
    <BaseBlock title="Filtrar cliente" class="mb-0 pb-4">
        <template #options>
            <button type="button" class="btn-block-option" data-bs-dismiss="modal" aria-label="Close">
                <i class="fa fa-fw fa-times"></i>
            </button>
        </template>
        <template #content>
            <div class="block-content fs-sm ">
                <form class="row row-cols-lg-auto g-3 align-items-center" @submit.prevent="onSubmit">
                    <div class="col-12">
                        <label class="visually-hidden" for="buscar-cliente">Buscar cliente...</label>
                        <input type="text" class="form-control" :class="errorbuscarcliente ? 'is-invalid' : ''"
                            id="buscar-cliente" name="buscar-cliente" placeholder="Buscar cliente..."
                            @keyup.enter="buscarclientes" v-model="buscarcliente.busqueda" />
                    </div>
                    <div>
                        <button type="button" v-on:click="buscarclientes" class="btn btn-primary">Buscar</button>
                    </div>
                </form>
                <div v-if="clientes.loading" class="text-center">
                    <div class="spinner-border text-primary mt-4" role="status"><span
                            class="visually-hidden">Loading...</span></div>
                </div>
                <BaseBlock v-if="verclientes && clientes.data.length && !clientes.loading" class="mb-0">
                    <div class="table-responsive">
                        <table class="table table-hover table-sm table-vcenter">
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
                                <tr v-for="(cliente, index) in clientes.data" :key="index">
                                    <td class="">
                                        <a @click="selectcliente(cliente)" href="javascript:void(0)"> {{ cliente.CLI_RUC
                                            }} </a>
                                    </td>
                                    <td class="fs-sm">
                                        <a @click="selectcliente(cliente)" href="javascript:void(0)"> {{
                                            cliente.CLI_RAZON_SOCIAL }} </a>
                                    </td>
                                    <td class="fs-sm">
                                        {{ cliente.CLI_CONTACTO }}
                                    </td>
                                    <td class="fs-sm">
                                        {{ cliente.CLI_CIUDAD }}
                                    </td>
                                    <td class="fs-sm">
                                        {{ cliente.CLI_PROVINCIA }}
                                    </td>
                                    <td class="fs-sm">
                                        {{ cliente.CLI_TELEFONO_1 }}
                                    </td>
                                    <td class="fs-sm">
                                        {{ cliente.CLI_CORREO_ELECT_SRI }}
                                    </td>

                                </tr>
                            </tbody>
                        </table>
                    </div>
                </BaseBlock>
            </div>
        </template>
    </BaseBlock>
    <div class="block-content block-content-full text-end bg-body">
        <button type="button" class="btn btn-primary btn-sm mx-2" data-bs-dismiss="modal"> Cancelar</button>
    </div>
</template>
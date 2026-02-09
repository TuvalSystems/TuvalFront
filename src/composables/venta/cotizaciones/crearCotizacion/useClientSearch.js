import axiosClient from "@/axios";
import { useApiAction } from "@/composables/core/useApiAction";
import { ref, reactive, watch, computed } from "vue";
import { swalError } from "@/functions/swal-alert";
import { useStore } from 'vuex'

export function useClientSearch() {
    const store = useStore();
    const ptoVtaSelect = store.state.puntodeventaselect;
    const { run } = useApiAction();
    const apiSearchClients = 'consultas/buscar-clientes';
    const loadingSearch = ref(false);
    const dataSearch = reactive({
        search: null,
        tipo: null
    });
    const clients = ref([]);
    const errorSearchClient = ref(false);




    async function searchClients() {
        return  run(() => axiosClient.post(apiSearchClients, dataSearch), {
            loadingRef: loadingSearch,
            successMessage: 'Proceso realizado exitosamente',
            onSuccess: (list) => {
                clients.value = list ?? [];
            },
            onError: (backend, error) => {
                swalError(
                    backend?.error ||
                    backend?.message ||
                    error?.message ||
                    "Error al realizar la solicitud de reserva"
                );
            }
        });
    }

    const loadingAvailableCredit = ref(false);
    const infoClient = ref({});
    const infoSegmento = ref({});
    const apiAvailableCreditCustomer = '/consultas/cliente/cupo-disponible/';
    async function fetchAvailableCreditCustomer(ruc) {
        return  run(() => axiosClient.get(apiAvailableCreditCustomer + ruc), {
            loadingRef: loadingAvailableCredit,
            onSuccess: (res) => {
                infoClient.value = res.cliente
                infoSegmento.value = res.segmentos
            },
            successMessage: 'Proceso realizado exitosamente',
        });
    }


    const loadingSucursales = ref(false);
    const sucursales = ref([]);
    const apiCustomerBranches = '/consultas/cliente/sucursales/';

    async function fetchCustomerBranches(ruc) {
        return  run(() => axiosClient.get(apiCustomerBranches + ruc), {
            loadingRef: loadingSucursales,
            onSuccess: (res) => {
                sucursales.value = res;
            },
            successMessage: 'Proceso realizado exitosamente',
        })
    }


    const loadingWarehouseByUser = ref(false);
    const warehouseByUser = ref([]);
    const apiWarehouseByUser = '/usuario/obtener-bodegas-por-punto-de-venta';

    async function fetchWarehouseByPtoVtaUser() {
        return  run(() => axiosClient.post(apiWarehouseByUser, { ptoVta: ptoVtaSelect }), {
            loadingRef: loadingWarehouseByUser,
            onSuccess: (res) => {
                warehouseByUser.value = res;
            },
            successMessage: 'Proceso realizado exitosamente',
        })
    }















    // funciones de validaciones check etc
    const getClientStatus = (isSuspended) => {
        const status = Number(isSuspended);
        if (status === 0) {
            return {
                text: 'NO',
                class: 'bg-success-light text-success'
            }
        } else {
            return {
                text: 'SI',
                class: 'bg-danger-light text-danger'
            }
        }
    }




    return {
        clients,
        errorSearchClient,
        dataSearch,
        loadingSearch,
        searchClients,

        // customer 
        infoClient,
        infoSegmento,
        loadingAvailableCredit,
        fetchAvailableCreditCustomer,

        //sucursales
        loadingSucursales,
        sucursales,
        fetchCustomerBranches,

        //bodegas por punto de venta
        loadingWarehouseByUser,
        warehouseByUser,
        fetchWarehouseByPtoVtaUser,


        //validations
        getClientStatus,
    };
}
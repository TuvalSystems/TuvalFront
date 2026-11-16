import axiosClient from "@/axios";
import { useApiAction } from "@/composables/core/useApiAction";
import { onScopeDispose, ref, reactive } from "vue";
import { swalError } from "@/functions/swal-alert";
import { useStore } from 'vuex'
import { CLIENT_API_ROUTES } from "@/constants/apiRoutes/ventas/cliente/clientRoutes";

export function useClientSearch() {
    const store = useStore();
    const { run, invalidate } = useApiAction();
    const invalidateClientQueries = () => ["loadingSearch", "loadingAvailableCredit", "loadingSucursales"].forEach(invalidate);
    onScopeDispose(() => {
        invalidateClientQueries();
        invalidate("loadingWarehouseByUser");
    });
    const loadingSearch = ref(false);
    const dataSearch = reactive({
        search: null,
        tipo: null
    });
    const clients = ref([]);
    const errorSearchClient = ref(false);




    async function searchClients() {
        return  run(() => axiosClient.post(CLIENT_API_ROUTES.ACTIONS.SEARCH_CLIENT, { ...dataSearch }), {
            loadingRef: loadingSearch,
            latestOnly: true,
            key: "loadingSearch",
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
    async function fetchAvailableCreditCustomer(ruc) {
        return  run(() => axiosClient.get(CLIENT_API_ROUTES.ACTIONS.AVAILABLE_CREDIT + '/'+ ruc), {
            loadingRef: loadingAvailableCredit,
            latestOnly: true,
            key: "loadingAvailableCredit",
            onSuccess: (res) => {
                infoClient.value = res.cliente
                infoSegmento.value = res.segmentos
            },
            successMessage: 'Proceso realizado exitosamente',
        });
    }


    const loadingSucursales = ref(false);
    const sucursales = ref([]);

    async function fetchCustomerBranches(ruc, type) {
        return  run(() => axiosClient.post(CLIENT_API_ROUTES.ACTIONS.BRANCHES, { ruc: ruc , tipo: type }), {
            loadingRef: loadingSucursales,
            latestOnly: true,
            key: "loadingSucursales",
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
        return  run(() => axiosClient.post(apiWarehouseByUser, { ptoVta: store.state.puntodeventaselect }), {
            loadingRef: loadingWarehouseByUser,
            latestOnly: true,
            key: "loadingWarehouseByUser",
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
        invalidateClientQueries,
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
import axiosClient from "@/axios";
import { useApiAction } from "@/composables/core/useApiAction";
import { ref, reactive, watch } from "vue";
import { swalError } from "@/functions/swal-alert";


export function useClientSearch() {
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
        return await run(() => axiosClient.post(apiSearchClients, dataSearch), {
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
        return await run(() => axiosClient.get(apiAvailableCreditCustomer + ruc), {
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
        return await run(() => axiosClient.get(apiCustomerBranches + ruc), {
            loadingRef: loadingSucursales,
            onSuccess: (res) => {
                sucursales.value = res;
            },
            successMessage: 'Proceso realizado exitosamente',
        })
    }



    // watch(
    //     () => dataSearch.search,
    //     (newValue) => {
    //         clearTimeout(debounceId);
    //         debounceId = setTimeout(() => {
    //             if (newValue.length > 4) {
    //                 searchClients();
    //             }
    //         }, 300);
    //     }
    // )

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
        fetchCustomerBranches
    };
}
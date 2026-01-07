import axiosClient from "@/axios";
import { useApiAction } from "@/composables/core/useApiAction";
import { ref , reactive, watch} from "vue";


export function useClientSearch() {

    const { run } = useApiAction();
    const apiSearchClients = 'cnsultas/busqueda-clientes';
    const loadingSearch = ref(false);
    const dataSearch = reactive({
        search: null,
        tipo: null
    });
    const errorSearchClient = ref(false);

    async function verifySearchClient(){
        if(dataSearch.search.lenght < 3){
            errorSearchClient.value = true;
            return false;
        }
    }

    async function searchClients(payload) {
        return await run(() => axiosClient.post(apiSearchClients, payload), {
            loadingRef: loadingSearch,
            successMessage: 'Proceso realizado exitosamente',
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



    watch(dataSearch, () => {
        verifySearchClient();
    });

    return {
        errorSearchClient,
        dataSearch,
        loadingSearch,
        searchClients
    };
}
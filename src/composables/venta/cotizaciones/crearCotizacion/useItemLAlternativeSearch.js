import { reactive, ref } from "vue";
import { INVENTORY_ARTICLES_API_ROUTES } from "@/constants/apiRoutes/inventario/articleRoutes";
import { useApiAction } from "@/composables/core/useApiAction";
import axiosClient from "@/axios";
const getInitialFilters = () => ({
    categoria: "",
    linea: "",
    clase: "",
});

export function useItemLAlternativeSearch() {
    const itemLSearchFilters = reactive(getInitialFilters());
    const itemLAlternatives = ref([]);
    const loadingItemLSearch = ref(false);
    const itemLSearchError = ref(null);
    const { run } = useApiAction();
    function getSearchPayload() {
        return {
            categoria: String(itemLSearchFilters.categoria ?? "").trim(),
            linea: String(itemLSearchFilters.linea ?? "").trim(),
            clase: String(itemLSearchFilters.clase ?? "").trim(),
        };
    }

    function clearItemLSearch() {
        Object.assign(itemLSearchFilters, getInitialFilters());
        itemLAlternatives.value = [];
        itemLSearchError.value = null;
    }

    async function fetchItemLDescriptionAlternatives() {
        itemLAlternatives.value = [];
        itemLSearchError.value = null;

        return await run(() => axiosClient.post(INVENTORY_ARTICLES_API_ROUTES.ALTERNATIVES_ITEMS_L, getSearchPayload()), {
            loadingRef: loadingItemLSearch,
            onSuccess: (info) => {
                itemLAlternatives.value = Array.isArray(info) ? info : [];
            },
            onError: (backend, error) => {
                itemLSearchError.value = backend?.message || error?.message || "No se pudieron obtener las alternativas";
            }
        });

    }

    return {
        itemLSearchFilters,
        itemLAlternatives,
        loadingItemLSearch,
        itemLSearchError,
        getSearchPayload,
        clearItemLSearch,
        fetchItemLDescriptionAlternatives,
    };
}

import { ref } from "vue";
import axiosClient from "@/axios";
import { QUOTE_API_ROUTES } from "@/constants/apiRoutes/ventas/cotizaciones/quoteRoutes";

export function useQuoteAlternativeItems({
    run,
    form,
}) {
    //proceso de items alternativos
    //proceso para listado de items alternativos 
    const descripcionAlternativa = ref('');
    const listItemsAlternatives = ref([]);
    const loadingListAlternative = ref(false);
    async function getAlternativeDescriptions(artCode) {
        return run(() => axiosClient.post(QUOTE_API_ROUTES.QUOTES.LIST_ALTERNATIVE_ITEMS, { item: artCode }), {
            loadingRef: loadingListAlternative,
            onSuccess: (res) => {
                listItemsAlternatives.value = res;
            },
            successMessage: 'Proceso realizado exitosamente',
        });
    }

    async function clearSelectionItemalternative() {
        listItemsAlternatives.value = [];
        descripcionAlternativa.value = '';
    }

    async function updateCheckAlternative(event, element, i) {
        let valEvent = event.target.checked ? 1 : 0;
        form.value.items[i].CHECK_ALTERNATIVO = valEvent;

    }

    async function updateDescriptionsForCheckAlternative(descripcion, i) {
        form.value.items[i].ART_DESCRIPCION = descripcion;
        form.value.items[i].ART_DESCRIPCION_ORIGINAL = descripcion;
        form.value.items[i].cambiar_descripcion = false;
    }





    return {
        descripcionAlternativa,
        listItemsAlternatives,
        loadingListAlternative,
        getAlternativeDescriptions,
        clearSelectionItemalternative,
        updateCheckAlternative,
        updateDescriptionsForCheckAlternative,
    };
}

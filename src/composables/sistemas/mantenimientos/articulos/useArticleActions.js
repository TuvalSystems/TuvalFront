import axiosClient from "@/axios";
import { useApiAction } from "@/composables/core/useApiAction";
import { ARTICLES_API_ROUTES } from "@/constants/apiRoutes/ventas/cotizaciones/articleRoutes";
import { ref } from "vue";

export function useArticleActions() {
    const { run } = useApiAction();

    const loadingUpdateLogisticService = ref(false);
    async function updateStatusLogisticService(id) {
        return await run(() => axiosClient.post(ARTICLES_API_ROUTES.UPDATED_LOGISTIC_SERVICE, { id: id }), {
            loadingRef: loadingUpdateLogisticService,
        });
    }


    /** busqueda de item logistico */
    const loadingArticleLogistic = ref(false);
    async function fetchArticleLogistic(){
        return await run(()=> axiosClient.get(ARTICLES_API_ROUTES.SEARCH_LOGISTIC_ARTICLE), {
            loadingRef : loadingArticleLogistic
        })
    }
    return {
        loadingUpdateLogisticService,
        updateStatusLogisticService,
        //articulo logistico 
        fetchArticleLogistic,
        loadingArticleLogistic

    }
}
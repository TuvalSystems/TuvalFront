
import { ref } from "vue";
import { downloadFileFromApi } from "@/utils/fileDownload";
import { DISPATCH_ORDERS_API_ROUTES } from "@/constants/apiRoutes/cobranzas/dispatchOrdersRoute";
import { useApiAction } from "@/composables/core/useApiAction";
export function useDispatchOrdersActions() {
    const { run } = useApiAction();
    const loadingPrint = ref(false);

    async function printOrderDispatchPdf(id) {
        const payload = {
            id: id
        }
        return run(async () => {
            const fileName = await downloadFileFromApi({
                url: DISPATCH_ORDERS_API_ROUTES.PRINT_PDF,
                method: "POST",
                payload: payload,
                filenameFallback: "Generado exitosamente."
            });
            return { data: { success: true, data: fileName } };
        }, {
            loadingRef: loadingPrint,
        });
    }

    return {
        loadingPrint,
        printOrderDispatchPdf
    }
}   
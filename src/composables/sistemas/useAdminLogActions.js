import axiosClient from "@/axios";
import { useApiAction } from "../core/useApiAction";
import { ref } from "vue";
import { ADMIN_API_ROUTES } from "@/constants/apiRoutes/sistema/useAdminRoutes";


export function useAdminLogActions() {
    const { run } = useApiAction();
    const detailLog = ref(null);
    const loadingDetailLog = ref(false);

    async function fetchDetailLogById(id) {
        return await run(() => axiosClient.get(`${ADMIN_API_ROUTES.LOGS.DETAIL}/${encodeURIComponent(id)}`), {
            loadingRef: loadingDetailLog,
            latestOnly: true,
            key: "detalle-log",
            onSuccess: (info) => {
                detailLog.value = info ?? null;
            },
            onError: (backend, error) => {
                console.error(backend, error);
            },
        });
    }

    function resetDetailLog() {
        detailLog.value = null;
    }

    return {
        detailLog,
        loadingDetailLog,
        fetchDetailLogById,
        resetDetailLog,
    }
}

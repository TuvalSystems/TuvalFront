import axiosClient from "@/axios";
import { ref } from "vue";
import { useApiAction } from "@/composables/core/useApiAction";

export function useClientBranchesProcessOperation() {
    const { run } = useApiAction();
    const apiGetBranchDetail = 'gestion/sucursal/detalle';
    const loadingBranchDetail = ref(false);
    const branchDetail = ref(null);

    async function fetchBranchDetail(id) {
        return run(() => axiosClient.post(apiGetBranchDetail, { id: id }), {
            loadingRef: loadingBranchDetail,
            onSuccess: (data) => {
                branchDetail.value = data;
            },
            successMessage: "Proceso realizado exitosamente.",
        });
    }

    return {
        loadingBranchDetail,
        branchDetail,
        fetchBranchDetail
    }

}
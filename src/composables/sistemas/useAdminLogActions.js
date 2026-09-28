import axiosClient from "@/axios";
import { useApiAction } from "../core/useApiAction";
import { ref } from "vue";
import { ADMIN_API_ROUTES } from "@/constants/apiRoutes/sistema/useAdminRoutes";


export function useAdminLogActions(){
    const {run} = useApiAction();
    const detailLog = ref([]);
    const loadingDetailLog = ref(false);
   
    async function fetchDetailLogById(id){
        return run(() => axiosClient.get(ADMIN_API_ROUTES.LOGS.DETAIL));
    }

    return {
        detailLog,
        loadingDetailLog,
        fetchDetailLogById
    }
}
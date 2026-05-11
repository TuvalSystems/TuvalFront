import axiosClient from "@/axios";
import { ref } from "vue";
import { useApiAction } from "@/composables/core/useApiAction";


export function useUserActions(){
    const { run } = useApiAction();
    const loadingStatus = ref(false);
    const apiUpdateStatus = 'usuario/change-status-user';

    async function UpdateStatus(id){
        return run(() => axiosClient.post(apiUpdateStatus, {
            id : id
        }), {
            loadingRef : loadingStatus,
        });
    }

    const loadingReset = ref(false);
    const apiUpdateReset = 'usuario/reset-password';
    async function resetPasswordUser(id){
        return run(()=> axiosClient.post(apiUpdateReset,{
            id : id
        }),{
            loadingRef : loadingReset
        })
    }



    return{
        loadingStatus,
        UpdateStatus,
        loadingReset,
        resetPasswordUser
    }
}
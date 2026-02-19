import { ref, reactive } from "vue";
import axiosClient from "@/axios";
import { useApiAction } from "@/composables/core/useApiAction";
import {
    swalWarning
} from "@/functions/swal-alert.js";

export function useDispatchGuideProcess() {
    const { run } = useApiAction();
   
    const tipoIdentificacion = [
        { value: "04", label: "Ruc" },
        { value: "05", label: "Cedula" },
        { value: "06", label: "Pasaporte" },
    ];
    const apiCreateGuide = `bodegas/despachos/guia-remision/crear-guia-despacho`;
    const loading = ref(false);
    async function createGuideDispatch(data){
        return await run(() => axiosClient.post(apiCreateGuide, data), {
            loadingRef: loading,
            successMessage: "Proceso realizado exitosamente.",
        });
    }

    return {
        tipoIdentificacion,
        loading,
        createGuideDispatch
    }
}
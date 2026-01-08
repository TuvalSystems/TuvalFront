import axiosClient from "@/axios";
import { useApiAction } from "@/composables/core/useApiAction";
import { ref } from "vue";
import { swalError, swalSuccess } from "@/functions/swal-alert.js";

export function useCheckClientSegment() {
   const { run } = useApiAction();
  const loadingCheck = ref(false);
  const apiValidateSegment = '/cotizaciones/validar-segmento-cliente';

  async function fetchCheckSegmentoClient(ruc){
    return await run(()=> axiosClient.post(apiValidateSegment, {ruc : ruc}),{
      loadingRef: loadingCheck,
      successMessage: 'Proceso realizado exitosamente',
    })
  }

  return {
    loadingCheck,
    fetchCheckSegmentoClient,
  };
}

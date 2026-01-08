import axiosClient from "@/axios";
import { useApiAction } from "@/composables/core/useApiAction";
import { reactive , ref} from "vue";
import { swalError, swalSuccess } from "@/functions/swal-alert.js";

export function useUpdateSegmentClient() {
  const { run } = useApiAction();
  const loadingUpdate = ref(false);
  const apiUpdated = '/cotizaciones/actualizar-segmento-cliente';
  const data = reactive({
    segmento: "",
    subsegmento: "",
  });

  // async function updateClientWithSegment(cliente) {
  //   try {
  //     const response = await axiosClient.post(
  //       "/cotizaciones/actualizar-segmento-cliente",
  //       {
  //         cliente: cliente,
  //         segmento: data.segmento,
  //         subsegmento: data.subsegmento,
  //       }
  //     );
  //     if (response.status === 200) {
  //       resetForm();
  //       swalSuccess("Segmento y subsegmento actualizados correctamente");
  //       return true;
  //     }
  //   } catch (error) {
  //     swalError(error.response?.data?.error || error.message);
  //     return false;
  //   }
  //   return false;
  // }

  async function updateClientWithSegment(ruc) {
    return await run(() => axiosClient.post(apiUpdated, { ruc: ruc, segmento: data.segmento, subsegmento: data.subsegmento }), {
      loadingRef: loadingUpdate,
      successMessage: 'Proceso realizado exitosamente',
    })
  }

  function resetForm() {
    data.segmento = "";
    data.subsegmento = "";
  }

  return {
    loadingUpdate,
    updateClientWithSegment,
    data,
    resetForm,
  };
}

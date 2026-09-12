import axiosClient from "@/axios";
import { useApiAction } from "@/composables/core/useApiAction";
import { reactive, ref } from "vue";

export function useUpdateSegmentClient() {
  const { run } = useApiAction();
  const loadingUpdate = ref(false);
  const apiUpdated = '/cotizaciones/actualizar-segmento-cliente';
  const data = reactive({
    segmento: "",
    subsegmento: "",
  });



  async function updateClientWithSegment(ruc) {
    return run(() => axiosClient.post(apiUpdated, { ruc: ruc, segmento: data.segmento, subsegmento: data.subsegmento }), {
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

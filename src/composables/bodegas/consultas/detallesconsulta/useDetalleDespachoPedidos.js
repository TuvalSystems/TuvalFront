import axiosClient from "@/axios";
import { watch, ref } from "vue";
import { swalError } from "@/functions/swal-alert.js";
import { useApiAction } from "@/composables/core/useApiAction";

export function useDetalleDespachoPedidos() {
  const { run } = useApiAction();

  const loading = ref(false);
  const errorDetalle = ref(null);

  async function fetchDetailGuides(guiaId) {
    loading.value = true;
    errorDetalle.value = null;
    try {
      const response = await axiosClient.post(
        "/bodegas/guiasderemision/detalle-guia-id-tipo",
        {
          guia: guiaId,
        }
      );
      const res = response.data.data;
      loading.value = false;
      return res;
    } catch (errorDetalle) {
      console.log("Error al obtener el detalle de la guia", errorDetalle);
      swalError(errorDetalle.response.data.error);
      loading.value = false;
    } finally {
      loading.value = false;
    }
  }


  const loadingDetailGuideR = ref(false);
  const apiDetailReservation = "bodegas/guia-remision-reserva/detalle";

  async function fetchDetailGuideReservation(id){
    return await run(() => axiosClient.post(apiDetailReservation, { id }), {
      loadingRef: loadingDetailGuideR,
      successMessage: "Proceso realizado exitosamente.",
    })
  }


  return { loading, fetchDetailGuides , loadingDetailGuideR, fetchDetailGuideReservation };
}

import axiosClient from "@/axios";
import { watch, ref } from "vue";
import { swalError } from "@/functions/swal-alert.js";

export function useDetalleDespachoPedidos() {
  //   const detalleGuia = ref(null);
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



  return { loading, fetchDetailGuides };
}

import axiosClient from "@/axios";
import { reactive, ref } from "vue";

import { swalSuccess, swalWarning, swalError } from "@/functions/swal-alert.js";

export function useOrderUpdate() {
  const loadingUpdate = ref(false);
  const apiOrderUpdate = "/pedidos/actualizar-datos-pedidos";
  const data = reactive({
    id: null,
    orden_de_compra: null,
    nota_cliente: null,
  });

  function insertData(ord) {
    data.id = ord.id;
    data.orden_de_compra = ord.orden_de_compra;
    data.nota_cliente = ord.nota_cliente;
  }

  async function updateOrder() {
    loadingUpdate.value = true;
    try {
      const payload = {
        id: data.id, // si aplica
        orden_de_compra: data.orden_de_compra ?? null,
        nota_cliente: data.nota_cliente ?? null,
        // agrega otros campos que realmente actualizas...
      };
      const { data: resp } = await axiosClient.post(apiOrderUpdate, payload);
      if (resp?.success) {
        swalSuccess(resp?.message || "Pedido actualizado");
        resetForm?.();
        return true;
      } else {
        swalWarning(resp?.message || "No se pudo actualizar el pedido");
        return false;
      }
    } catch (error) {
      const msg =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.error ||
        "Error al actualizar el pedido.";

      loadingUpdate.value = false;
      swalError(msg);
      return false;
    } finally {
      loadingUpdate.value = false;
    }
  }

  function resetForm() {
    data.id = null;
    data.orden_de_compra = null;
    data.nota_cliente = null;
  }

  return {
    //state
    data,
    loadingUpdate,
    //functions
    insertData,
    updateOrder,
    resetForm,
  };
}

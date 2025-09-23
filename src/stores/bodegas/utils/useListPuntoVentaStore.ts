import { defineStore } from "pinia";
import { ref, computed } from "vue";
import axiosClient from "../../../axios";

export interface PuntoVenta {
  id: number;
  PTO_VTA_BOD_BODEGA: string;
  PTO_VTA_BOD_PUNTO_VENTA: string;
}

export const usePtoVtaStore = defineStore("ptoVta", () => {
  const list = ref<PuntoVenta[]>([]);
  const loading = ref(false);
  const error = ref<unknown>(null);

  const count = computed(() => list.value.length);

  const options = computed(() =>
    list.value.map((p) => ({
      label: p.PTO_VTA_BOD_BODEGA,
      value: p.PTO_VTA_BOD_PUNTO_VENTA,
    }))
  );
  async function fetchAll(force = false) {
    if (loading.value) return;
    if (!force && list.value.length) return; // simple cache
    loading.value = true;
    try {
      const { data } = await axiosClient.get<
        { data: PuntoVenta[] } | PuntoVenta[]
      >("/bodegas/listado-punto-venta");
      // Normalizar payload
      const payload = Array.isArray(data) ? data : data?.data;
      list.value = Array.isArray(payload) ? payload : [];

      error.value = null;
    } catch (e) {
      error.value = e;
      list.value = [];
    } finally {
      loading.value = false;
    }
  }

  function reset() {
    list.value = [];
    error.value = null;
    loading.value = false;
  }

  return { list, loading, error, count, options, fetchAll, reset };
});

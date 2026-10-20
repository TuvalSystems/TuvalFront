import { defineStore } from "pinia";
import { ref, computed } from "vue";
import axiosClient from "@/axios";
import { useApiAction } from "@/composables/core/useApiAction";
import { CLIENT_API_ROUTES } from "@/constants/apiRoutes/ventas/cliente/clientRoutes";

export interface TypeIdentify {
  id?: number;
  codigo: string;
  nombre: string;
  min_size?: number;
  max_size?: number;
}

export const useTypeIdentifyStore = defineStore("typeIdentify", () => {
  const list = ref<TypeIdentify[]>([]);
  const loading = ref(false);
  const error = ref<unknown>(null);

  const { run } = useApiAction() as any;

  const count = computed(() => list.value.length);

  const options = computed(() =>
    list.value.map((tipo) => ({
      label: tipo.nombre,
      value: tipo.codigo,
    })),
  );

  const selectedByCode = computed(() => {
    return (codigo: string | number | null | undefined) => {
      return (
        list.value.find((tipo) => String(tipo.codigo) === String(codigo)) ??
        null
      );
    };
  });

  async function fetchAll({ force = false } = {}) {
    if (loading.value) {
      return list.value;
    }

    if (list.value.length > 0 && !force) {
      return list.value;
    }

    const result = await run(
      () => axiosClient.get(CLIENT_API_ROUTES.ACTIONS.TYPE_IDENTITY),
      {
        loadingRef: loading,

        onSuccess: (data: TypeIdentify[]) => {
          list.value = Array.isArray(data) ? data : [];
          error.value = null;
        },

        onError: (backend: any, apiError: any) => {
          error.value = backend || apiError;
          list.value = [];
        },
      },
    );

    return result?.ok ? list.value : [];
  }

  function reset() {
    list.value = [];
    loading.value = false;
    error.value = null;
  }

  return {
    list,
    loading,
    error,
    count,
    options,
    selectedByCode,
    fetchAll,
    reset,
  };
});

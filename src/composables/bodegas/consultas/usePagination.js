import { ref, watch } from "vue";
import axiosClient from "../../../axios";

export function usePagination() {
  const items = ref([]);
  const loading = ref(false);
  const currentPage = ref(1);
  const totalPage = ref(0);
  const totalItems = ref(0);
  const searchTerm = ref("");
  const perPage = ref(10);
  const sortField = ref("");
  const sortOrder = ref("asc");

  //endPoint dinamico que cambia segun el componente
  const endpoint = ref("");
  const puntoVentaId = ref(null);
  const isInitialized = ref(false);

  const resetState = () => {
    // console.log("🔄 Limpiando el estado...");
    items.value = [];
    currentPage.value = 1;
    totalPage.value = 0;
    totalItems.value = 0;
    searchTerm.value = "";
    perPage.value = 10;
    sortField.value = "";
    sortOrder.value = "asc";
    isInitialized.value = false;
  };

  const initialize = (url, id) => {
    resetState();
    endpoint.value = url;
    puntoVentaId.value = id;
    if (!isInitialized.value) {
      fetchItems(); // Cargar la data al inicializar
      isInitialized.value = true;
    }
  };

  const fetchItems = async (page = 1) => {
    items.value = [];
    loading.value = true;
    currentPage.value = page;

    try {
      const response = await axiosClient.get(
        `${endpoint.value}${puntoVentaId.value}`,
        {
          params: {
            page: currentPage.value,
            perPage: perPage.value,
            search: searchTerm.value,
            sortBy: sortField.value,
            sortOrder: sortOrder.value,
          },
        }
      );
      if (response.data && response.data.data) {
        items.value = response.data.data.data;
        totalPage.value = response.data.data.last_page;
        totalItems.value = response.data.data.total;
      } else {
        console.warn("⚠️ No se encontraron datos en la respuesta.");
      }
    } catch (error) {
      console.error("Error al cargar los datos paginados", error);
    } finally {
      loading.value = false;
    }
  };

  // 👀 Watchers para recargar datos en tiempo real
  watch([searchTerm, perPage, sortField, sortOrder], () => {
    fetchItems(1);
  });

  return {
    items,
    loading,
    currentPage,
    totalPage,
    totalItems,
    searchTerm,
    perPage,
    fetchItems,
    initialize,
    sortField,
    sortOrder,
    resetState,
  };
}

import { ref } from "vue";
import axiosClient from "@/axios";
import { useApiAction } from "@/composables/core/useApiAction";
import { swalError, swalWarning } from "@/functions/swal-alert";
import { CUSTOMER_SEARCH_MIN_LENGTH } from "@/constants/customerSearch";
import { CLIENT_API_ROUTES } from "@/constants/apiRoutes/ventas/cliente/clientRoutes";

export function useCustomerFilterSearch() {
  const { run } = useApiAction();
  const clients = ref([]);
  const errorSearchClient = ref(false);
  const loadingSearch = ref(false);
  const showCustomerResults = ref(false);
  let searchTerm = "";
  let searchRevision = 0;

  function updateCustomerSearchTerm(value) {
    searchTerm = value ?? "";
    searchRevision += 1;
    clients.value = [];
    showCustomerResults.value = false;
    errorSearchClient.value = false;
  }

  function cleanSearchClients() {
    updateCustomerSearchTerm("");
  }

  async function searchCustomerFilters() {
    if (loadingSearch.value) return;
    const search = searchTerm.trim();
    clients.value = [];
    showCustomerResults.value = false;
    errorSearchClient.value = search.length < CUSTOMER_SEARCH_MIN_LENGTH;
    if (errorSearchClient.value) return;

    const revision = ++searchRevision;
    const result = await run(
      () => axiosClient.post(CLIENT_API_ROUTES.ACTIONS.SEARCH_CLIENT, { search, tipo: "proceso" }),
      { loadingRef: loadingSearch }
    );
    // El texto puede cambiar mientras la solicitud está en curso.
    if (revision !== searchRevision) return;
    if (!result.ok) {
      if (result.canceled || result.handled) return;
      const message = result.message || "Ocurrió un error al buscar clientes.";
      (result.status >= 500 ? swalError : swalWarning)(message);
      return;
    }
    clients.value = result.data ?? [];
    showCustomerResults.value = true;
  }

  return {
    clients,
    errorSearchClient,
    loadingSearch,
    showCustomerResults,
    updateCustomerSearchTerm,
    searchCustomerFilters,
    cleanSearchClients,
  };
}

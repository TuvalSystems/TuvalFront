import { ref } from "vue";
import { useClientSearch } from "@/composables/venta/cotizaciones/crearCotizacion/useClientSearch";
import { CUSTOMER_SEARCH_MIN_LENGTH } from "@/constants/customerSearch";

export function useQuotationImageCustomerSearch({ disabled, selectCustomer }) {
  const { clients, errorSearchClient, dataSearch, loadingSearch, searchClients } = useClientSearch();
  const showResults = ref(false);
  async function search() {
    if (disabled.value || loadingSearch.value) return;
    const term = String(dataSearch.search || "").trim();
    errorSearchClient.value = term.length < CUSTOMER_SEARCH_MIN_LENGTH;
    if (errorSearchClient.value) return;
    dataSearch.search = term;
    dataSearch.tipo = "proceso";
    const result = await searchClients();
    showResults.value = result.ok;
    return result;
  }
  
  function select(client) {
    if (disabled.value) return;
    selectCustomer(client);
    showResults.value = false;
  }
  
  function resetSearch() {
    clients.value = [];
    dataSearch.search = "";
    showResults.value = false;
    errorSearchClient.value = false;
  }
  return { clients, errorSearchClient, dataSearch, loadingSearch, showResults, search, select, resetSearch };
}

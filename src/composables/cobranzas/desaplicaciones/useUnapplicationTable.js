import axiosClient from "@/axios";
import { ref , reactive, toRef} from "vue";
import { useApiAction }  from "@/composables/core/useApiAction";
import { getStatusBadgeClass } from "@/helpers/statusBadge";
import { LIST_PER_PAGE_OPTIONS } from "@/constants/tableOptions";
export function useUnapplicationTable(){
  const { run } = useApiAction();
  const ctrl = ref(null);
  let debounceId;
  const apiList = 'cobranzas/desaplicaciones/lista';
  const table = reactive({
    items: [],
    currentPage : 1,
    totalPage: 0,
    searchTerm: "",
    perPage: "10",
    sortField: "",
    sortOrder:"desc",
    loading: false,
  });
  const loadingRef = toRef(table, 'loading');

 


  return {
     listPerpage: LIST_PER_PAGE_OPTIONS,
  }
}
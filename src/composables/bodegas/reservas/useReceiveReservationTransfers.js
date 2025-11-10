import { ref, reactive } from "vue";
import axiosClient from "@/axios";
import { swalError } from "@/functions/swal-alert.js";
import { formatJm } from "@/functions";
import { useApiAction } from "@/composables/core/useApiAction";

export function useReceiveReservationTransfers() {
  const { run } = useApiAction();
  return {};
}

import axiosClient from "@/axios";
import { useApiAction } from "@/composables/core/useApiAction";
import { ref, reactive, watch, computed, toRef } from "vue";
import { swalError, swalSuccess, swalWarning } from "@/functions/swal-alert";

export function useSearchArticle() {
    const { run } = useApiAction();
    const loadingConditionPayment = ref(false);
    const conditionPayment = ref(null);
    const apiConditions = 'obtener-condiciones-pago';


    async function fetchConditionPayment() {
        return await run(() => axiosClient.post(apiConditions), {
            loadingRef: loadingConditionPayment,
            onSuccess: (data) => {
                conditionPayment.value = data;
            }
        });
    }

    const loadingMethodPayment = ref(false);
    const methodPayment = ref(null);
    const apiMethods = 'obtener-metodos-pago';

    return {
        loadingConditionPayment,
        fetchConditionPayment,
    }
}
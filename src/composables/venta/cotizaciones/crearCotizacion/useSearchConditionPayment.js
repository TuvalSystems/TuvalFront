import axiosClient from "@/axios";
import { useApiAction } from "@/composables/core/useApiAction";
import { onScopeDispose, ref } from "vue";

export function useSearchConditionPayment() {
    const { run, invalidate } = useApiAction();
    const invalidatePaymentQueries = () => invalidate("loadingMethodPayment");
    onScopeDispose(() => {
        invalidatePaymentQueries();
        invalidate("loadingConditionPayment");
    });
    const loadingConditionPayment = ref(false);
    const conditionPayment = ref(null);
    const apiConditions = 'obtener-condiciones-pago';


    async function fetchConditionPayment() {
        return run(() => axiosClient.post(apiConditions), {
            loadingRef: loadingConditionPayment,
            latestOnly: true,
            key: "loadingConditionPayment",
            onSuccess: (data) => {
                conditionPayment.value = data;
            },
            onError: (error) => {
                console.log('Error fetching condition payment:', error);
            }
        });
    }



    const loadingMethodPayment = ref(false);
    const methodPayment = ref(null);
    const apiMethods = 'obtener-metodos-pago';

    async function fetchMethodPayment(condId) {
        return run(() => axiosClient.post(apiMethods, { condId: condId }), {
            loadingRef: loadingMethodPayment,
            latestOnly: true,
            key: "loadingMethodPayment",
            onSuccess: (data) => {
                methodPayment.value = data;
            },
            onError: (error) => {
                console.log('Error fetching method payment:', error);
            }
        });
    }


    return {
        invalidatePaymentQueries,
        loadingConditionPayment,
        fetchConditionPayment,
        conditionPayment,
        loadingMethodPayment,
        fetchMethodPayment,
        methodPayment
    }
}
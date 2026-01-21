import axiosClient from "@/axios";
import { useApiAction } from "@/composables/core/useApiAction";
import { onMounted, ref } from "vue";

export function useSearchConditionPayment() {
    const { run } = useApiAction();
    const loadingConditionPayment = ref(false);
    const conditionPayment = ref(null);
    const apiConditions = 'obtener-condiciones-pago';


    async function fetchConditionPayment() {
        return await run(() => axiosClient.post(apiConditions), {
            loadingRef: loadingConditionPayment,
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
        return await run(() => axiosClient.post(apiMethods, { condId: condId }), {
            loadingRef: loadingMethodPayment,
            onSuccess: (data) => {
                methodPayment.value = data;
            },
            onError: (error) => {
                console.log('Error fetching method payment:', error);
            }
        });
    }
   

    return {
        loadingConditionPayment,
        fetchConditionPayment,
        conditionPayment,
        loadingMethodPayment,
        fetchMethodPayment,
        methodPayment
    }
}
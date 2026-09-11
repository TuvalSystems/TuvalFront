import axiosClient from "@/axios";
import { useApiAction } from "@/composables/core/useApiAction";
import { APPROVAL_API_ROUTES } from "@/constants/apiRoutes/aprobaciones/approvalRoutes";
import { ref } from "vue";

export function useCreditOrdersActions() {
    const { run } = useApiAction();
    const detailCreditOrder = ref([]);
    const loadingDetailOrder = ref(false);
    const customerCreditStatus = ref([])
    const loadingCustomerCredit = ref(false);

    async function fetchCreditOrderDetail(orderId) {
        return run(() => axiosClient.post(APPROVAL_API_ROUTES.CREDIT.ORDERS.DETAIL, { id: orderId }), {
            loadingRef: loadingDetailOrder,
            onSuccess: (info) => {
                detailCreditOrder.value = Array.isArray(info) ? info : [];
            }
        });
    }

    async function fetchCustomerCreditStatus(orderId) {
        return run(() => axiosClient.post(APPROVAL_API_ROUTES.CREDIT.ORDERS.CUSTOMER_ACCOUNT_STATUS, { id: orderId }), {
            loadingRef: loadingCustomerCredit,
            onSuccess: (info) => {
                customerCreditStatus.value = Array.isArray(info) ? info : [];
            }
        })
    }


    const laodingCreditApproval = ref(false);
    async function approveCreditOrder(id, msg) {
        return run(() => axiosClient.post(APPROVAL_API_ROUTES.CREDIT.ORDERS.APPROVE, { id: id, msg: msg }), {
            loadingRef: laodingCreditApproval,
        });
    }

    const loadingCreditRejection = ref(false);
    async function rejectCreditOrder(id, msg) {
        return run(() => axiosClient.post(APPROVAL_API_ROUTES.CREDIT.ORDERS.REJECT, { id: id, msg: msg }), {
            loadingRef: loadingCreditRejection,
        });
    }

    const loadingCreditRejectionStock = ref(false);
    async function rejectCreditOrderForStock(id, msg) {
        return run(() => axiosClient.post(APPROVAL_API_ROUTES.CREDIT.ORDERS.REJECT_BY_STOCK, { id: id, msg: msg }), {
            loadingRef: loadingCreditRejectionStock,
        });
    }






    return {
        detailCreditOrder,
        loadingDetailOrder,
        fetchCreditOrderDetail,
        customerCreditStatus,
        loadingCustomerCredit,
        fetchCustomerCreditStatus,

        //process
        laodingCreditApproval,
        approveCreditOrder,
        loadingCreditRejection,
        rejectCreditOrder,
        loadingCreditRejectionStock, 
        rejectCreditOrderForStock


    }
}

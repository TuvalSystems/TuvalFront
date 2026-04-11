import axiosClient from "@/axios";
import { useApiAction } from "@/composables/core/useApiAction";
import { swalWarning } from "@/functions/swal-alert";
import { useStore } from 'vuex'
import { ref, computed, reactive } from "vue";
import { downloadPdfFromApi } from "@/utils/pdf";

export function useCashClosureLookup() {
    const { run } = useApiAction();
    const store = useStore();
    const ptoVtaSelect = computed(() => store.state.puntodeventaselect);

    //filtros para consulta
    const filters = reactive({
        pv_id: null,
        caja_id: null,
        fecha: null
    });

    const loadingListPv = ref(false);
    const apiListPv = 'cobranzas/lista-punto-venta';
    const listPv = ref([]);
    async function fetchListPvByUser() {
        return await run(() => axiosClient.post(apiListPv, { pto_vta_id: ptoVtaSelect.value }), {
            loadingRef: loadingListPv,
            onSuccess: (info) => {
                listPv.value = info
            },
            successMessage: "Proceso realizado exitosamente.",
        });
    }



    const apiListBox = 'cobranzas/lista-cajas';
    const loadingListBox = ref(false);
    const listBox = ref([]);
    async function fetchListBoxByUser(pvId) {
        return await run(() => axiosClient.post(apiListBox, { pv_id: pvId }), {
            loadingRef: loadingListBox,
            onSuccess: (info) => {
                listBox.value = info
            },
            successMessage: "Proceso realizado exitosamente.",
        });
    }



    async function validateFilters() {
        if (filters.pv_id == null) {
            await swalWarning("Seleccione un punto de venta.");
            return false;
        }
        if (filters.caja_id == null) {
            await swalWarning("Seleccione una caja.");
            return false;
        }
        if (filters.fecha == null) {
            await swalWarning("Seleccione una fecha.");
            return false;
        }
        return true;
    }

    const apiCashClosure = 'cobranzas/consultas/cierre-caja';
    const loadingCashClosure = ref(false);
    const cashClosure = ref(null);
    async function fetchCashClosure() {
        return await run(() => axiosClient.post(apiCashClosure, filters), {
            loadingRef: loadingCashClosure,
            onSuccess: (info) => {
                cashClosure.value = info
            },
            successMessage: "Proceso realizado exitosamente.",
        })

    }

    async function clearCashClosure() {
        cashClosure.value = null
    }


    const apiPrintConsultByUser = 'cobranzas/pdf/cierre-caja-usuario';
    const loadingPrintConsultByUser = ref(false);
    async function printPdfConsultByUser() {
        return await run(async () => {
            const res = await downloadPdfFromApi({
                url: apiPrintConsultByUser,
                method: "POST",
                payload: filters,
                filenameFallback: "consulta-cierre-caja.pdf",
            });

            if (!res.ok) {
                return {
                    data: {
                        success: false,
                        error: res.message || "La caja no se encuentra cerrada"
                    }
                };
            }
            return { data: { success: true, data: res.filename } };
        }, {
            loadingRef: loadingPrintConsultByUser,
            successMessage: "Documento generado exitosamente.",
            onError: (error) => {
                console.log(error);
            }
        });
    }


    const apiPrintConsult = 'cobranzas/pdf/cierre-caja';
    const loadingPrintConsult = ref(false);
    async function printPdfCashClosure() {
        return await run(async () => {
            const res = await downloadPdfFromApi({
                url: apiPrintConsult,
                method: "POST",
                payload: filters,
                filenameFallback: "cierre-de-caja.pdf",
            });

            if (!res.ok) {
                return {
                    data: {
                        success: false,
                        error: res.message || "La caja no se encuentra cerrada"
                    }
                };
            }
            return { data: { success: true, data: res.filename } };
        }, {
            loadingRef: loadingPrintConsult,
            successMessage: "Documento generado exitosamente.",
            onError: (error) => {
                console.log(error);
            }
        });
    }


    return {
        //filters
        filters,
        //punto de venta
        loadingListPv,
        listPv,
        fetchListPvByUser,

        //cajas
        loadingListBox,
        listBox,
        fetchListBoxByUser,

        //consulta
        validateFilters,
        loadingCashClosure,
        fetchCashClosure,
        cashClosure,
        clearCashClosure,

        //print
        printPdfConsultByUser,
        printPdfCashClosure

    };
}
/** maneja el detalle del recibido de reserva */
import { ref } from "vue";
import axiosClient from "@/axios";
import { useApiAction } from "@/composables/core/useApiAction";
import { downloadFileFromApi } from "@/utils/pdf";
export function useReservationTransferReceipt() {
    const { run } = useApiAction();
    const data = ref([]);
    const loading = ref(false);
    const apiSearchDetail = 'bodegas/reservas/guia-remision/detalle-transferencias-por-recibir';



    function sanitize(row) {
        let v = String(row.recibir_ahora ?? "").replace(",", ".");
        let n = parseFloat(v);
        if (!Number.isFinite(n)) n = 0;
        const max = Number(row.pending_received ?? 0);
        row.recibir_ahora = Math.min(Math.max(n, 0), max);
    }


    /** obtener detalle */
    async function fetchDetail(guiaId) {
        return run(() => axiosClient.post(apiSearchDetail, { id: guiaId }), {
            loadingRef: loading,
            successMessage: "Proceso realizado exitosamente.",
            onSuccess: (rows) => {
                const prev = new Map(data.value.map(r => [r.id, r.recibir_ahora]));
                data.value = (Array.isArray(rows) ? rows : []).map(r => ({
                    ...r,
                    // Si ya tenía un valor (por ejemplo, el usuario lo editó), lo conservamos;
                    // si no, por defecto usamos pending_received.
                    recibir_ahora: prev.has(r.id)
                        ? prev.get(r.id)
                        : Number(r?.pending_received ?? 0)
                }));
            }
        })
    }


    /** generar pdf de orden de almacenamiento */
    const loadingPdf = ref(false);
    const apiPrintPdf = 'bodegas/reservas/guia-remision/detalle-transferencias-por-recibir/pdf';
    async function printPdfOrderStorage(id) {

        return await run(async () => {
            const filename = await downloadFileFromApi({
                url: apiPrintPdf,
                method: "POST",
                payload: { id },
                filenameFallback: "orden-almacenamiento.pdf",
            });
            return { data: { success: true, data: filename } };
        }, {
            loadingRef: loadingPdf,
            successMessage: "Documento generado exitosamente.",
            onError: (error) => {
                console.log(error);
            }
        });

    }


    /** recibir items de reserva tranferidos*/
    const loadingReceived = ref(false);
    const apiProcessReceivedItems = 'bodegas/reservas/guia-remision/detalle-transferencias-por-recibir/recibir';
    async function processReceivedItems(payload) {
        return run(() => axiosClient.post(apiProcessReceivedItems, payload), {
            loadingRef: loadingReceived,
            successMessage: "Proceso realizado exitosamente.",
        });
    }


    return {
        data,
        loading,
        fetchDetail,
        loadingPdf,
        loadingReceived,
        printPdfOrderStorage,
        sanitize,
        processReceivedItems
    }
}
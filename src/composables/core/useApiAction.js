import { ref } from "vue";
export function useApiAction() {
    const loading = ref(false);

    async function run(requestFn, { loadingRef, onSuccess, onError, successMessage } = {}) {
        const targetLoading = loadingRef ?? loading;
        targetLoading.value = true;
        try {
            const response = await requestFn();
            const data = response?.data ?? {};
            const ok = data.success === true;
            const info = data.data ?? {};
            const msg =
                data.message ||
                (ok
                    ? successMessage || "Operación realizada correctamente"
                    : "No se pudo completar la operación.");
            if (!ok) throw new Error(data.error || msg);
            onSuccess && onSuccess(info, data);
            return { ok: true, data: info, raw: data, message: msg };
        } catch (error) {
            const backend = error?.response?.data ?? {};
            const msg =
                backend.error ||
                backend.message ||
                error?.message ||
                "Ocurrió un error al procesar la solicitud.";
            onError && onError(backend, error);
            return { ok: false, data: backend, raw: error, message: msg };
        } finally {
            targetLoading.value = false;
        }
    }
    return {
        loading,
        run,
    };
}

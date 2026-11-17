import { ref, getCurrentScope, onScopeDispose } from "vue";

//contador para manejar loading por ref (concurrencia/abort)
const loadingCounters = new WeakMap();
function inc(r) { const c = (loadingCounters.get(r) ?? 0) + 1; loadingCounters.set(r, c); return c; }
function dec(r) { const c = Math.max(0, (loadingCounters.get(r) ?? 1) - 1); loadingCounters.set(r, c); return c; }
function isAbortError(err) { return err?.name === 'AbortError' || err?.code === 'ERR_CANCELED' || err?.message === 'canceled'; }

export function useApiAction() {
    const loading = ref(false);
    let disposed = false;
    if (getCurrentScope()) onScopeDispose(() => { disposed = true; });
    const canceled = () => ({ ok: false, canceled: true, stale: true, message: 'Cancelado' });
    // Las instancias de una misma pantalla no deben descartar respuestas entre sí.
    const latestSeq = new Map();
    function nextSeq(key) { const n = (latestSeq.get(key) ?? 0) + 1; latestSeq.set(key, n); return n; }

    async function run(requestFn, { loadingRef, errorRef, onSuccess, onError, successMessage, latestOnly = false, key } = {}) {
        if (disposed) return canceled();
        const targetLoading = loadingRef ?? loading;
        inc(targetLoading);
        targetLoading.value = true;
        if (errorRef) errorRef.value = "";

        // 👇 ID de esta llamada si queremos "solo la última" por clave
        const seqId = latestOnly && key ? nextSeq(key) : null;
        try {
            const response = await requestFn();
            if (disposed) return canceled();
            const data = response?.data ?? {};
            const ok = data.success === true || data.exists === true;
            const info = data.data ?? {};
            const msg = data.message || (ok ? successMessage || "Operación realizada correctamente" : "No se pudo completar la operación.");

            if (!ok) throw new Error(data.error || msg);
            // 👇 descarta respuestas viejas si ya hubo otra más reciente con la misma key
            if (latestOnly && key && seqId !== latestSeq.get(key)) {
                return { ok: true, data: info, raw: data, message: msg, stale: true };
            }
            onSuccess && onSuccess(info, data);
            return { ok: true, data: info, raw: data, message: msg };
        } catch (error) {
            if (disposed) return canceled();
            if (isAbortError(error)) {
                return { ok: false, canceled: true, raw: error, message: "Cancelado" };
            }
            const status = error.response?.status || error.status || 500;
            const backend = error?.response?.data ?? error?.data ?? {};
            let msg = backend.error || backend.message || error?.message || "Ocurrió un error al procesar la solicitud.";

            if (backend.errors && typeof backend.errors === 'object') {
                const firstValidationError = Object.values(backend.errors).flat().shift();
                if (firstValidationError) {
                    msg = firstValidationError;
                }
            }

            // También descarta fallos HTTP y de negocio de peticiones anteriores.
            if (latestOnly && key && seqId !== latestSeq.get(key)) {
                return { ok: false, data: backend, raw: error, message: msg, status, stale: true };
            }
            if (error.handledByRedirect) {
                return { ok: false, data: backend, raw: error, message: msg, status, handled: true };
            }
            if (errorRef) errorRef.value = msg;
            onError && onError(backend, error);
            return { ok: false, data: backend, raw: error, message: msg , status: status };
        } finally {
            if (dec(targetLoading) === 0) targetLoading.value = false;
        }
    }
    return {
        loading,
        run,
        invalidate: nextSeq,
    };
}

// Una sola escritura activa; cada borrador conserva únicamente su última versión pendiente.
export function createDraftSaveQueue({ save, onState, getSignature = JSON.stringify }) {
    const pending = new Map();
    const saved = new Map();
    const failed = new Set();
    const suspended = new Set();
    let running = null;
    let active = null;
    let activeSignature = null;
    let disposed = false;

    function enqueue(payload) {
        const id = payload.draft_id;
        if (disposed || suspended.has(id)) return false;
        const signature = getSignature(payload);
        if (pending.has(id) && getSignature(pending.get(id)) === signature) return false;
        if (active === id && activeSignature === signature) {
            pending.delete(id);
            return false;
        }
        if (active !== id && !failed.has(id) && saved.get(id) === signature) {
            if (pending.delete(id)) onState(id, 'saved', '');
            return false;
        }
        pending.set(id, payload);
        failed.delete(id);
        onState(id, active === id ? 'saving' : 'pending', '');
        return true;
    }

    function flush() {
        if (running) return running;
        running = Promise.resolve().then(async () => {
            while (!disposed) {
                const entry = [...pending].find(([id]) => !failed.has(id) && !suspended.has(id));
                if (!entry) break;
                const [id, payload] = entry;
                pending.delete(id);
                active = id;
                activeSignature = getSignature(payload);
                onState(id, 'saving', '');
                let result;
                try {
                    result = await save(payload);
                } catch (error) {
                    result = { ok: false, message: error?.message };
                }
                active = null;
                activeSignature = null;
                if (disposed || suspended.has(id)) continue;
                if (!result?.ok) {
                    // Si hubo más cambios, el reintento debe enviar esos cambios, no la copia fallida.
                    if (!pending.has(id)) pending.set(id, payload);
                    failed.add(id);
                    onState(id, 'error', result?.message || 'No se pudo guardar el borrador.');
                } else {
                    saved.set(id, getSignature(payload));
                    if (!pending.has(id)) onState(id, 'saved', '');
                }
            }
            return pending.size === 0;
        }).finally(() => { running = null; });
        return running;
    }

    function retry(id) {
        failed.delete(id);
        return flush();
    }

    async function suspend(id) {
        suspended.add(id);
        pending.delete(id);
        failed.delete(id);
        if (active === id) await running;
        saved.delete(id);
        onState(id, 'idle', '');
    }

    return {
        enqueue,
        markSaved: payload => { saved.set(payload.draft_id, getSignature(payload)); },
        flush,
        retry,
        suspend,
        resume: id => suspended.delete(id),
        hasPending: () => active !== null || pending.size > 0,
        dispose: () => { disposed = true; pending.clear(); saved.clear(); },
    };
}

// Una sola escritura activa; cada borrador conserva únicamente su última versión pendiente.
export function createDraftSaveQueue({ save, onState }) {
    const pending = new Map();
    const failed = new Set();
    const suspended = new Set();
    let running = null;
    let active = null;
    let disposed = false;

    function enqueue(payload) {
        const id = payload.draft_id;
        if (disposed || suspended.has(id)) return;
        pending.set(id, payload);
        failed.delete(id);
        onState(id, active === id ? 'saving' : 'pending', '');
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
                onState(id, 'saving', '');
                let result;
                try {
                    result = await save(payload);
                } catch (error) {
                    result = { ok: false, message: error?.message };
                }
                active = null;
                if (disposed || suspended.has(id)) continue;
                if (!result?.ok) {
                    // Si hubo más cambios, el reintento debe enviar esos cambios, no la copia fallida.
                    if (!pending.has(id)) pending.set(id, payload);
                    failed.add(id);
                    onState(id, 'error', result?.message || 'No se pudo guardar el borrador.');
                } else if (!pending.has(id)) {
                    onState(id, 'saved', '');
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
        onState(id, 'idle', '');
    }

    return {
        enqueue,
        flush,
        retry,
        suspend,
        resume: id => suspended.delete(id),
        hasPending: () => active !== null || pending.size > 0,
        dispose: () => { disposed = true; pending.clear(); },
    };
}

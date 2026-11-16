// El bloqueo se toma antes de validar/preparar datos y se libera incluso si falla la acción.
export function createSubmissionGuard() {
    let running = false;
    return async function submit(action) {
        if (running) return { ok: false, skipped: true };
        running = true;
        try {
            return await action();
        } finally {
            running = false;
        }
    };
}

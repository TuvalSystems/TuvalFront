// Conserva el paso confirmado durante la vida de la pantalla, incluso entre reintentos.
// Tras recargar, persistentSubmission y el backend recuperan los pasos confirmados.
export function createOrderCompletion() {
    const pending = new Map();

    return async function complete(key, prepare) {
        let operation = pending.get(key);
        if (!operation) {
            const actions = prepare();
            const order = await actions.createOrder();
            if (!order?.ok) return order;
            operation = { order, updateQuote: actions.updateQuote };
            pending.set(key, operation);
        }

        const quotation = await operation.updateQuote();
        if (!quotation?.ok) {
            return {
                ...quotation,
                ok: false,
                message: 'El pedido ya se creó. Vuelva a pulsar Guardar Pedido para reintentar únicamente la actualización de la cotización. ' + (quotation?.message || ''),
            };
        }
        pending.delete(key);
        return operation.order;
    };
}

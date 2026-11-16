const databaseName = 'tuval-guardados';
const storeName = 'solicitudes';

function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(databaseName, 1);
        request.onupgradeneeded = () => request.result.createObjectStore(storeName, { keyPath: 'context' });
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
        request.onblocked = () => reject(new Error('Cierre las otras pestañas para preparar el guardado.'));
    });
}

// La identidad depende del borrador y del usuario, no de la pestaña o del intento.
function operationKey(context, part) {
    const [, , draft, kind] = JSON.parse(context);
    const actions = {
        'cotizacion:create': 'quote_create',
        'cotizacion:update': 'quote_update',
        pedido: 'order',
        conversion: part === 'order' ? 'order' : 'quote_update',
    };
    const action = actions[kind];
    const key = `save_${draft}_${action}`;
    if (!action || !/^[a-zA-Z0-9_-]{16,80}$/.test(key)) {
        throw new Error('El identificador del borrador no permite un guardado seguro.');
    }
    // El servidor añade usuario y tipo a la identidad. No requiere HTTPS/Web Crypto.
    return key;
}

export async function preparePersistentSubmission(context, prepare) {
    const db = await openDatabase();
    // Una única transacción impide que dos pestañas sustituyan la solicitud original.
    try {
        return await new Promise((resolve, reject) => {
            const tx = db.transaction(storeName, 'readwrite');
            const store = tx.objectStore(storeName);
            const request = store.get(context);
            let record;
            let preparationError;
            request.onsuccess = () => {
                record = request.result;
                if (record) return;
                try {
                    const parts = prepare();
                    record = { context, parts: Object.fromEntries(Object.entries(parts).map(([name, data]) => [name, Array.from(data.entries())])) };
                    store.add(record);
                } catch (error) {
                    preparationError = error;
                    tx.abort();
                }
            };
            tx.oncomplete = () => resolve(record);
            tx.onabort = () => reject(preparationError || tx.error || new Error('No se pudo conservar la solicitud de guardado.'));
            tx.onerror = () => reject(tx.error);
        });
    } finally {
        db.close();
    }
}

export async function persistentRequest(record, part) {
    const data = new FormData();
    for (const [name, value] of record.parts[part]) {
        if (value instanceof Blob) data.append(name, value, value.name || 'archivo');
        else data.append(name, value);
    }
    return { data, config: { headers: { 'Idempotency-Key': operationKey(record.context, part) } } };
}

export async function discardPersistentSubmission(context) {
    const db = await openDatabase();
    try {
        await new Promise((resolve, reject) => {
            const tx = db.transaction(storeName, 'readwrite');
            tx.objectStore(storeName).delete(context);
            tx.oncomplete = resolve;
            tx.onabort = () => reject(tx.error);
            tx.onerror = () => reject(tx.error);
        });
    } finally {
        db.close();
    }
}

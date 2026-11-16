import { computed } from "vue";
import { freightUnitPrice } from "@/functions/freightPrice";

export function useQuoteValidation({ form, isActivePricefreight }) {
    const toFreightCents = (value) => {
        if (value === null || value === undefined || value === '') return 0;
        const amount = Number(value);
        if (!Number.isFinite(amount) || amount < 0) return null;
        const cents = Math.round(amount * 100);
        // No admitir fracciones de centavo que no se puedan guardar como moneda.
        return Number.isSafeInteger(cents) && Math.abs(amount * 100 - cents) < 0.000001
            ? cents : null;
    };

    function validateItemLWeights() {
        const index = form.value.items.findIndex((item) =>
            (item.ART_TIPO_COMPRA || '').trim().toUpperCase() === 'L'
            && (!Number.isFinite(Number(item.ART_PESO)) || Number(item.ART_PESO) <= 0)
        );
        return index < 0 ? '' : `Debe ingresar un peso mayor a cero para el ítem L de la fila ${index + 1}.`;
    }

    function validateDispatchFields() {
        if (![3, 4, 5].includes(Number(form.value.tipo_despacho_id))) return '';
        const providerId = Number(form.value.fle_proveedor_id);
        if (!Number.isSafeInteger(providerId) || providerId <= 0) {
            return 'Debe seleccionar un proveedor de despacho.';
        }
        const amount = toFreightCents(form.value.fle_valor);
        if (amount === null || amount <= 0) {
            return 'Debe ingresar un monto de flete válido mayor a cero.';
        }
        return '';
    }

    // Esta consulta es pura: también se usa desde los computed de los botones.
    function validateFreightTotal() {
        const dispatchId = Number(form.value.tipo_despacho_id);
        if (![4, 5].includes(dispatchId)) return true;
        const amountHeader = toFreightCents(form.value.fle_valor);
        if (amountHeader === null) return false;
        if (!isActivePricefreight()) return true;
        const amounts = form.value.items.map((item) => toFreightCents(item.fle_valor));
        return form.value.items.every((item) => freightUnitPrice(item) !== null)
            && amounts.every((amount) => amount !== null)
            && amounts.reduce((total, amount) => total + amount, 0) === amountHeader;
    }

    const isQuoteValid = computed(() => {
        if (validateItemLWeights()) return false;
        if (!form.value.items || form.value.items.length === 0) return false;

        return form.value.items.every((item) => {
            const tipoCompra = (item.ART_TIPO_COMPRA || '').trim().toUpperCase();

            // A. Validación de Cantidad
            const cantidad = Number.parseFloat(item.ART_CANTIDAD || 0);
            if (cantidad <= 0 || item.errorCantidad) return false;

            // B. Validación de Precio (Costo)
            const precio = Number.parseFloat(item.ART_VALOR || 0);
            if (precio <= 0 && tipoCompra !== 'SERV') return false;

            if (tipoCompra === 'L') {
                const descActual = (item.ART_DESCRIPCION || '').toString().trim();
                const descOriginal = (item.ART_DESCRIPCION_ORIGINAL || '').toString().trim();
                if (descActual === descOriginal || descActual.length < 5) return false;
            }
            if (tipoCompra === 'L') {
                if (!item.proveedores_listo) return false;
            } else if (tipoCompra !== 'SERV') {
                // C. Validación de Stock para tipos que no son 'L' ni 'SERV'
                if (!item.stockListo) return false;
            }

            return true;
        });

    });

    return { validateItemLWeights, validateDispatchFields, validateFreightTotal, isQuoteValid };
}

// monto_flete es el total neto asignado a la línea, antes de IVA.
export function freightUnitPrice(item) {
    const freight = Number(item.monto_flete) || 0;
    if (freight === 0) return 0;
    const quantity = Number(item.ART_CANTIDAD) || 0;
    const discount = Number(item.descuento) || 0;
    if (quantity <= 0 || discount < 0 || discount >= 100) return null;
    return freight / (quantity * (1 - discount / 100));
}

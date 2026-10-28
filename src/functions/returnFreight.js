// Display only: the backend rebuilds these prices from the saved order on submission.
export function projectReturnItems(items, dispatchType, includeFreight) {
  return items.map(item => {
    if (dispatchType !== 'flete al cobro' || includeFreight || Number(item.fle_valor || 0) <= 0) {
      return { ...item };
    }
    const price = Number(item.precio_sin_flete);
    return {
      ...item,
      ART_VALOR: price,
      ART_DESCUENTO: Math.round((price * Number(item.descuento || 0) / 100 + 0.000001) * 10000) / 10000,
    };
  });
}

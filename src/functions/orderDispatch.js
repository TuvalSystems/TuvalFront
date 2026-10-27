export function validateInvoiceExistingDispatch(pedido) {
  return {
    invalid: [3, 4].includes(Number(pedido?.tipo_despacho_id)),
    message:
      'No puede facturar lo existente de un pedido con tipo de despacho paquetería o flete al cobro.',
  };
}

export const DISPATCH_TYPE = Object.freeze({
  WAREHOUSE_PICKUP: 1,
  ROUTE: 2,
  PACKAGE: 3,
  COLLECT_FREIGHT: 4,
  PROVIDER: 5,
});

export function dispatchSelectionMode(dispatchTypeId) {
  const id = Number(dispatchTypeId);
  if (id === DISPATCH_TYPE.PACKAGE) return "package";
  if (id === DISPATCH_TYPE.COLLECT_FREIGHT) return "collect";
  return "normal";
}

export function providerDeliversItem(item) {
  if (String(item.ART_TIPO_COMPRA ?? "").trim().toUpperCase() !== "L") return false;
  const providers = item.proveedores ?? [];
  // Los proveedores antiguos sin check explícito se consideran entrega del proveedor.
  return providers.length === 0 || providers.some((provider) =>
    provider.proveedor_entrega == null || [true, 1, "1"].includes(provider.proveedor_entrega)
  );
}

export function guideGroup(items, mode) {
  return items.filter((item) => Number(item.pendiente) > 0 &&
    (mode === "collect" ? Number(item.fle_valor) > 0 :
      mode === "package" ? !providerDeliversItem(item) : true));
}

export function validateGuideSelection(items, mode) {
  const selected = items.filter((item) => Number(item.seleccionado) > 0);
  if (!selected.length) return "Seleccionar al menos un ítem para generar la guía";
  if (mode === "normal") return "";
  if (selected.some((item) => Number(item.seleccionado) !== Number(item.pendiente))) {
    return "Debe despachar la cantidad pendiente completa de cada ítem seleccionado";
  }
  if (mode === "package" && selected.some(providerDeliversItem)) {
    return selected.every(providerDeliversItem) ? "" :
      "Los ítems L que entrega el proveedor deben generarse en una guía independiente";
  }
  const group = guideGroup(items, mode);
  if (selected.some((item) => !group.includes(item))) {
    return "Solo puede seleccionar ítems con un monto de flete mayor que cero";
  }
  if (group.some((item) => Number(item.seleccionado) !== Number(item.pendiente))) {
    return mode === "package" ? "Paquetería requiere despachar todos los ítems; los L que entrega el proveedor salen por separado" :
      "Debe seleccionar todos los ítems con un monto de flete mayor que cero";
  }
  return "";
}

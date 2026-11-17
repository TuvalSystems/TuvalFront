const queryKeys = {
  'ventas-crearcotizacion': ['draft', 'mode', 'id', 'tipo', 'cliente_id', 'sucursal', 'cliente_nuevo'],
  'ventas-cotizaciones': ['pvId', 'pvCodigo', 'cotizacion', 'estado'],
  'ventas-crearcliente': ['tipo', 'documento', 'cotizacion_id', 'cotizacion'],
};
const listRoutes = {
  'bodegas-transferencias-venta-detalle': 'bodegas-transferenciasventa',
  'bodegas-transferenciasreposicionbodega': 'bodegas-transferenciasreposicion',
  'bodegas-reservas-transferencias-detalle': 'bodegas-reservas-transferencias',
};

export function rutaParaPuntoVenta(route) {
  if (listRoutes[route.name]) return { name: listRoutes[route.name] };
  const query = { ...route.query };
  for (const key of queryKeys[route.name] || []) delete query[key];
  return { path: route.path, query, hash: route.hash };
}

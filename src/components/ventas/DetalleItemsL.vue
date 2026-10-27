<script setup>
import { format, format4 } from "@/functions";

defineProps({
  proveedores: { type: Array, default: () => [] },
  mostrarOrdenCompra: { type: Boolean, default: false },
});
</script>

<template>
  <div class="item-l-detail table-responsive">
    <table class="item-l-table">
      <thead>
        <tr>
          <th scope="col">Descripción L</th>
          <th v-if="mostrarOrdenCompra" scope="col">Orden de compra</th>
          <th scope="col" class="text-end">Cantidad</th>
          <th scope="col" class="text-end">Precio de venta mínimo</th>
          <th scope="col" class="text-end">Margen</th>
          <th scope="col" class="text-end">Costo unitario</th>
          <th scope="col" class="text-end">Subtotal</th>
          <th scope="col" class="text-end">Impuesto</th>
          <th scope="col" class="text-end">Total</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(proveedor, indice) in proveedores" :key="indice">
          <td>{{ proveedor.DESCRIPCION_ARTICULO }}</td>
          <td v-if="mostrarOrdenCompra">
            <template v-if="proveedor.orden_detalle && proveedor.orden_detalle.length">
              <div v-for="(orden, index) in proveedor.orden_detalle" :key="index">
                {{ orden.ORDEN_COMPRA_DOCUMENTO || '—' }}
              </div>
            </template>
            <span v-else>—</span>
          </td>
          <td class="text-end">{{ proveedor.CANTIDAD }}</td>
          <td class="text-end text-danger">${{ proveedor.margen }}</td>
          <td class="text-end">{{ proveedor.MARGEN }}%</td>
          <td class="text-end">${{ proveedor.COSTO_UNITARIO }}</td>
          <td class="text-end">${{ format4(parseFloat(proveedor.TOTAL)) }}</td>
          <td class="text-end">${{ format4(parseFloat(proveedor.IMPUESTO)) }}</td>
          <td class="text-end">${{ format(parseFloat(proveedor.TOTALCONIMPUESTO)) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.item-l-detail {
  padding: 0.75rem;
  background-color: var(--tuval-surface-muted);
  color: var(--tuval-text);
}

.item-l-table {
  width: 100%;
  color: var(--tuval-text);
}

.item-l-table th,
.item-l-table td {
  padding: 0.375rem 0.75rem;
  vertical-align: top;
}

.item-l-table th {
  border-bottom: 1px solid var(--tuval-border-strong);
}

.item-l-table tbody tr + tr td {
  border-top: 1px solid var(--tuval-border);
}

.item-l-table td.text-end {
  white-space: nowrap;
}

.item-l-table th:first-child {
  min-width: 12rem;
}
</style>

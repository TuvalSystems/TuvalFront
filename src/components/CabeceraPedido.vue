<template>
  <div class="table-responsive">
    <table class="table table-striped table-sm table-vcenter">
      <tbody>
        <tr v-if="verpedido.factura != ''">
          <th class="fs-sm">Factura</th>
          <td class="fs-sm">{{ verpedido.factura }}</td>
          <th v-if="verpedido.cotizacion" class="fs-sm">Cotización Origen</th>
          <td v-if="verpedido.cotizacion" class="fs-sm">{{ verpedido.cotizacion }}</td>
          <td v-if="!verpedido.cotizacion" class="fs-sm" colspan="2"></td>

          <th v-if="verpedido.pedido_origen" class="fs-sm">Pedido Origen</th>
          <td v-if="verpedido.pedido_origen" class="fs-sm">{{ verpedido.pedido_origen }}</td>
          <td v-if="!verpedido.pedido_origen" class="fs-sm" colspan="2"></td>
        </tr>
        <tr>
          <th class="fs-sm">Pedido</th>
          <td class="fs-sm">{{ verpedido.pedido }}</td>
          <th class="fs-sm">RUC</th>
          <td class="fs-sm">{{ verpedido.CLI_RUC }}</td>
          <th class="fs-sm">Razón Social</th>
          <td class="fs-sm">{{ verpedido.CLI_RAZON_SOCIAL }}</td>
        </tr>
        <tr>
          <th class="fs-sm">P. de venta</th>
          <td class="fs-sm">
            {{ verpedido.PTO_VTA_DESCRIPCION }}
          </td>

          <th class="fs-sm">Cond. Pago</th>
          <td class="fs-sm">
            <a class="text-danger" v-if="verpedido.COND_ID != verpedido.COND_ID_ORIGINAL"
              @click="verdiferenciacondicion(verpedido)" href="javascript:void(0);">{{ verpedido.COND_ID }}</a>
            <span v-else>{{ verpedido.COND_ID }}</span>
          </td>
          <th class="fs-sm">Usuario</th>
          <td class="fs-sm">{{ verpedido.USERID }}</td>

        </tr>
        <tr>
          <th class="fs-sm">Bodega</th>
          <td class="fs-sm">
            {{ verpedido.BOD_BODEGA }}
          </td>
          <th class="fs-sm">% Descuento</th>
          <td class="fs-sm">
            <a class="text-danger" v-if="verpedido.porcentage_descuento != verpedido.porcentage_descuentooriginal"
              @click="verdiferenciaporcentaje(verpedido)" href="javascript:void(0);">{{ verpedido.porcentage_descuento
              }}</a>
            <span v-else>{{ verpedido.porcentage_descuento }}</span>
          </td>

          <th class="fs-sm">Fecha Factura</th>
          <td class="fs-sm">
            {{ verpedido.fecha_factura }}
          </td>
        </tr>
        <tr v-if="verpedido.despacho == 'Despacho en ruta'">
          <th>Dirección entrega</th>
          <td colspan="5">{{ verpedido.direccion_entrega.CLI_SUC_DIRECCION }} - {{
            verpedido.direccion_entrega.CLI_SUC_CIUDAD }}</td>
        </tr>
        <tr>
          <th class="fs-sm">Origen</th>
          <td class="fs-sm">
            <span :class="[
              'badge rounded-pill fw-semibold d-inline-block py-2 px-3 fs-xs text-uppercase',
              {
                'bg-info-light text-info': verpedido.origen === 'cotizacion',
                'bg-warning-light text-warning': verpedido.origen === 'reserva',
                'bg-success-light text-success': verpedido.origen === 'factura_demanda',
                'bg-primary-light text-primary': verpedido.origen === 'facturar_existente',
                'bg-danger-light text-danger': verpedido.origen === 'devolucion'
              }
            ]">
              {{
                verpedido.origen === 'factura_demanda' ? 'Factura Demanda' :
                  (verpedido.origen === 'facturar_existente' ? 'Facturar Existente' : verpedido.origen)
              }}
            </span>
          </td>
          <th class="fs-sm">Factura Posterior Despacho</th>
          <td class="fs-sm">
            <span v-if="verpedido.factura_posterior_despacho == 1"
              class="badge rounded-pill fw-bold py-2 px-3 bg-info-light text-info">
              SI
            </span>

            <span v-else class="badge rounded-pill fw-medium py-2 px-3 bg-light text-danger border ">
              NO
            </span>
          </td>
          <th class="fs-sm">Factura Sgt. Mes</th>
          <td class="fs-sm">
            <span v-if="verpedido.factura_siguiente_mes == 1"
              class="badge rounded-pill fw-bold py-2 px-3 bg-info-light text-info ">
              SI
            </span>
            <span v-else class="badge rounded-pill fw-medium py-2 px-3 bg-light text-warning border ">
              NO
            </span>
          </td>
        </tr>


        <tr v-if="segmento && segmento.data && Object.keys(segmento.data).length">
          <th>Segmento</th>
          <td>{{ segmento.data.segmento }}</td>
          <th>Subsegmento</th>
          <td colspan="3">{{ segmento.data.subsegmento }}</td>
        </tr>
        <tr v-else>
          <td colspan="5" class="text-muted">Sin segmento para este cliente</td>
        </tr>

      </tbody>
    </table>
  </div>
</template>
<script setup>
import { swalInfo } from "@/functions/swal-alert";

const { verpedido } = defineProps({
  verpedido: Object,
  segmento: Object
})



function verdiferenciacondicion(pedido) {
  swalInfo('Cambio condición de pago', 'de <b>' + pedido.COND_ID_ORIGINAL + '</b> a <b>' + pedido.COND_ID + '</b>');
}

function verdiferenciaporcentaje(pedido) {
  let msg = 'simon';
  swalInfo('Cambio porcentaje de descuento', 'de <b>' + pedido.porcentage_descuentooriginal + '%</b> a <b>' + pedido.porcentage_descuento + '%</b>');
}
</script>
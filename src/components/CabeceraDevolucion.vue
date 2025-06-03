<template>
  <div class="table-responsive" v-if="verdevolucion.cliente">
    <table class="table table-striped table-sm table-vcenter">
      <tbody>
        <tr>
          <th class="fs-sm">Devolución</th>
          <td class="fs-sm">{{verdevolucion.devolucion}}</td>
          <th class="fs-sm">Factura</th>
          <td class="fs-sm">{{verdevolucion.factura}}</td>
          <th v-if="verdevolucion.DOC_GENERADO" class="fs-sm">Nota de crédito</th>
          <td v-if="verdevolucion.DOC_GENERADO" class="fs-sm">{{verdevolucion.DOC_GENERADO}}</td>
          <td v-if="!verdevolucion.DOC_GENERADO" class="fs-sm" colspan="2"></td>
        </tr>
        <tr>
          <th class="fs-sm">Pedido</th>
          <td class="fs-sm">{{verdevolucion.pedido}}</td>
          <th class="fs-sm">RUC</th>
          <td class="fs-sm">{{verdevolucion.cliente.CLI_RUC}}</td>
          <th class="fs-sm">Razón Social</th>
          <td class="fs-sm">{{verdevolucion.cliente.CLI_RAZON_SOCIAL}}</td>
        </tr>
        <tr>
          <th class="fs-sm">Usuario</th>
          <td class="fs-sm">{{verdevolucion.USERID}}</td>
          <th class="fs-sm">Fecha/hora</th>
          <td class="fs-sm">
            {{ verdevolucion.created_at }}
          </td>
          <th class="fs-sm">Estado</th>
          <td class="fs-sm">
            <span class="badge rounded-pill fw-semibold d-inline-block py-2 px-3 mx-1 fs-xs"
              @click="verdevolucion.estado == 'rechazado' && verdevolucion.aprobado_mensaje ? swalWarning(verdevolucion.aprobado_mensaje) : ''"
              :class="
                verdevolucion.aprobado_mensaje ? 'pointer bg-danger-light text-danger':'' ||
                verdevolucion.estado == 'procesado' ? 'bg-success-light text-success': '' ||
                verdevolucion.estado == 'aprobado' ? 'bg-info-light text-info': '' ||
                verdevolucion.estado == 'solicitado' ? 'bg-black-50': '' ||
                verdevolucion.estado == 'espera' ? 'bg-warning-light text-warning': '' ||
                verdevolucion.estado == 'rechazado' ? 'bg-danger-light text-danger': '' ||
                verdevolucion.estado == 'anulada' ? 'bg-danger-light text-danger': '' ||
                verdevolucion.estado == 'recibido' ? 'bg-success-light text-info': ''
                "
              >
              {{ verdevolucion.estado }}</span>
          </td>
        </tr>
        <tr>
          <th class="fs-sm">Orden Despacho</th>
          <td>
            <span v-if="verdevolucion.orden_despacho" class="fs-xs fw-semibold d-inline-block py-1 px-3 rounded-pill bg-success-light text-success mx-1">
              <i class="fa fa-check-circle"></i> Si
            </span>
            <span v-else class="fs-xs fw-semibold d-inline-block py-1 px-3 rounded-pill bg-danger-light text-danger mx-1">
              <i class="fa fa-xmark"></i> No
            </span>
          </td>
          <th class="fs-sm">Despachada</th>
          <td>
            <span v-if="(verdevolucion.despachado === 1)" class="fs-xs fw-semibold d-inline-block py-1 px-3 rounded-pill bg-info-light text-info mx-1" title="Despachado">
              <i class="fa fa-truck-fast"></i>
            </span>
            <span v-else class="fs-xs fw-semibold d-inline-block py-1 px-3 rounded-pill bg-danger-light text-danger mx-1" title="No despachada">
              <i class="fa fa-xmark"></i> No
            </span>
          </td>
          <th class="fs-sm">Refactura</th>
          <td>
            <span v-if="verdevolucion.volver_a_facturar === 1" class="fs-xs fw-semibold d-inline-block py-1 px-3 rounded-pill bg-success-light text-success mx-1" title="Despachado">
              <i class="fa fa-check-circle"></i> Si
            </span>
            <span v-else class="fs-xs fw-semibold d-inline-block py-1 px-3 rounded-pill bg-danger-light text-danger mx-1" title="Despachado">
              <i class="fa fa-xmark"></i> No
            </span>
          </td>
        </tr>
        <tr>
          <th>Motivo de devolución</th>
          <td>{{verdevolucion.motivo}}</td>
          <th class="fs-sm">Fecha Factura</th>
          <td colspan="4" >{{verdevolucion.fecha_factura }}</td>
        </tr>
        <template v-if="verdevolucion.volver_a_facturar === 1 && (verdevolucion.cliente_id !== verdevolucion.cliente_volver_a_facturar_id)">
          <tr>
            <th class="fs-sm">Facturar a cliente</th>
            <td>{{verdevolucion.cliente_volver_a_facturar.CLI_RAZON_SOCIAL}}</td>
            <th class="fs-sm">Facturar a RUC</th>
            <td colspan="3">{{verdevolucion.cliente_volver_a_facturar.CLI_RUC}}</td>

          </tr>
          <tr>
            <th class="fs-sm">Facturar a dirección</th>
            <td colspan="5">{{verdevolucion.sucursal_volver_a_facturar.CLI_SUC_ID_DIRECCION}} - {{verdevolucion.sucursal_volver_a_facturar.CLI_SUC_DIRECCION}}</td>
          </tr>
        </template>

      </tbody>
    </table>
  </div>
</template>
<script setup>
import { swalSimple, swalInfo, swalSuccess, swalWarning, swalError, toast } from "@/functions/swal-alert.js";
const { verdevolucion } = defineProps({
  verdevolucion: Object,
})
</script>
<script setup>
import { formatPriceJm } from "@/functions";

defineProps({
    data: {
        type: Array,
        required: true
    },
    total: {
        type: [Number, String],
        required: true
    },

});
</script>

<template>
    <div class="d-flex justify-content-between align-items-end mb-1 border-bottom border-2 border-primary pb-1 px-1">
        <span class="fs-xs fw-bold text-uppercase text-muted">
            <i class="fa fa-file-invoice-dollar me-1 text-danger"></i> Retenciones
        </span>
        <span class="fs-sm fw-bold text-primary">
            Total: ${{ formatPriceJm(total) }}
        </span>
    </div>

    <div class="table-responsive">
        <table class="table table-sm table-vcenter border-bottom fs-xs">
            <thead>
                <tr class="text-muted bg-body-light">
                    <th class="py-2" style="width: 10%;">Recibo / Comprobante</th>
                    <th class="py-2 text-center d-none d-md-table-cell" style="width: 10%;">Factura</th>
                    <th class="py-2 text-center d-none d-md-table-cell" style="width: 10%;">F.Emisión</th>
                    <th class="py-2 text-center d-none d-md-table-cell" style="width: 10%;">F.Vencimiento</th>
                    <th class="py-2">Detalle Cliente</th>
                    <th class="py-2 text-end" style="width: 8%;">Ret.Iva</th>
                    <th class="py-2 text-end" style="width: 8%;">Ret.Renta</th>
                    <th class="py-2 text-end" style="width: 8%;">Ret.IVA Srv.</th>
                    <th class="py-2 text-end" style="width: 8%;">Ret.Renta Srv.</th>
                    <th class="py-2 text-center d-none d-md-table-cell" style="width: 10%;">Fecha</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(saldo, index) in data" :key="index">
                    <td>
                        <div class="fw-bold text-dark">{{ saldo.numero_recibo }}</div>
                        <div class="text-info" style="font-size: 0.65rem;">{{ saldo.ret_comprobante }}</div>
                    </td>
                    <td>
                        <div class="fw-bold text-dark">{{ saldo.ret_factura }}</div>
                    </td>
                    <td class="text-center text-muted d-none d-md-table-cell" style="font-size: 0.7rem;">
                        {{ saldo.ret_fecha_emision }}
                    </td>
                    <td class="text-center text-muted d-none d-md-table-cell" style="font-size: 0.7rem;">
                        {{ saldo.ret_fecha_vencimiento }}
                    </td>
                    <td>
                        <div class="fw-medium text-truncate" style="max-width: 550px;">{{ saldo.CLI_RAZON_SOCIAL }}
                        </div>
                        <div class="text-muted" style="font-size: 0.65rem;">{{ saldo.CLI_RUC }} </div>
                    </td>
                    <td class="text-end text-muted">
                        {{ saldo.ret_porcentaje_iva }}% - ${{ formatPriceJm(saldo.ret_iva) }}
                    </td>
                    <td class="text-end fw-bold text-primary">
                        {{ saldo.ret_porcentaje_renta }}% - ${{ formatPriceJm(saldo.ret_renta) }}
                    </td>
                    <td class="text-end fw-bold text-primary">
                        <div class="fw-bold text-dark" v-if="saldo.ret_iva_srv > 0">
                            {{ saldo.ret_porcentaje_iva_srv }}% - ${{ formatPriceJm(saldo.ret_iva_srv) }}
                        </div>
                        <div v-else class="text-muted"> - </div>
                    </td>
                    <td class="text-end fw-bold text-primary">
                        <div class="fw-bold text-dark" v-if="saldo.ret_renta_srv > 0">
                            {{ saldo.ret_porcentaje_renta_srv }}% - ${{ formatPriceJm(saldo.ret_renta_srv) }}
                        </div>
                        <div v-else class="text-muted"> - </div>
                    </td>
                    <td class="text-center text-muted d-none d-md-table-cell" style="font-size: 0.7rem;">
                        {{ saldo.fecha }}
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

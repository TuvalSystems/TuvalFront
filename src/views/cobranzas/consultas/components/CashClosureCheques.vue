<script setup>
import {formatPriceJm} from "@/functions";
defineProps({
    data: {
        type: Array,
        required: true
    },
    total: {
        type: [Number, String],
        required: true
    },
    type: {
        type: Number,
        default: 1,
        required: true
    }
});
</script>

<template>
    <div class="d-flex justify-content-between align-items-end mb-1 border-bottom border-2 pb-1 px-1 animated fadeIn"
        :class="type === 1 ? 'border-success' : 'border-warning'">
        <span class="fs-xs fw-bold text-uppercase text-muted">
            <i class="fa fa-money-check-alt me-1" :class="type === 1 ? 'text-success' : 'text-warning'"></i>
            {{ type === 1 ? 'Cheques al día' : 'Cheques Posfechados' }}
        </span>

        <span class="fs-sm fw-bold" :class="type === 1 ? 'text-success' : 'text-warning'">
            Total: ${{ formatPriceJm(total) }}
        </span>
    </div>

    <div class="table-responsive">
        <table class="table table-sm table-vcenter border-bottom fs-xs">
            <thead>
                <tr class="text-muted bg-body-light">
                    <th class="py-2 " style="width: 15%;">Recibo / Cheque</th>
                    <th class="py2 text-center d-none d-md-table-cell" style="width: 10%;">Banco / Cuenta</th>
                    <th class="py2 text-center d-none d-md-table-cell" style="width: 10%;">F.Emision</th>
                    <th class="py2 text-center d-none d-md-table-cell" style="width: 10%;">F.Vencimiento</th>
                    <th class="py-2">Detalle Cliente</th>
                    <th class="py-2 text-end" style="width: 10%;">Monto</th>
                    <th class="py-2 text-end text-primary" style="width: 10%;">Aplicado</th>
                    <th class="py-2 text-center d-none d-md-table-cell" style="width: 15%;">Fecha</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(saldo, index) in data" :key="index">
                    <td>
                        <div class="fw-bold text-dark">{{ saldo.numero_recibo }}</div>
                        <div class="text-info" style="font-size: 0.65rem;">{{ saldo.cheque }}</div>
                    </td>
                    <td>
                        <div class="fw-bold text-dark">{{ saldo.CB_DESCRIPCION }}</div>
                        <div class="text-info" style="font-size: 0.65rem;">{{ saldo.cuenta }}</div>
                    </td>
                    <td class="text-center text-muted d-none d-md-table-cell" style="font-size: 0.7rem;">
                        {{ saldo.fecha_emision }}
                    </td>
                    <td class="text-center text-muted d-none d-md-table-cell" style="font-size: 0.7rem;">
                        {{ saldo.fecha_vencimiento }}
                    </td>
                    <td>
                        <div class="fw-medium text-truncate" style="max-width: 550px;">{{ saldo.CLI_RAZON_SOCIAL }}
                        </div>
                        <div class="text-muted" style="font-size: 0.65rem;">{{ saldo.CLI_RUC }} </div>
                    </td>
                    <td class="text-end text-muted">
                        ${{ formatPriceJm(saldo.monto) }}
                    </td>
                    <td class="text-end fw-bold text-primary">
                        ${{ formatPriceJm(saldo.aplicado) }}
                    </td>
                    <td class="text-center text-muted d-none d-md-table-cell" style="font-size: 0.7rem;">
                        {{ saldo.fecha }}
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

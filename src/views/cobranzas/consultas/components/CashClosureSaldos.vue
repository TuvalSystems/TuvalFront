<script setup>
import { formatPrice } from "@/functions";
defineProps({
    data: Array,
    total: [Number, String]
});
</script>

<template>
    <div class="d-flex justify-content-between align-items-end mb-1 border-bottom border-2 border-primary pb-1 px-1">
        <span class="fs-xs fw-bold text-uppercase text-muted">
            <i class="fa fa-exchange-alt me-1 text-primary"></i> Aplicación de Saldos
        </span>
        <span class="fs-sm fw-bold text-primary">
            Total: ${{ formatPrice(total) }}
        </span>
    </div>

    <div class="table-responsive">
        <table class="table table-sm table-vcenter border-bottom fs-xs">
            <thead>
                <tr class="text-muted bg-body-light">
                    <th class="py-2" style="width: 15%;">Recibo / Tipo</th>
                    <th class="py2 text-start" style="width: 15%;">Cobro</th>
                    <!-- <th class="py2" style="width: 15%;">Factura Aplicada</th> -->
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
                        <div class="text-info" style="font-size: 0.65rem;">{{ saldo.tipo }}</div>
                    </td>
                    <td>{{ saldo.cobro }}</td>
                    <!-- <td>{{ saldo.id_factura || '-' }}</td> -->
                    <td>
                        <div class="fw-medium text-truncate" style="max-width: 550px;">{{ saldo.CLI_RAZON_SOCIAL }}
                        </div>
                        <div class="text-muted" style="font-size: 0.65rem;">{{ saldo.CLI_RUC }} </div>
                    </td>
                    <td class="text-end text-muted">
                        ${{ formatPrice(saldo.monto) }}
                    </td>
                    <td class="text-end fw-bold text-primary">
                        ${{ formatPrice(saldo.aplicado) }}
                    </td>
                    <td class="text-center text-muted d-none d-md-table-cell" style="font-size: 0.7rem;">
                        {{ saldo.fecha }}
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>


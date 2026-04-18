<script setup lang="ts">
const props = defineProps({
    direccion: {
        type: Object,
        required: true,
    },
})
</script>

<template>
    <div class="content-fluid">
        <div class="row g-2 mb-2">
            <div class="col-6 col-lg-4">
                <div class="kv">
                    <small class="text-muted"> Ruc</small>
                    <div class="fw-semibold">{{ direccion.CLI_SUC_RUC || 'N/A' }}</div>
                </div>
            </div>
            <div class="col-6 col-lg-4">
                <div class="kv">
                    <small class="text-muted">Descripción</small>
                    <div class="fw-semibold">{{ direccion.CLI_SUC_DESCRIPCION }}</div>
                </div>
            </div>
            <div class="col-12 col-lg-12">
                <div class="kv">
                    <small class="text-muted"> Dirección</small>
                    <div class="fw-semibold">{{ direccion.CLI_SUC_DIRECCION }}</div>
                </div>
            </div>
            <div class="col-6 col-lg-4">
                <div class="kv">
                    <small class="text-muted">Referencia</small>
                    <div class="fw-semibold">{{ direccion.CLI_SUC_REFERENCIA || 'N/A' }}</div>
                </div>
            </div>
            <div class="col-6 col-lg-4">
                <div class="kv">
                    <small class="text-muted">Teléfono</small>
                    <div class="fw-semibold">{{ direccion.CLI_SUC_TELEFONO || 'N/A' }}</div>
                </div>
            </div>
            <div class="col-6 col-lg-4">
                <div class="kv">
                    <small class="text-muted">Contacto</small>
                    <div class="fw-semibold">{{ direccion.CLI_SUC_CONTACTO || 'N/A' }}</div>
                </div>
            </div>



            <div class="col-6 col-lg-4">
                <div class="kv">
                    <small class="text-muted">Territorio</small>
                    <div class="fw-semibold">{{ direccion.CLI_SUC_TERRITORIO || 'N/A' }}</div>
                </div>
            </div>
            <div class="col-6 col-lg-4">
                <div class="kv">
                    <small class="text-muted">Provincia</small>
                    <div class="fw-semibold">{{ direccion.CLI_SUC_PROVINCIA || 'N/A' }}</div>
                </div>
            </div>
            <div class="col-6 col-lg-4">
                <div class="kv">
                    <small class="text-muted">Ciudad</small>
                    <div class="fw-semibold">{{ direccion.CLI_SUC_CIUDAD || 'N/A' }}</div>
                </div>
            </div>


        </div>
    </div>
</template>


<style scoped>
.kv small {
    display: block;
    line-height: 2;
}

.kv .badge2 {
    white-space: normal;
    text-align: left;
    display: block;
    line-height: 1.4;
    font-weight: 12px;
}

.kv .fw-semibold {
    line-height: 1.2;
}

.text-monospace {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
}

@media (min-width: 992px) {
    .table.table-sm> :not(caption)>*>* {
        padding-top: .35rem;
        padding-bottom: .35rem;
    }
}

.code {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace;
    font-size: 14px;
}
</style>
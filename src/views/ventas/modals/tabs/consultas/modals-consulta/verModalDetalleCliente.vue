<script setup>
import { onMounted } from 'vue';
import { useClientSearch } from "@/composables/venta/cotizaciones/crearCotizacion/useClientSearch";

const props = defineProps({
    cliente: {
        type: Object,
        required: true,
    },
    sucursales: {
        type: Array,
        required: true
    }
})
const {
    //validations
    getClientStatus,

} = useClientSearch();
onMounted(() => { });
</script>

<template>
    <BaseBlock v-if="cliente && sucursales" class="mb-2" title="Detalle del Cliente" mode-loading-content>
        <!-- detalle del cliente -->
        <div class="row g-1 mb-2">
            <div class="col-6 col-lg-6">
                <div class="kv">
                    <small class="text-muted  text-uppercase fw-bold" style="font-size: 10px;">Ruc</small>
                    <div class="fw-semibold text-truncate">{{ cliente.CLI_RUC }}</div>
                </div>
            </div>
            <div class="col-6 col-lg-6">
                <div class="kv">
                    <small class="text-muted  text-uppercase fw-bold" style="font-size: 10px;">Razón Social</small>
                    <div class="fw-semibold text-truncate">{{ cliente.CLI_RAZON_SOCIAL }}</div>
                </div>
            </div>
            <div class="col-6 col-lg-6">
                <div class="kv">
                    <small class="text-muted  text-uppercase fw-bold" style="font-size: 10px;">Dirección</small>
                    <div class="fw-semibold ">{{ cliente.CLI_DIRECCION }}</div>
                </div>
            </div>
            <div class="col-6 col-lg-6">
                <div class="kv">
                    <small class="text-muted  text-uppercase fw-bold" style="font-size: 10px;">Ciudad</small>
                    <div class="fw-semibold ">{{ cliente.CLI_CIUDAD }}</div>
                </div>
            </div>
            <div class="col-6 col-lg-6">
                <div class="kv">
                    <small class="text-muted  text-uppercase fw-bold" style="font-size: 10px;">Provincia</small>
                    <div class="fw-semibold ">{{ cliente.CLI_PROVINCIA }}</div>
                </div>
            </div>
            <div class="col-6 col-lg-6">
                <div class="kv">
                    <small class="text-muted  text-uppercase fw-bold" style="font-size: 10px;">Territorio</small>
                    <div class="fw-semibold ">{{ cliente.CLI_TERRITORIO }}</div>
                </div>
            </div>
            <div class="col-6 col-lg-6">
                <div class="kv">
                    <small class="text-muted  text-uppercase fw-bold" style="font-size: 10px;">Estado</small>
                    <span
                        :class="cliente.CLI_ESTADO == 'INACTIVO' ? 'bg-danger-light text-danger' : 'bg-success-light text-success'"
                        class="fs-xs fw-semibold d-inline-block py-1 px-3 rounded-pill">{{ cliente.CLI_ESTADO }}</span>
                </div>
            </div>
            <div class="col-6 col-lg-6">
                <div class="kv">
                    <small class="text-muted  text-uppercase fw-bold" style="font-size: 10px;">Teléfono 1</small>
                    <div class="fw-semibold ">{{ cliente.CLI_TELEFONO_1 }}</div>
                </div>
            </div>
            <div class="col-6 col-lg-6">
                <div class="kv">
                    <small class="text-muted  text-uppercase fw-bold" style="font-size: 10px;">Teléfono 2</small>
                    <div class="fw-semibold ">{{ cliente.CLI_TELEFONO_2 || '-' }}</div>
                </div>
            </div>
            <div class="col-6 col-lg-6">
                <div class="kv">
                    <small class="text-muted  text-uppercase fw-bold" style="font-size: 10px;">Teléfono 3</small>
                    <div class="fw-semibold ">{{ cliente.CLI_TELEFONO_3 || '-' }}</div>
                </div>
            </div>
            <div class="col-6 col-lg-6">
                <div class="kv">
                    <small class="text-muted  text-uppercase fw-bold" style="font-size: 10px;">Teléfono 4</small>
                    <div class="fw-semibold ">{{ cliente.CLI_TELEFONO_4 || '-' }}</div>
                </div>
            </div>
            <div class="col-6 col-lg-6">
                <div class="kv">
                    <small class="text-muted  text-uppercase fw-bold" style="font-size: 10px;">Correo</small>
                    <div class="fw-semibold ">{{ cliente.CLI_CORREO_ELECT_SRI || '-' }}</div>
                </div>
            </div>
            <div class="col-6 col-lg-6">
                <div class="kv">
                    <small class="text-muted  text-uppercase fw-bold" style="font-size: 10px;">Vendedor</small>
                    <div class="fw-semibold ">{{ cliente.gpvendedor.VEND_NOMBRES || '' }} {{
                        cliente.gpvendedor.VEND_APELLIDOS || '-' }}</div>
                </div>
            </div>
            <div class="col-6 col-lg-6">
                <div class="kv">
                    <small class="text-muted  text-uppercase fw-bold" style="font-size: 10px;">Descuento
                        Comercial</small>
                    <div class="fw-semibold ">{{ cliente.CLI_DSTO_COMERCIAL }} %</div>
                </div>
            </div>
            <div class="col-6 col-lg-6">
                <div class="kv">
                    <small class="text-muted  text-uppercase fw-bold" style="font-size: 10px;">Condición de Pago</small>
                    <div class="fw-semibold ">{{ cliente.CLI_CONDICION_PAGO }}</div>
                    <span class="badge bg-info" v-if="cliente.CLI_DIA_GRACIA_CHEQUE_A_FECHA > 0">{{
                        cliente.CLI_DIA_GRACIA_CHEQUE_A_FECHA }} días de gracia</span>
                </div>
            </div>
            <div class="col-6 col-lg-6">
                <div class="kv">
                    <small class="text-muted  text-uppercase fw-bold" style="font-size: 10px;">Suspendido</small>
                    <span class="fs-xs fw-semibold d-inline-block py-1 px-3 rounded-pill"
                        :class="getClientStatus(cliente.suspendido).class">
                        {{ getClientStatus(cliente.suspendido).text }}
                    </span>
                </div>
            </div>
            <div class="col-6 col-lg-6">
                <div class="kv">
                    <small class="text-muted  text-uppercase fw-bold" style="font-size: 10px;">Nivel de Precio</small>
                    <div class="fw-semibold ">{{ cliente.CLI_NIVEL_PRECIO || '-' }}</div>
                </div>
            </div>
            <div class="col-6 col-lg-6">
                <div class="kv">
                    <small class="text-muted  text-uppercase fw-bold" style="font-size: 10px;">Monto Crédito</small>
                    <div class="fw-semibold "> $ {{ cliente.CLI_MONTO_CREDITO || '-' }}</div>
                </div>
            </div>
            <div class="col-6 col-lg-6">
                <div class="kv">
                    <small class="text-muted  text-uppercase fw-bold" style="font-size: 10px;">Grupo</small>
                    <div class="fw-semibold ">{{ cliente.CLI_GRUPO || '-' }}</div>
                </div>
            </div>
            <div class="col-6 col-lg-6">
                <div class="kv">
                    <small class="text-muted  text-uppercase fw-bold" style="font-size: 10px;">Subgrupo</small>
                    <div class="fw-semibold ">{{ cliente.CLI_SUBGRUPO || '-' }}</div>
                </div>
            </div>

        </div>

        <!-- sucursales -->
        <div class="block-header block-header-default px-0 mb-3 mt-4 bg-transparent border-bottom">
            <h3 class="block-title fs-sm">
                <i class="fa fa-map-marked-alt me-1 text-muted"></i> Sucursales Registradas ({{ sucursales.length }})
            </h3>
        </div>
        <div class="row g-2">
            <div class="col-sm-6" v-for="(sucursal, index) in sucursales" :key="index">
                <div class="p-2 border rounded-3 bg-body-light h-100 shadow-sm border-2 border-opacity-10">
                    <div class="d-flex align-items-center mb-1">
                        <span class="badge bg-dark rounded-pill me-2">#{{ sucursal.CLI_SUC_ID_DIRECCION }}</span>
                        <span class="fw-bold fs-xs text-uppercase text-primary">{{ sucursal.CLI_SUC_TERRITORIO }}</span>
                        <span
                            :class="sucursal.estado === 0 ? 'bg-danger-light text-danger' : 'bg-success-light text-success'"
                            class="fs-xs fw-semibold d-inline-block py-1 px-3 rounded-pill"> {{ sucursal.estado === 0 ?
                            'Inactivo' : 'Activo' }}</span>
                    </div>
                    <div class="ps-1">
                        <p class="fw-medium mb-1 fs-sm text-dark text-uppercase fw-bold" style="font-size: 10px;">{{
                            sucursal.CLI_SUC_DIRECCION }}</p>
                        <div class="fs-xs text-muted">
                            <i class="fa fa-city me-1"></i> {{ sucursal.CLI_SUC_CIUDAD }}, {{ sucursal.CLI_SUC_PROVINCIA
                            }}
                        </div>
                        <div v-if="sucursal.CLI_SUC_TELEFONO" class="fs-xs text-muted">
                            <i class="fa fa-phone me-1"></i> {{ sucursal.CLI_SUC_TELEFONO || '-' }}
                        </div>
                        <div class="fs-xs mt-1">
                            <a :href="'mailto:' + sucursal.CLI_SUC_CORREO_ELECTRONICO_SRI" class="text-decoration-none">
                                <i class="fa fa-envelope me-1"></i> {{ sucursal.CLI_SUC_CORREO_ELECTRONICO_SRI || '-' }}
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </BaseBlock>
    <div class="block-content block-content-full text-end bg-body">
        <div class="d-flex justify-content-end gap-2">
            <button type="button" class="btn btn-danger btn-sm" data-bs-dismiss="modal">Cerrar</button>
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
    font-weight: 10px;
}


.kv .fw-semibold {
    line-height: 1.1;
}
</style>

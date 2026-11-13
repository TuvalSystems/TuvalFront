<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import BaseTable from "@/components/BaseTable.vue";
import axiosClient from "@/axios";
import { useApiAction } from "@/composables/core/useApiAction";
const { run } = useApiAction();
const busy = ref(false);
const error = ref("");
const aviso = ref("");
const config = ref(null);
const reporte = ref(null);
const paginaUsuarios = ref(1);
const usuariosPorPagina = 10;
const columnasTokens = [
  { key: "inputTokens", label: "Entrada", align: "text-end" },
  { key: "outputTokens", label: "Salida", align: "text-end" },
  { key: "accountedTokens", label: "Contabilizado", align: "text-end" },
];
const columnasUsuarios = [
  { key: "usuario", label: "Usuario" },
  { key: "llamadas", label: "Llamadas", align: "text-end" },
  ...columnasTokens,
];
const columnasRegistros = [
  { key: "fecha", label: "Fecha" },
  { key: "usuario", label: "Usuario" },
  { key: "operacion", label: "Operación / modelo" },
  { key: "estado", label: "Estado" },
  ...columnasTokens,
];
const usuarios = computed(() => reporte.value?.usuarios ?? []);
const paginasUsuarios = computed(() => Math.max(1, Math.ceil(usuarios.value.length / usuariosPorPagina)));
const usuariosVisibles = computed(() => usuarios.value.slice(
  (paginaUsuarios.value - 1) * usuariosPorPagina, paginaUsuarios.value * usuariosPorPagina
));
function cambiarPaginaUsuarios(page) {
  if (!busy.value && page >= 1 && page <= paginasUsuarios.value) paginaUsuarios.value = page;
}
function cambiarPaginaRegistros(page) {
  if (!busy.value && page >= 1 && page <= reporte.value.ultimaPagina) consultar(page);
}
const fechaLocal = () => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Guayaquil", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
const hoy = fechaLocal();
const filtros = reactive({ desde: hoy.slice(0, 7) + "-01", hasta: hoy, userId: "" });
const campos = [
  { key: "limiteDiarioUsuario", label: "Tokens diarios por usuario", min: 0, max: 1000000000 },
  { key: "limiteMensualUsuario", label: "Tokens mensuales por usuario", min: 0, max: 1000000000 },
  { key: "limiteMensualGlobal", label: "Tokens mensuales de todos los usuarios", min: 0, max: 2000000000 },
  { key: "maxEntrada", label: "Máximo de entrada por llamada", min: 1000, max: 100000 },
  { key: "maxSalida", label: "Máximo de salida por llamada", min: 256, max: 6000 },
];
const base = "sistemas/inteligencia-artificial";
const opciones = { skipMaintenanceRedirect: true };
async function cargar() {
  const result = await run(() => axiosClient.get(`${base}/configuracion`, opciones), { loadingRef: busy });
  if (result.ok) config.value = result.data;
  else error.value = result.message;
}
async function guardar() {
  error.value = ""; aviso.value = "";
  const body = Object.fromEntries(["habilitado", ...campos.map(c => c.key)].map(k => [k, config.value[k]]));
  const result = await run(() => axiosClient.put(`${base}/configuracion`, body, opciones), { loadingRef: busy });
  if (result.ok) { config.value = result.data; aviso.value = "Configuración guardada. Se aplica a las nuevas llamadas."; }
  else error.value = result.message;
}
async function consultar(page = 1) {
  error.value = "";
  const result = await run(() => axiosClient.get(`${base}/consumos`, { ...opciones, params: { ...filtros, userId: filtros.userId || undefined, page } }), { loadingRef: busy });
  if (result.ok) {
    reporte.value = result.data;
    paginaUsuarios.value = 1;
  }
  else error.value = result.message;
}
onMounted(async () => { await cargar(); if (config.value) await consultar(); });
</script>
<template>
  <BasePageHeading title="Inteligencia artificial" subtitle="Sistemas · Límites de tokens y consumo por usuario" />
  <div class="content">
    <div v-if="error" class="alert alert-danger" role="alert">{{ error }}</div>
    <div v-if="aviso" class="alert alert-success" role="status">{{ aviso }}</div>
    <BaseBlock v-if="config" title="Control de uso" content-full>
      <form @submit.prevent="guardar">
        <div class="form-check form-switch mb-3"><input id="ia-habilitada" v-model="config.habilitado" type="checkbox" class="form-check-input" :disabled="busy" /><label class="form-check-label" for="ia-habilitada">Permitir nuevas llamadas a IA</label></div>
        <div class="row">
          <div v-for="campo in campos" :key="campo.key" class="col-md-6 col-xl-4 mb-3">
            <label :for="campo.key" class="form-label">{{ campo.label }}</label>
            <input :id="campo.key" v-model.number="config[campo.key]" type="number" step="1" :min="campo.min" :max="campo.max" required class="form-control" :disabled="busy" />
          </div>
        </div>
        <p class="text-muted fs-sm">Las cuotas suman entrada y salida. Antes de generar se reserva la entrada contada más el máximo de salida; luego se ajusta al consumo informado. Un valor de cuota 0 bloquea el uso. Los períodos siguen la zona horaria del servidor TUVAL.</p>
        <p class="text-muted fs-sm">Los límites incluyen la lectura de imágenes. Una reserva de consumo desconocido se mantiene para evitar exceder el cupo. No representa necesariamente el consumo facturado.</p>
        <button class="btn btn-primary" :disabled="busy">Guardar límites</button>
      </form>
    </BaseBlock>
    <BaseBlock v-if="config" title="Consumo por usuario" content-full>
      <form class="row align-items-end mb-3" @submit.prevent="consultar(1)">
        <div class="col-md-3 mb-2"><label for="ia-desde" class="form-label">Desde</label><input id="ia-desde" v-model="filtros.desde" type="date" class="form-control" required /></div>
        <div class="col-md-3 mb-2"><label for="ia-hasta" class="form-label">Hasta</label><input id="ia-hasta" v-model="filtros.hasta" type="date" class="form-control" required /></div>
        <div class="col-md-3 mb-2"><label for="ia-usuario" class="form-label">ID de usuario (opcional)</label><input id="ia-usuario" v-model="filtros.userId" type="number" min="1" class="form-control" /></div>
        <div class="col-md-3 mb-2"><button class="btn btn-alt-primary" :disabled="busy">Consultar</button></div>
      </form>
      <template v-if="reporte">
        <div class="bg-body-light p-3 rounded mb-3">Entrada: <strong>{{ reporte.totales.inputTokens }}</strong> · Salida: <strong>{{ reporte.totales.outputTokens }}</strong> · Contabilizado para límites: <strong>{{ reporte.totales.accountedTokens }}</strong></div>
        <h3 class="h6">Resumen por usuario (hasta 200 usuarios con mayor consumo)</h3>
        <BaseTable
          :columns="columnasUsuarios" :data="usuariosVisibles" :loading="busy"
          :perPage="String(usuariosPorPagina)" :totalItems="usuarios.length"
          :currentPage="paginaUsuarios" :totalPage="paginasUsuarios"
          @onPageChange="cambiarPaginaUsuarios"
        >
          <template #cell-usuario="{ row }">{{ row.usuario || 'Usuario' }} ({{ row.userId }})</template>
          <template #cell-inputTokens="{ value }">{{ value ?? 'Desconocido' }}</template>
          <template #cell-outputTokens="{ value }">{{ value ?? 'Desconocido' }}</template>
          <template #empty>No hay consumo registrado en este período.</template>
        </BaseTable>
        <h3 class="h6 mt-4">Detalle de llamadas</h3>
        <BaseTable
          :columns="columnasRegistros" :data="reporte.registros" :loading="busy"
          perPage="30" :totalItems="reporte.totalRegistros ?? 0"
          :currentPage="reporte.pagina" :totalPage="reporte.ultimaPagina"
          @onPageChange="cambiarPaginaRegistros"
        >
          <template #cell-usuario="{ row }">{{ row.usuario || 'Usuario' }} ({{ row.userId }})</template>
          <template #cell-operacion="{ row }">{{ row.operacion }}<br />{{ row.modelo }}</template>
          <template #cell-inputTokens="{ value }">{{ value ?? 'Desconocido' }}</template>
          <template #cell-outputTokens="{ value }">{{ value ?? 'Desconocido' }}</template>
          <template #empty>No hay consumo registrado en este período.</template>
        </BaseTable>
      </template>
    </BaseBlock>
  </div>
</template>

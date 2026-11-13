<script setup>
import { onMounted, reactive, ref } from "vue";
import axiosClient from "@/axios";
import { useApiAction } from "@/composables/core/useApiAction";
const { run } = useApiAction();
const busy = ref(false);
const error = ref("");
const aviso = ref("");
const config = ref(null);
const reporte = ref(null);
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
  if (result.ok) reporte.value = result.data;
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
        <p class="text-muted fs-sm">Los límites incluyen la lectura de imágenes y los mensajes. Una reserva de consumo desconocido se mantiene para evitar exceder el cupo. No representa necesariamente el consumo facturado.</p>
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
        <div class="table-responsive"><table class="table table-striped table-vcenter">
          <caption>Resumen por usuario (hasta 200 usuarios con mayor consumo)</caption>
          <thead><tr><th>Usuario</th><th>Llamadas</th><th>Entrada</th><th>Salida</th><th>Contabilizado</th></tr></thead>
          <tbody><tr v-for="u in reporte.usuarios" :key="u.userId"><td>{{ u.usuario || 'Usuario' }} ({{ u.userId }})</td><td>{{ u.llamadas }}</td><td>{{ u.inputTokens ?? 'Desconocido' }}</td><td>{{ u.outputTokens ?? 'Desconocido' }}</td><td>{{ u.accountedTokens }}</td></tr></tbody>
        </table></div>
        <div class="table-responsive"><table class="table table-striped table-vcenter fs-sm">
          <caption>Detalle de llamadas</caption>
          <thead><tr><th>Fecha</th><th>Usuario</th><th>Operación / modelo</th><th>Estado</th><th>Entrada</th><th>Salida</th><th>Contabilizado</th></tr></thead>
          <tbody><tr v-for="r in reporte.registros" :key="r.id"><td>{{ r.fecha }}</td><td>{{ r.usuario }} ({{ r.userId }})</td><td>{{ r.operacion }}<br />{{ r.modelo }}</td><td>{{ r.estado }}</td><td>{{ r.inputTokens ?? 'Desconocido' }}</td><td>{{ r.outputTokens ?? 'Desconocido' }}</td><td>{{ r.accountedTokens }}</td></tr><tr v-if="!reporte.registros.length"><td colspan="7">No hay consumo registrado en este período.</td></tr></tbody>
        </table></div>
        <div class="d-flex gap-3 align-items-center"><button class="btn btn-alt-secondary btn-sm" :disabled="busy || reporte.pagina <= 1" @click="consultar(reporte.pagina - 1)">Anterior</button><span>Página {{ reporte.pagina }} / {{ reporte.ultimaPagina }}</span><button class="btn btn-alt-secondary btn-sm" :disabled="busy || reporte.pagina >= reporte.ultimaPagina" @click="consultar(reporte.pagina + 1)">Siguiente</button></div>
      </template>
    </BaseBlock>
  </div>
</template>

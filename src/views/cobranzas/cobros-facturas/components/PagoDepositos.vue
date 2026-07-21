<script setup>
import { onMounted, toRefs } from 'vue';
const emit = defineEmits(['add-deposit', 'remove-deposit']);
const props = defineProps({
  facturas: {
    type: Array,
    required: true,
    default: () => []
  },
  bancosTuval: {
    type: Array,
    required: true,
    default: () => []
  },
  depositos: {
    type: Array,
    default: () => []
  }
});

const {
  facturas,
  bancosTuval,
  depositos
} = toRefs(props);




</script>

<template>
  <section class="deposit-entry">
    <div class="deposit-toolbar">
      <div class="min-w-0">
        <span class="deposit-kicker"> Deposito o Transferencia</span>
        <h4 class="deposit-title"> Ingreso de depositos</h4>
      </div>
    </div>
    <div class="deposit-section">
      <div class="section-heading">
        <div class="section-icon section-icon-success">
          <i class="fa fa-money-bill-transfer fa-fw me-3"></i>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="css" scoped>
.label-small {
  display: block;
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--tuval-text-muted, var(--bs-secondary-color));
  margin-bottom: 0.18rem;
}

.deposit-entry {
  display: grid;
  gap: 0.65rem;
  max-width: 100%;
}

.deposit-entry,
.deposit-entry * {
  min-width: 0;
}

.deposit-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.deposit-kicker {
  display: block;
  color: var(--tuval-text-muted, var(--bs-secondary-color));
  font-size: 0.64rem;
  font-weight: 800;
  text-transform: uppercase;
}

.min-w-0 {
  min-width: 0;
}


.deposit-title {
  margin: 0.1rem 0 0;
  color: var(--tuval-text, var(--bs-body-color));
  font-size: 0.92rem;
  font-weight: 800;
  line-height: 1.25;
}

.deposit-section {
  padding: 0.65rem 0.75rem;
  border: 1px solid var(--tuval-border, var(--bs-border-color));
  border-radius: var(--tuval-radius-md, 8px);
  background: var(--bs-body-bg);
  max-width: 100%;
}
</style>

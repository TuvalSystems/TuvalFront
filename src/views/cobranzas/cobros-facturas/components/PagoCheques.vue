<script setup>
import { onMounted , toRefs} from 'vue';


// componentes
import { useInvoiceCollectionActions } from '@/composables/cobranzas/cobros-facturas/useInvoiceCollectionActions';
import { useInvoiceCollectionChecks } from '@/composables/cobranzas/cobros-facturas/useInvoiceCollectionChecks';


const props = defineProps({
  facturas: {
    type: Array,
    required: true,
    default: () => []
  },
  cheque: {
    type: Object,
    default: () => { }
  },
  cliente: {
    type: Object,
    default: () => ({})
  },
  bancosCliente: {
    type: Array,
    required: true,
    default: () => []
  },
  loadingDocs: {
    type: Boolean,
    required: true,
    default: () => false
  }
});

const {
  facturas,
  cheque,
  cliente,
  bancosCliente,
} = toRefs(props);

const {
  loadingCheckReceiptValidation,
  validateCheckReceiptNumber
} = useInvoiceCollectionActions();


const { } = useInvoiceCollectionChecks({
  facturas,
  cheque,
  cliente,
  bancosCliente
});


onMounted(() => { });
</script>

<template>
  <div>
    <h1>cheques</h1>
  </div>
</template>

<style lang="css" scoped></style>

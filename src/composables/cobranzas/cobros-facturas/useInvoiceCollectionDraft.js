import { computed, reactive } from "vue";
import { useStore } from 'vuex'

function createEmptyDraft() {
    return {
        cliente_id: null,
        retenciones: [],
        cheque: null,
        depositos: [],
        efectivo: null,
        tarjetas: [],
        aplicaciones: [],
        pvCodigo: null,
        pvId : null,
        referencia: "",
    }
}
export function useInvoiceCollectionDraft() {
    const store = useStore();
    const selectedPointSaleId = computed(() => store.state.puntoventaselectid);
    const selectedPointSaleCode = computed(() => store.state.puntodeventaselect);
    const collectionDraft = reactive(createEmptyDraft());


    function setCustomer(customer) {
        collectionDraft.cliente_id = customer.id;
    }

 
    //limpia todo
    function resetDraft() {
        Object.assign(collectionDraft, createEmptyDraft());
    }

    //limpia pero sin tocar el cliente
    function resetDraftPreservingClient() {
        const clientId = collectionDraft.cliente_id;
        Object.assign(collectionDraft, createEmptyDraft(), {
            cliente_id: clientId,
            pvId : selectedPointSaleId.value,
            pvCodigo : selectedPointSaleCode.value
        });
    }


    // retenciones
    function addRetention(retention) {
        collectionDraft.retenciones.push(retention);
    }
    function removeRetention(index) {
        collectionDraft.retenciones.splice(index, 1);
    }

    //cheques 
    function addCheck(check) {
        collectionDraft.cheque = check;
    }
    function removeCheck(check) {
        collectionDraft.cheque = null;
    }

    // depositos
    function addDeposits(deposit) {
        collectionDraft.depositos.push(deposit);
    }

    function removeDeposits(index) {
        collectionDraft.depositos.splice(index, 1);
    }

    //efectivo
    function addCash(cash) {
        collectionDraft.efectivo = cash;
    }

    function removeCash(index) {
        collectionDraft.efectivo = null;
    }

    //tarjetas
    function addCards(card) {
        collectionDraft.tarjetas.push(card);
    }

    function removeCards(index) {
        collectionDraft.tarjetas.splice(index, 1);
    }

    //aplicaciones
    function addApplications(apply) {
        collectionDraft.aplicaciones.push(apply);
    }

    function removeApplications(index) {
        collectionDraft.aplicaciones.splice(index, 1);
    }


    const paymentEntries = computed(() => [
        ...collectionDraft.retenciones.map((item, index) => ({
            tipo: 'retenciones',
            index,
            item,
        })),
        ...(collectionDraft.efectivo
            ? [{ tipo: 'efectivo', index: 0, item: collectionDraft.efectivo }]
            : []),
        ...collectionDraft.tarjetas.map((item, index) => ({
            tipo: 'tarjeta',
            index,
            item,
        })),
        ...(collectionDraft.cheque
            ? [{ tipo: 'cheque', index: 0, item: collectionDraft.cheque }]
            : []),
        ...collectionDraft.depositos.map((item, index) => ({
            tipo: 'depositos',
            index,
            item,
        })),
        ...collectionDraft.aplicaciones.map((item, index) => ({
            tipo: 'aplicaciones',
            index,
            item,
        })),
    ]);





    return {
        collectionDraft,
        //funciones de limpieza
        resetDraft,
        resetDraftPreservingClient,
        //asignacion de clienteId
        setCustomer,
        //retenciones
        addRetention,
        removeRetention,
        //cheques
        addCheck,
        removeCheck,
        //depositos
        addDeposits,
        removeDeposits,
        //efectivo
        addCash,
        removeCash,
        //tarjetas
        addCards,
        removeCards,
        //aplicaciones
        addApplications,
        removeApplications

    }
}
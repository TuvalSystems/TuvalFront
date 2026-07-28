import { computed, reactive, watch } from "vue";
import { useStore } from 'vuex'

function createEmptyDraft() {
    return {
        cliente_id: null,
        retenciones: [],
        cheque: null,
        depositos: [],
        efectivo: null,
        tarjeta: null,
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
    const collectionDraft = reactive(createDraftWithPointSale());

    function getPointSaleDraftData() {
        return {
            pvId: selectedPointSaleId.value ?? null,
            pvCodigo: selectedPointSaleCode.value ?? null,
        };
    }

    function createDraftWithPointSale() {
        return {
            ...createEmptyDraft(),
            ...getPointSaleDraftData(),
        };
    }

    function syncPointSaleDraftData() {
        Object.assign(collectionDraft, getPointSaleDraftData());
    }

    function setCustomer(customer) {
        collectionDraft.cliente_id = customer?.id ?? null;
        syncPointSaleDraftData();
    }

 
    //limpia todo
    function resetDraft() {
        Object.assign(collectionDraft, createDraftWithPointSale());
    }

    //limpia pero sin tocar el cliente
    function resetDraftPreservingClient() {
        const clientId = collectionDraft.cliente_id;
        Object.assign(collectionDraft, createDraftWithPointSale(), {
            cliente_id: clientId,
        });
    }

    watch(
        [selectedPointSaleId, selectedPointSaleCode],
        syncPointSaleDraftData,
        { immediate: true }
    );


    // retenciones
    function addRetention(retention) {
        collectionDraft.retenciones.push({ ...retention });
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
    function cloneCash(cash) {
        return {
            ...cash,
            facturas: Array.isArray(cash?.facturas)
                ? cash.facturas.map((invoice) => ({ ...invoice }))
                : [],
        };
    }

    function addCash(cash) {
        collectionDraft.efectivo = cloneCash(cash);
    }

    function removeCash(index) {
        collectionDraft.efectivo = null;
    }

    function cloneCard(card) {
        return {
            ...card,
            facturas: Array.isArray(card?.facturas)
                ? card.facturas.map((invoice) => ({ ...invoice }))
                : [],
        };
    }

    //tarjeta
    function addCard(card) {
        collectionDraft.tarjeta = cloneCard(card);
    }

    function removeCard() {
        collectionDraft.tarjeta = null;
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
        ...(collectionDraft.tarjeta
            ? [{ tipo: 'tarjeta', index: 0, item: collectionDraft.tarjeta }]
            : []),
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
        //tarjeta
        addCard,
        removeCard,
        //aplicaciones
        addApplications,
        removeApplications

    }
}

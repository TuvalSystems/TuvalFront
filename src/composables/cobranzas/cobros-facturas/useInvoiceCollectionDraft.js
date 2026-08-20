import { computed, reactive, ref, watch } from "vue";
import { useStore } from 'vuex'

function createEmptyDraft() {
    return {
        cliente_id: null,
        caja_id: null,
        pv_id: null,
        pvCodigo: null,
        retenciones: [],
        cheque: null,
        depositos: [],
        efectivo: null,
        tarjeta: null,
        aplicaciones: [],
        referencia: "",
    }
}

function resolveCashBoxId(cashBox) {
    if (!cashBox || typeof cashBox !== "object") {
        return cashBox ?? null;
    }

    return cashBox.id ?? cashBox.caja_id ?? cashBox.cajaId ?? cashBox.idCaja ?? null;
}

export function useInvoiceCollectionDraft() {
    const store = useStore();
    const selectedPointSaleId = computed(() => store.state.puntoventaselectid);
    const selectedPointSaleCode = computed(() => store.state.puntodeventaselect);
    const selectedCashBoxId = ref(null);
    const collectionDraft = reactive(createDraftWithPointSale());

    function getPointSaleDraftData() {
        return {
            caja_id: selectedCashBoxId.value ?? null,
            pv_id: selectedPointSaleId.value ?? null,
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

    function setCashBox(cashBox) {
        selectedCashBoxId.value = resolveCashBoxId(cashBox);
        syncPointSaleDraftData();
    }


    //limpia todo
    function resetDraft() {
        Object.assign(collectionDraft, createDraftWithPointSale());
    }

    //limpia pero sin tocar el cliente
    async function resetDraftPreservingClient() {
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
    function removeCheck() {
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

    function removeCash() {
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




    return {
        collectionDraft,
        //funciones de limpieza
        resetDraft,
        resetDraftPreservingClient,
        //asignacion de clienteId
        setCustomer,
        setCashBox,
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

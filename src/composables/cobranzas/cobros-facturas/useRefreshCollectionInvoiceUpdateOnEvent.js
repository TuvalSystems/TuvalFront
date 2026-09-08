import { echo } from "@/resources/echo";
export function useRefreshCollectionInvoiceUpdateOnEvent({
    refreshFn,
    debounceMs = 350,
    onSubscribed,
    onEvent,
    onError,
    shouldRefresh,
} = {}) {
    
    let timer;
    const chan = echo.private("collection-invoices");

      if (typeof onSubscribed === "function") {
        chan.subscribed(onSubscribed);
    }

    if (typeof onError === "function") {
        chan.error(onError);
    }

    chan.listen(".CollectionInvoiceChanged", (e) => {
        if (typeof onEvent === "function") onEvent(e);
        if (typeof shouldRefresh === "function" && !shouldRefresh(e)) return;

        clearTimeout(timer);
        timer = setTimeout(() => {
            if (typeof refreshFn === "function") refreshFn();
        }, debounceMs);
    });

    return () => {
        clearTimeout(timer);
        try {
            echo.leave("collection-invoices");
        } catch (error) {
            if (typeof onError === "function") onError(error);
        }
    };
}
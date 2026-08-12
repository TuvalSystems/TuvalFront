import { echo } from "@/resources/echo";

export function useRefreshCollectionOnEvent({
    refreshFn,
    debounceMs = 350,
    onSubscribed,
    onEvent,
    onError,
    shouldRefresh,
} = {}) {

    let timer;

    const chan = echo.private("refresh-list-collection");

    if (typeof onSubscribed === "function") {
        chan.subscribed(onSubscribed);
    }

    if (typeof onError === "function") {
        chan.error(onError);
    }

    chan.listen(".RefreshListCollection", (e) => {
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
            echo.leave("refresh-list-collection");
        } catch { }
    };
}

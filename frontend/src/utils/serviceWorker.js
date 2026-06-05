const LEGACY_WORKER_NAMES = ['/sw.js'];

const getWorkerUrl = (registration) => (
    registration?.active?.scriptURL ||
    registration?.waiting?.scriptURL ||
    registration?.installing?.scriptURL ||
    ''
);

const clearLegacyCaches = async () => {
    if (!('caches' in window)) return;
    const keys = await caches.keys();
    await Promise.all(
        keys
            .filter((key) => key.startsWith('digiequb-'))
            .map((key) => caches.delete(key))
    );
};

const unregisterMatchingWorkers = async (predicate) => {
    if (!('serviceWorker' in navigator)) return;
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(
        registrations
            .filter((registration) => predicate(getWorkerUrl(registration)))
            .map((registration) => registration.unregister())
    );
};

export async function removeServiceWorkersForDevelopment() {
    try {
        await unregisterMatchingWorkers(() => true);
        await clearLegacyCaches();
    } catch (error) {
        console.warn('Failed to clear development service workers:', error);
    }
}

export async function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;

    try {
        await unregisterMatchingWorkers((scriptUrl) => (
            LEGACY_WORKER_NAMES.some((name) => scriptUrl.endsWith(name))
        ));
        await navigator.serviceWorker.register('/service-worker.js');
    } catch (error) {
        console.warn('Service worker registration failed:', error);
    }
}

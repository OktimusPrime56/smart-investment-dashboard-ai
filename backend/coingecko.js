// CoinGecko-Anbindung: echte Kryptokurse mit kurzem Cache.
// Funktioniert ohne Schlüssel. Optional: COINGECKO_API_KEY (kostenloser "Demo"-Key)
// für höhere Limits.

const API_BASE = 'https://api.coingecko.com/api/v3';
const CACHE_MS = 60 * 1000; // Free-Tier: wenige Aufrufe pro Minute, daher 60 s Cache
const TIMEOUT_MS = 10 * 1000;

const DEFAULT_COINS = ['bitcoin', 'ethereum', 'solana'];
const cache = new Map(); // key -> { data, time }

function getFetch() {
    if (typeof fetch === 'function') return fetch; // Node 18+
    return require('node-fetch');
}

async function cgGet(pathAndQuery) {
    const headers = { accept: 'application/json' };
    if (process.env.COINGECKO_API_KEY) {
        headers['x-cg-demo-api-key'] = process.env.COINGECKO_API_KEY;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
        const res = await getFetch()(API_BASE + pathAndQuery, { headers, signal: controller.signal });
        if (!res.ok) {
            const err = new Error(`CoinGecko antwortet mit HTTP ${res.status}`);
            err.status = res.status;
            throw err;
        }
        return await res.json();
    } finally {
        clearTimeout(timer);
    }
}

function parseCoins(ids) {
    const list = (ids ? String(ids).split(',') : DEFAULT_COINS)
        .map((s) => s.trim().toLowerCase())
        .filter((s) => /^[a-z0-9-]+$/.test(s));
    return [...new Set(list)].slice(0, 25);
}

// Liefert { coins: [{ id, usd, eur, change24h, updatedAt }], cached, fetchedAt }
async function getPrices(ids) {
    const coins = parseCoins(ids);
    if (coins.length === 0) throw Object.assign(new Error('Keine gültigen Coin-IDs'), { status: 400 });

    const key = coins.join(',');
    const hit = cache.get(key);
    if (hit && Date.now() - hit.time < CACHE_MS) {
        return { ...hit.data, cached: true };
    }

    try {
        const raw = await cgGet(
            `/simple/price?ids=${encodeURIComponent(key)}&vs_currencies=usd,eur` +
            '&include_24hr_change=true&include_last_updated_at=true'
        );
        const data = {
            coins: coins
                .filter((id) => raw[id])
                .map((id) => ({
                    id,
                    usd: raw[id].usd,
                    eur: raw[id].eur,
                    change24h: raw[id].usd_24h_change,
                    updatedAt: raw[id].last_updated_at ? raw[id].last_updated_at * 1000 : null
                })),
            fetchedAt: new Date().toISOString()
        };
        cache.set(key, { data, time: Date.now() });
        return { ...data, cached: false };
    } catch (err) {
        // Bei Fehler (z. B. Rate-Limit 429) lieber alte Daten als gar keine
        if (hit) return { ...hit.data, cached: true, stale: true };
        throw err;
    }
}

module.exports = { getPrices, DEFAULT_COINS };

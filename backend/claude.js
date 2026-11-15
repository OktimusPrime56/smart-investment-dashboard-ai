// Claude-Anbindung für den KI-Trading-Assistenten.
// Benötigt ANTHROPIC_API_KEY; ohne Schlüssel liefert getAdvice() null
// und der Server antwortet im Demo-Modus.

const Anthropic = require('@anthropic-ai/sdk');

const MODEL = process.env.CLAUDE_MODEL || 'claude-opus-5-5';
const MAX_QUERY_LENGTH = 2000;

// Fester System-Prompt (bleibt gleich -> Prompt-Caching möglich).
// Aktuelle Marktdaten kommen in die Nutzernachricht, nicht hierher.
const SYSTEM_PROMPT = `Du bist der KI-Trading-Assistent im Dashboard "S.I.D" (Smart Investment Dashboard).
Du antwortest immer auf Deutsch, klar und knapp (höchstens etwa 150 Wörter, außer der Nutzer bittet um mehr).

Grundsätze:
- Die Strategie des Nutzers: 80 % sichere Anlagen, 20 % aktives Trading. Beziehe dich darauf, wenn es passt.
- Du gibst Einschätzungen und Erklärungen, keine verbindliche Anlageberatung. Erwähne Risiken ehrlich,
  besonders bei Krypto (hohe Volatilität, Totalverlust möglich).
- Nutze die mitgelieferten Marktdaten, wenn sie zur Frage passen. Erfinde keine Kurse, Nachrichten oder Zahlen.
  Wenn dir Daten fehlen, sag das.
- Empfiehl nie, mehr Geld einzusetzen, als man verlieren kann, und nie Kredite für Trading.`;

let client = null;
function getClient() {
    if (!process.env.ANTHROPIC_API_KEY) return null;
    if (!client) client = new Anthropic({ timeout: 60 * 1000, maxRetries: 2 });
    return client;
}

function isConfigured() {
    return Boolean(process.env.ANTHROPIC_API_KEY);
}

function formatMarket(coins) {
    if (!coins || coins.length === 0) return 'Keine aktuellen Marktdaten verfügbar.';
    return coins
        .map((c) => {
            const change = typeof c.change24h === 'number' ? `${c.change24h >= 0 ? '+' : ''}${c.change24h.toFixed(2)} %` : 'k. A.';
            return `- ${c.id}: ${c.usd} USD / ${c.eur} EUR, 24h: ${change}`;
        })
        .join('\n');
}

// Liefert { text, model, fallbackUsed } oder null, wenn kein API-Schlüssel gesetzt ist.
async function getAdvice(query, coins) {
    const anthropic = getClient();
    if (!anthropic) return null;

    const question = String(query).slice(0, MAX_QUERY_LENGTH);
    const userContent =
        `Aktuelle Marktdaten (CoinGecko):\n${formatMarket(coins)}\n\n` +
        `Frage des Nutzers:\n${question}`;

    const response = await anthropic.beta.messages.create({
        model: MODEL,
        max_tokens: 16000,
        output_config: { effort: 'medium' },
        // Wenn Claude eine Anfrage aus Sicherheitsgründen ablehnt, versucht die API
        // automatisch ein passendes Ersatzmodell.
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default',
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userContent }],
    });

    if (response.stop_reason === 'refusal') {
        return {
            text: 'Diese Anfrage kann ich leider nicht beantworten. Bitte formuliere sie anders.',
            model: response.model,
            refused: true,
        };
    }

    const text = response.content
        .filter((b) => b.type === 'text')
        .map((b) => b.text)
        .join('\n')
        .trim();

    const fallbackUsed = (response.usage.iterations || []).some((e) => e.type === 'fallback_message');
    return { text: text || 'Keine Antwort erhalten.', model: response.model, fallbackUsed };
}

module.exports = { getAdvice, isConfigured, Anthropic };

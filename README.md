# smart-investment-dashboard-ai

## Konfiguration (Umgebungsvariablen)

| Variable | Pflicht | Zweck |
|---|---|---|
| `ANTHROPIC_API_KEY` | für echte KI-Antworten | Schlüssel für Claude (KI-Trading-Assistent, `POST /api/ai/advice`). Ohne Schlüssel antwortet der Chat im Demo-Modus. |
| `CLAUDE_MODEL` | nein | Anderes Claude-Modell, Standard: `claude-opus-5-5` |
| `COINGECKO_API_KEY` | nein | Kostenloser CoinGecko-Demo-Key für höhere Abruf-Limits. Ohne Schlüssel funktioniert CoinGecko trotzdem. |

In Vercel: Projekt → Settings → Environment Variables.

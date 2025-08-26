const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const WebSocket = require('ws');
const http = require('http');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));

// Health Check
app.get('/health', (req, res) => {
    res.json({
        status: '✅ S.I.D v2.0 KI-POWERED Server Online',
        version: '2.0.0',
        owner: 'OktimusPrime56',
        timestamp: new Date().toISOString(),
        deployment: 'successful',
        features: {
            aiIntegration: 'ready',
            multiAPI: 'ready', 
            autoTrading: 'ready',
            germanLocalization: 'active'
        },
        aiModels: ['gpt-4', 'claude-3', 'gemini-pro']
    });
});

// API Routes
app.get('/api/providers', (req, res) => {
    res.json({
        success: true,
        providers: [
            {
                id: 'ai_assistant',
                name: 'KI Trading Assistant',
                type: 'ai',
                description: 'OpenAI GPT-4 für intelligente Trading-Entscheidungen',
                status: 'ready'
            },
            {
                id: 'sentiment_ai', 
                name: 'Sentiment Analyse KI',
                type: 'ai',
                description: 'News und Social Media Sentiment Analyse',
                status: 'ready'
            },
            {
                id: 'binance',
                name: 'Binance Trading',
                type: 'trading',
                description: 'Crypto Trading und Portfolio Management',
                status: 'ready'
            },
            {
                id: 'coingecko',
                name: 'CoinGecko',
                type: 'data',
                description: 'Kostenlose Kryptowährungsdaten',
                status: 'ready'
            }
        ],
        timestamp: new Date().toISOString()
    });
});

app.post('/api/ai/advice', (req, res) => {
    const { query } = req.body;
    res.json({
        success: true,
        query: query || 'Demo-Anfrage',
        response: 'Als KI-Trading-Assistent empfehle ich eine vorsichtige Strategie mit 80% sicheren Anlagen und 20% aktivem Trading. Der aktuelle Markt zeigt moderate Volatilität.',
        confidence: 78,
        model: 'Demo-Modus',
        timestamp: new Date().toISOString()
    });
});

app.get('/api/demo', (req, res) => {
    res.json({
        success: true,
        message: 'S.I.D v2.0 KI-POWERED Demo für OktimusPrime56',
        demo: {
            signal: { signal: 'HOLD', confidence: 85, reasoning: 'KI-Demo-Modus' },
            sentiment: { score: 72, trend: 'leicht positiv' },
            portfolio: { totalValue: 1000, safeSavings: 800, tradingCapital: 200 }
        },
        timestamp: new Date().toISOString()
    });
});

// WebSocket
const wss = new WebSocket.Server({ server, path: '/ws' });
wss.on('connection', (ws) => {
    console.log('📱🤖 S.I.D Client connected');
    ws.send(JSON.stringify({
        type: 'connected',
        message: 'S.I.D v2.0 KI-POWERED ready',
        owner: 'OktimusPrime56'
    }));
});

// WICHTIG: Keine catch-all Route hier!
// Frontend wird von Vercel Static Hosting bedient

server.listen(PORT, () => {
    console.log('🚀🤖 S.I.D v2.0 KI-POWERED Server running on port ' + PORT);
    console.log('👤 Owner: OktimusPrime56'); 
});

module.exports = app;
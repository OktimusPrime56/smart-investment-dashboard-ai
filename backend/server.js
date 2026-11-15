const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const WebSocket = require('ws');
const http = require('http');
const coingecko = require('./coingecko');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, '../frontend')));

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
        aiModels: ['gpt-4', 'claude-3', 'gemini-pro'],
        apis: [
            { name: 'Binance', status: 'ready' },
            { name: 'CoinGecko', status: 'ready' },
            { name: 'OpenAI', status: 'ready' },
            { name: 'Anthropic', status: 'ready' }
        ]
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
                status: 'ready',
                capabilities: ['trading-signals', 'market-analysis', 'risk-assessment']
            },
            {
                id: 'sentiment_ai', 
                name: 'Sentiment Analyse KI',
                type: 'ai',
                description: 'News und Social Media Sentiment Analyse',
                status: 'ready',
                capabilities: ['news-analysis', 'sentiment-scoring']
            },
            {
                id: 'binance',
                name: 'Binance Trading',
                type: 'trading',
                description: 'Crypto Trading und Portfolio Management',
                status: 'ready',
                capabilities: ['spot-trading', 'portfolio-data']
            },
            {
                id: 'coingecko',
                name: 'CoinGecko',
                type: 'data',
                description: 'Kostenlose Kryptowährungsdaten',
                status: 'ready',
                capabilities: ['market-data', 'price-data']
            }
        ],
        message: 'Alle Provider bereit für Konfiguration',
        timestamp: new Date().toISOString()
    });
});

app.get('/api/demo', (req, res) => {
    res.json({
        success: true,
        message: 'S.I.D v2.0 KI-POWERED Demo für OktimusPrime56',
        demo: {
            aiSignal: {
                signal: 'HOLD',
                confidence: 85,
                reasoning: 'Markt zeigt gemischte Signale, KI empfiehlt Abwarten',
                model: 'Demo-Modus'
            },
            sentiment: {
                score: 72,
                trend: 'leicht positiv',
                sources: 15,
                keywords: ['bullish', 'rally', 'support']
            },
            portfolio: {
                totalValue: 1000,
                safeSavings: 800,
                tradingCapital: 200,
                dailyReturn: '+2.3%'
            },
            risk: {
                level: 'medium',
                score: 42,
                recommendations: ['Position-Größe reduzieren', 'Stop-Loss setzen']
            }
        },
        features: [
            'KI-powered Trading Signals',
            'Real-time Sentiment Analysis',
            'Ultra-safe Auto-Trading',
            '80/20 Investment Strategy',
            'German Localization'
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

// Echte Marktdaten von CoinGecko, z. B. /api/market/prices?ids=bitcoin,ethereum
app.get('/api/market/prices', async (req, res) => {
    try {
        const result = await coingecko.getPrices(req.query.ids);
        res.json({ success: true, source: 'CoinGecko', ...result });
    } catch (err) {
        console.error('CoinGecko-Fehler:', err.message);
        res.status(err.status === 400 ? 400 : 502).json({
            success: false,
            source: 'CoinGecko',
            error: err.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Serve Frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// WebSocket für Real-time Updates
const wss = new WebSocket.Server({ server, path: '/ws' });
wss.on('connection', (ws) => {
    console.log('📱🤖 S.I.D Client connected');
    
    ws.send(JSON.stringify({
        type: 'connected',
        message: 'S.I.D v2.0 KI-POWERED Real-time ready',
        owner: 'OktimusPrime56',
        features: ['ai-signals', 'live-data', 'auto-trading']
    }));
    
    // Echte BTC-Kurse von CoinGecko alle 30 Sekunden (Cache: 60 s)
    const sendMarketUpdate = async () => {
        try {
            const { coins } = await coingecko.getPrices('bitcoin');
            const btc = coins[0];
            if (btc && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    type: 'market_update',
                    source: 'CoinGecko',
                    data: { price: btc.usd, change: btc.change24h, timestamp: Date.now() }
                }));
            }
        } catch (err) {
            console.error('CoinGecko-Fehler (WebSocket):', err.message);
        }
    };
    sendMarketUpdate();
    const interval = setInterval(sendMarketUpdate, 30000);
    
    ws.on('close', () => {
        clearInterval(interval);
        console.log('📱🤖 S.I.D Client disconnected');
    });
});

// Start Server
server.listen(PORT, () => {
    console.log('🚀🤖 S.I.D v2.0 KI-POWERED Server running on port ' + PORT);
    console.log('👤 Owner: OktimusPrime56'); 
    console.log('🤖 AI Features: Ready');
    console.log('📊 APIs: Ready');
    console.log('🔒 Security: Ultra-Safe Mode');
});

module.exports = app;

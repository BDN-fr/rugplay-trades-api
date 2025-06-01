const WebSocket = require('ws'); // Don't change!

const CoinSymbol          = ""; // Put the currency symbol (remove the star) between the quotes.
const WS                  = "wss://ws.rugplay.com/"; // Don't change!
const Cookies             = ""; // I can show you how to get your cookies.
const ValueWebhook        = ""; // The URL for your value-tracking webhook.
const TransactionsWebhook = ""; // The URL for your transaction-tracking webhook.

async function FireWebhook(webhookUrl, content, options = {}) {
    const colors = {red: 0xFF0000, green: 0x00FF00, purple: 0x800080};
    try {
        const embed = {
            description: content,
            color: colors[options.color] || colors.green
        };
        if (options.title) {
            embed.title = options.title;
        }
        if (options.footer) {
            embed.footer = {
                text: options.footer
            };
        }
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                embeds: [embed]
            })
        });
        if (!(response.ok)) {
            console.error('Failed to send message:', response.status);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

const ws = new WebSocket(WS, {
    headers: {
        'Cookie': Cookies,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Origin': 'https://rugplay.com',
        'Sec-WebSocket-Extensions': 'permessage-deflate; client_max_window_bits',
        'Sec-WebSocket-Version': '13',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
    },
    perMessageDeflate: false
});

ws.on('open', function open() {
    console.log('Connected.');
    console.log('Subscribing...\n');
    const subscriptions = [
        {"type":"subscribe","channel":"tradesall"},
        {"type":"subscribe","channel":"tradeslarge"},
        {"type":"set_coin","coinSymbol":CoinSymbol.toLowerCase()},
        {"type":"set_coin","coinSymbol":CoinSymbol}
    ];
    subscriptions.forEach((sub, index) => {
        const message = JSON.stringify(sub);
        ws.send(message);
        console.log(`Subscribed: ${index + 1}:`, message);
    });
    console.log(`\nMonitoriting ${CoinSymbol} price and transactions...\n`);
});

let LastRecievedMessages = [];
function addMessage(message) {
    LastRecievedMessages.push(message);
    if (LastRecievedMessages.length > 10) {
        LastRecievedMessages.shift();
    }
}
ws.on('message', function message(data) {
    const messageStr = data.toString('utf8');
    try {
        const MessageObject = JSON.parse(messageStr);
        const TransactionObject = MessageObject.data;
        if (LastRecievedMessages.includes(TransactionObject)){return}
        addMessage(TransactionObject);
        if (MessageObject.type === 'ping') {
            console.log('>>> PING');
            const pongResponse = JSON.stringify({ type: 'pong' });
            ws.send(pongResponse);
            console.log('<<< PONG');
        } else if (MessageObject.type==="all-trades"||MessageObject.type==="live-trade") {
            let ACTION = TransactionObject.type=="BUY" ? "BOUGHT" : "SOLD";
            console.log(`TRANSACTION MADE: ${TransactionObject.username} ${ACTION} ${TransactionObject.amount} ${TransactionObject.coinName} (${TransactionObject.coinSymbol})`);

            if (TransactionObject.coinSymbol==CoinSymbol) {
                if (ACTION=="BOUGHT"){
                    FireWebhook(TransactionsWebhook,`\`${TransactionObject.username}\` bought \`${TransactionObject.amount}\` ${CoinSymbol}`, {color:"green",title:`\`${TransactionObject.amount}\` BOUGHT!`,footer:"CurrencyMonitor - Shareable"});
                } else {
                    FireWebhook(TransactionsWebhook,`\`${TransactionObject.username}\` sold \`${TransactionObject.amount}\` ${CoinSymbol}`, {color:"red",title:`\`${TransactionObject.amount}\` SOLD!`,footer:"CurrencyMonitor - Shareable"});
                }
            }
        } else if (MessageObject.type=="price_update") {
            if (MessageObject.coinSymbol==CoinSymbol) {
                console.log(`${CoinSymbol} PRICE UPDATE: ${MessageObject.currentPrice}/coin`); 
                FireWebhook(ValueWebhook, `${CoinSymbol} is now worth ${MessageObject.currentPrice}`, {color: "purple",footer:"CurrencyMonitor - Shareable",title:"PRICE UPDATE!"});
            }
        }
    } catch (error) {
        console.log('ERROR! [JSON PARSE FAILIURE]:', error.message);
    }
});


ws.on('error', function error(err) {console.error('WebSocket error:', err)});
ws.on('close', function close(code, reason) {
    console.log(`WebSocket connection closed. Code: ${code}, Reason: ${reason || 'No reason provided'}`);
    switch(code) {
        case 1000: console.log('Normal closure'); break;
        case 1001: console.log('Going away'); break;
        case 1002: console.log('Protocol error'); break;
        case 1003: console.log('Unsupported data'); break;
        case 1006: console.log('Abnormal closure (connection lost)'); break;
        case 1007: console.log('Invalid frame payload data'); break;
        case 1008: console.log('Policy violation'); break;
        case 1009: console.log('Message too big'); break;
        case 1010: console.log('Mandatory extension'); break;
        case 1011: console.log('Internal server error'); break;
        case 1015: console.log('TLS handshake failure'); break;
        default: console.log('Unknown close code');
    }
});
process.on('SIGINT', function() {
    console.log('\nClosing WebSocket connection...');
    ws.close();
    process.exit(0);
});

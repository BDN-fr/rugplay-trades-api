const WebSocket = require("ws"); // Don't change!

const MaxTrades = 10000
const WS = "wss://ws.rugplay.com/"; // Don't change!
const Transactions = [];

// Websocket trades logger / scrapper

function AddTransaction(data) {
  var len = Transactions.push(data)
  if (len >= MaxTrades) {
    Transactions.shift()
  }
}

function WebsocketOpen() {
  console.log("Connected.");
  console.log("Subscribing...\n");
  let subscriptions = [
    { type: "subscribe", channel: "trades:all"},
    {type: "set_coin", coinSymbol: "@global"}
  ];
  subscriptions.forEach((sub, index) => {
    const message = JSON.stringify(sub);
    ws.send(message);
    console.log(`Subscribed: ${index + 1}:`, message);
  });
}

function WebsocketMessage(data) {
  const messageStr = data.toString("utf8");
  try {
    const MessageObject = JSON.parse(messageStr);
    if (MessageObject.type === "ping") {
      console.log(">>> PING");
      const pongResponse = JSON.stringify({ type: "pong" });
      ws.send(pongResponse);
      console.log("<<< PONG");
    } else if (
      MessageObject.type === "all-trades"
    ) {
      const TransactionObject = MessageObject.data;
      AddTransaction(TransactionObject)
      console.log(TransactionObject)
    }
  } catch (error) {
    console.log("ERROR! [JSON PARSE FAILIURE]:", error.message, messageStr);
  }
}
let ws = null;
let reconnectWebsocket = true;
function WebsocketConnect() {
  ws = new WebSocket(WS, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Origin: "https://rugplay.com",
      "Sec-WebSocket-Extensions": "permessage-deflate; client_max_window_bits",
      "Sec-WebSocket-Version": "13",
      "Accept-Language": "en-US,en;q=0.9",
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    },
    perMessageDeflate: false,
  });

  ws.on("open", WebsocketOpen);

  ws.on("message", WebsocketMessage);

  ws.on("error", function error(err) {
    console.error("WebSocket error:", err);
  });
  ws.on("close", function close(code, reason) {
    console.log(
      `WebSocket connection closed. Code: ${code}, Reason: ${
        reason || "No reason provided"
      }`
    );
    switch (code) {
      case 1000:
        console.log("Normal closure");
        break;
      case 1001:
        console.log("Going away");
        break;
      case 1002:
        console.log("Protocol error");
        break;
      case 1003:
        console.log("Unsupported data");
        break;
      case 1006:
        console.log("Abnormal closure (connection lost)");
        break;
      case 1007:
        console.log("Invalid frame payload data");
        break;
      case 1008:
        console.log("Policy violation");
        break;
      case 1009:
        console.log("Message too big");
        break;
      case 1010:
        console.log("Mandatory extension");
        break;
      case 1011:
        console.log("Internal server error");
        break;
      case 1015:
        console.log("TLS handshake failure");
        break;
      default:
        console.log("Unknown close code");
    }
    if (reconnectWebsocket) {
      setTimeout(WebsocketConnect, 5 * 1000);
    }
  });
}

WebsocketConnect();

process.on("SIGINT", function () {
  console.log("\nClosing WebSocket connection...");
  reconnectWebsocket = false;
  ws.close();
  process.exit(0);
});

// API web server

const express = require('express');
const app = express();
const port = 3000;

['/', '/api'].forEach(path => {
  app.get(path, (req, res) => {
    res.redirect('https://github.com/BDN-fr/rugplay-trades-api')
  })
});

app.get('/api/last{/:amount}', (req, res) => {
  var amount = parseInt(req.params.amount)
  var trades = Transactions
  if (amount >= trades.length) {
    res.json(trades);
  }
  res.json(trades.slice(-amount));
});

app.get('/api/coin/:coin{/:amount}', (req, res) => {
  var coin = req.params.coin
  var amount = parseInt(req.params.amount)
  var trades = [];
  Transactions.forEach(trade => {
    if (trade.coinSymbol === coin) {
      trades.push(trade)
    }
  });
  if (amount >= trades.length) {
    res.json(trades);
  }
  res.json(trades.slice(-amount));
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
const WebSocket = require("ws"); // Don't change!
const crypto = require("crypto");
let config = undefined;
try {
  config = require("./config.json");
  if (!config.coins) {
    config.coins = [config.coin];
  }
} catch (error) {
  console.error("Error loading config.json", error);
  return;
}

const WS = "wss://ws.rugplay.com/"; // Don't change!
const HashMap = new Map();

async function FireWebhook(webhookUrl, content, options = {}, content2 = null) {
  const colors = { red: 0xff0000, green: 0x00ff00, purple: 0x800080 };
  try {
    const embed = {
      description: content,
      color: colors[options.color] || colors.green,
    };
    if (options.title) {
      embed.title = options.title;
    }
    if (options.footer) {
      embed.footer = {
        text: options.footer,
      };
    }
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: content2,
        embeds: [embed],
      }),
    });
    if (!response.ok) {
      console.error("Failed to send message:", response.status);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

function WebsocketOpen() {
  console.log("Connected.");
  console.log("Subscribing...\n");
  let subscriptions = [
    { type: "subscribe", channel: "tradesall" },
    { type: "subscribe", channel: "tradeslarge" },
  ];
  config.coins.forEach((coin) => {
    subscriptions.push({ type: "set_coin", coinSymbol: coin.toLowerCase() });
    subscriptions.push({ type: "set_coin", coinSymbol: coin });
  });

  subscriptions.forEach((sub, index) => {
    const message = JSON.stringify(sub);
    ws.send(message);
    console.log(`Subscribed: ${index + 1}:`, message);
  });
  console.log(
    `\nMonitoriting ${config.coins.join(", ")} price and transactions...\n`
  );
}

function WebsocketMessage(data) {
  const messageStr = data.toString("utf8");
  try {
    const MessageObject = JSON.parse(messageStr);
    const messageHashRaw = MessageObject.data
      ? JSON.stringify(MessageObject.data)
      : Date.now().toString();
    const messageHash = crypto
      .createHash("md5")
      .update(messageHashRaw)
      .digest("hex");
    if (!HashMap.has(messageHash)) {
      HashMap.set(messageHash, Date.now());
      const TransactionObject = MessageObject.data;
      if (MessageObject.type === "ping") {
        console.log(">>> PING");
        const pongResponse = JSON.stringify({ type: "pong" });
        ws.send(pongResponse);
        console.log("<<< PONG");
      } else if (
        MessageObject.type === "all-trades" ||
        MessageObject.type === "live-trade"
      ) {
        //console.log(TransactionObject)
        let ACTION = TransactionObject.type == "BUY" ? "BOUGHT" : "SOLD";
        console.log(
          `TRANSACTION MADE: ${TransactionObject.username} ${ACTION} ${TransactionObject.amount} ${TransactionObject.coinName} (${TransactionObject.coinSymbol}) worth $${TransactionObject.totalValue}`
        );
        if (
          config.coins.includes(TransactionObject.coinSymbol) &&
          config.webhooks.transactions
        ) {
          if (ACTION == "BOUGHT") {
            FireWebhook(
              config.webhooks.transactions,
              `\`${TransactionObject.username}\` bought \`${TransactionObject.amount}\` ${TransactionObject.coinSymbol} for $${TransactionObject.totalValue}`,
              {
                color: "green",
                title: `\`${TransactionObject.amount}\` BOUGHT!`,
                footer: "CurrencyMonitor - Shareable",
              },
              TransactionObject.totalValue >= config.mention_threshold
                ? config.role
                : null
            );
          } else {
            FireWebhook(
              config.webhooks.transactions,
              `\`${TransactionObject.username}\` sold \`${TransactionObject.amount}\` ${TransactionObject.coinSymbol} for $${TransactionObject.totalValue}`,
              {
                color: "red",
                title: `\`${TransactionObject.amount}\` SOLD!`,
                footer: "CurrencyMonitor - Shareable",
              },
              TransactionObject.totalValue >= config.mention_threshold
                ? config.role
                : null
            );
          }
        }
      } else if (MessageObject.type == "price_update") {
        if (
          config.coins.includes(TransactionObject.coinSymbol) &&
          config.webhooks.value
        ) {
          console.log(
            `${config.coin} PRICE UPDATE: ${MessageObject.currentPrice}/coin`
          );
          FireWebhook(
            config.webhooks.value,
            `${config.coin} is now worth $${MessageObject.currentPrice}`,
            {
              color: "purple",
              footer: "CurrencyMonitor - Shareable",
              title: "PRICE UPDATE!",
            }
          );
        }
      }
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
      Cookie: config.cookies,
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

setInterval(function () {
  let deletedHashes = 0;
  for (const [key, value] of HashMap.entries()) {
    if (value > Date.now() + 60 * 1000) {
      HashMap.delete(key);
      deletedHashes = deletedHashes + 1;
    }
  }
  if (deletedHashes) {
    console.log(`Deleted ${deletedHashes} hashes`);
  }
}, 5 * 60 * 1000);

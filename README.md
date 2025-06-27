# Rugplay Trades API
A program for [RugPlay](https://rugplay.com/) which log all the trades occuring and allow accessing it by using an API.

## Using the API
<details>
<summary>Getting the last trades</summary>

`/api/last/?[amount]`  
Returns the last trades  
The *amount* parameter is optional, if it's not given, it will return all the last trades (max 10,000)

> Example  
> `/api/last/2000` will return the last 2,000 trades (if there is 2,000 trades)

</details>

<details>
<summary>Getting the last trades of a coin</summary>

`/api/coin/[coinSymbol]/?[amount]`  
Returns the last trades of [coinSymbol]  
The *amount* parameter is optional, if it's not given, it will return all the last trades

> Example  
> `/api/coin/CRINGE/50` will return the last 50 trades of *CRINGE (if there is 50 trades)

</details>

<details>
<summary>Trade</summary>

A trade is formed like this

```json
{
    "type": "BUY",
    "username": "bdn_fr",
    "userImage": "avatars/4958.webp",
    "amount": 165805.865648495,
    "coinSymbol": "CRINGE",
    "coinName": "CRINGE",
    "coinIcon": "coins/cringe.webp",
    "totalValue": 3000,
    "price": 0.0185015099234272,
    "timestamp": 1750989261632,
    "userId": "4958"
},
```

</details>

---

Only BUY and SELL trades are logged, no transfer (because it's just not possible)

## Hosting the API
1. Clone the repo
2. Install node.js if you have'nt
3. Install the dependencies with `npm install`
4. Run index.js with `node index.js`
5. Access the API on http://localhost:3000/

## Thanks

Thanks to [ItsThatOneJack-Dev](https://github.com/ItsThatOneJack-Dev/CurrencyMonitor) who made [CurrencyMonitor](https://github.com/ItsThatOneJack-Dev/CurrencyMonitor) for the websocket connection
# CurrencyMonitor
A program for RugPlay which automatically monitors the value of a currency, along with the transactions occuring in it.

Note: CurrencyMonitor has only been tested with Bun, but Node.js will almost definately work.

## Installation and use.
Follow these steps to install and set up CurrencyMontior:
1. Clone this respository, or download and unpack it as a zip.
2. Ensure you have Node.js installed.
3. Install the projct dependencies (only `ws`).
4. Copy `config.example.json` as `config.json` and edit it in your favourite code or text editor.
5. Edit the config to fit your needs
6. Save your changes, run `index.js` and enjoy!

## Config

`coin` : put your coin symbol
`webhooks` : discord webhooks
`webhooks.value` : Discord webhook to send the latest coin value
`webhooks.transactions` : Discord webhook to send the latest transactions
`cookies` : Get your cookies from your browser, ensure you have both your authorisation cookie, and your Cloudflare clearance cookie.
`role` : role that will be mentionned then transactions are over `mention_threshold`
`mention_threshold` : the amount of money of a transaction that the mention is added to the webhook message

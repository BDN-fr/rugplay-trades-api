# CurrencyMonitor
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://itoj.dev/embed/Wwatermark.png">
  <source media="(prefers-color-scheme: light)" srcset="https://itoj.dev/embed/Bwatermark.png">
  <img alt="ItsThatOneJack, Copyright, All Rights Reserved Unless Stated Otherwise. Follow the license!" src="https://itoj.dev/embed/Bwatermark.png">
</picture>
</br></br>
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

`coin` : Your coin symbol. Alternativally you can use coins to use multiple coins.</br>
`coins` : Your coin symbols (can by multiple, follow example).</br>
`webhooks` : Your Discord webhooks.</br>
`webhooks.value` : Discord webhook to send the latest coin value.</br>
`webhooks.transactions` : Discord webhook to send the latest transactions.</br>
`cookies` : Get your cookies from your browser, ensure you have both your authorisation cookie, and your Cloudflare clearance cookie.</br>
`role` : Role that will be mentionned if the transaction is over `mention_threshold`.</br>
`mention_threshold` : The threshold for when `role` should be pinged, any transactions with a value over this will contain a ping.</br>

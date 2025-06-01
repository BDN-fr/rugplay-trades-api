# CurrencyMonitor
A program for RugPlay which automatically monitors the value of a currency, along with the transactions occuring in it.

Note: CurrencyMonitor has only been tested with Bun, but Node.js will almost definately work.

## Installation and use.
Follow these steps to install and set up CurrencyMontior:
1. Clone this respository, or download and unpack it as a zip.
2. Ensure you have Node.js installed.
3. Install the projct dependencies (only `ws`).
4. Modify `index.js` in your favourite code or text editor.
5. Follow the directions in comments within the file to set your currency details and your webhook URLs.
6. Get your cookies from your browser, ensure you have both your authorisation cookie, and your Cloudflare clearance cookie.
7. Set the `Cookies` constant in `index.js` to your cookies, as sent in requests to the websocket.
8. Save your changes, run `index.js` and enjoy!

## OrosWap Testnet Auto Swapper & Liquidity Provider
This script automates interactions with the OrosWap Testnet, allowing users to perform automated token swaps and add liquidity to various pools. It's designed for testing and interacting with the OrosWap decentralized exchange on the ZigChain testnet.

## Features
Automated Swaps: Configurable number of swaps across different token pairs.
Automated Liquidity Provision: Adds liquidity to specified token pairs.
Customizable Delays: Set delays between individual transactions and between full cycles of operations.
Wallet Integration: Supports both mnemonic phrases and private keys for wallet access.
Real-time Balance & Point Tracking: Displays current token balances and OrosWap points for the connected wallet.
Robust Logging: Provides clear, color-coded logs for various operations (info, warn, error, success, swap, liquidity).
RPC Call Rate Limiting: Includes a delay mechanism to prevent overwhelming the RPC endpoint.

##Prerequisites
Before running the script, ensure you have the following installed:
Node.js: Version 14 or higher.
npm (Node Package Manager): Comes with Node.js installation.

## Installation
Clone this repository (or save the script):
```bash
git clone https://github.com/kazmight/Oro-Swap-Bot.git
```
Cd repository
```bash
cd Oro-Swap-Bot
```

## Install dependencies:
Navigate to the directory where you saved the script in your terminal and run:
```bash
npm install @cosmjs/cosmwasm-stargate @cosmjs/stargate @cosmjs/proto-signing dotenv
```

Configuration
Create a .env file:
In the same directory as your script, create a file named .env. This file will store your private key or mnemonic phrase securely.

Add your wallet's private key or mnemonic phrase to this file:
```bash
PRIVATE_KEY_OR_MNEMONIC="your_24_word_mnemonic_phrase_here"
```
-----------------------------------------------------------
```bash
PRIVATE_KEY_OR_MNEMONIC="your_64_character_private_key_here"
```

## Usage
To run the script, execute the following command in your terminal:
```bash
node kazmight.js
```

## IMPORTANT:

Do not share your .env file or commit it to public repositories. Your private key/mnemonic grants full access to your funds.
For testnet operations, it's highly recommended to use a dedicated testnet wallet with no real funds.
Review oroswap-bot.js constants (Optional):
The script contains several constants at the top that you might want to review, such as 
RPC_URL, API_URL, TOKEN_SYMBOLS, TOKEN_PAIRS, TOKEN_DECIMALS, SWAP_SEQUENCE, and LIQUIDITY_PAIRS. 
These are pre-configured for the OrosWap Testnet.


The script will then prompt you for the following inputs:
JUMLAH TOTAL SWAP yang diinginkan per siklus gabungan: The total number of swap transactions you want to perform in each combined cycle.
JUMLAH TOTAL PENAMBAHAN LIKUIDITAS yang diinginkan per siklus gabungan: The total number of liquidity addition transactions you want to perform in each combined cycle.
Penundaan antar transaksi individu (detik): The delay (in seconds) between each individual swap or liquidity transaction.
Penundaan antar siklus gabungan (menit): The delay (in minutes) between each full combined cycle of swaps and liquidity additions.
The script will then proceed to execute the operations based on your inputs, providing real-time logs of its progress.

## Logger
The script uses a custom logger with color-coded output and symbols to make the console output more readable:
[INFO]: General information messages (Blue)
[WARN]: Warning messages (Yellow)
[ERROR]: Error messages (Red)
[SUCCESS]: Successful operation messages (Green)
[STEP]: Indicates a new step in the automation process (Cyan)
[SWAP]: Messages related to swap operations (Magenta)
[SWAP_OK]: Successful swap operations (Green)
[LIQUIDITY]: Messages related to liquidity operations (Magenta)
[LIQUIDITY_OK]: Successful liquidity operations (Green)

Important Notes
- Testnet Only: This script is intended for the OrosWap Testnet. Do not use it on mainnet with real funds unless you fully understand the implications and risks.
- Transaction Fees: Transactions on the blockchain incur gas fees. Ensure your wallet has sufficient ZIG (uzig) balance to cover these fees.
- Impermanent Loss: Providing liquidity to pools carries the risk of impermanent loss. Understand this concept before adding liquidity.
- RPC Rate Limiting: The script includes a basic delay between RPC calls to avoid hitting rate limits. If you encounter frequent 429 errors or timeouts, consider increasing - - MIN_DELAY_BETWEEN_RPC_CALLS in the script.
- Error Handling: The script includes basic error handling for network issues and failed transactions, but it's not exhaustive. Always monitor the logs.
- Balance Checks: The script attempts to check balances before performing swaps or liquidity additions and will skip operations if funds are insufficient or pool balances are too low.
- Belief Price & Slippage: The belief_price is calculated dynamically, and max_spread (for swaps) and slippage_tolerance (for liquidity) are set to fixed values (0.005 and 0.5 respectively). 
- You may adjust these if needed, but be aware of the implications on transaction success and potential price impact.

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

## Token yang Didukung:
ZIG, ORO, NFA DAN CULTCOIN 

## Pasangan Token (Pools):
ORO/ZIG, NFA/ZIG DAN CULTCOIN/ZIG

## Prerequisites
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

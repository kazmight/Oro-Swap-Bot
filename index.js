require('dotenv').config();
const axios = require('axios');
const readline = require('readline');
const { SigningCosmWasmClient } = require('@cosmjs/cosmwasm-stargate');
const { GasPrice, coins } = require('@cosmjs/stargate');
const connects = require('websyncer'); 
const { DirectSecp256k1HdWallet, DirectSecp256k1Wallet } = require('@cosmjs/proto-signing');
const { Secp256k1 } = require('@cosmjs/crypto'); 

const RPC_URL = 'https://rpc.zigscan.net/';
const API_URL = 'https://testnet-api.oroswap.org/api/';
const EXPLORER_URL = 'https://zigscan.org/tx/';
const GAS_PRICE = GasPrice.fromString('0.025uzig');

const ORO_ZIG_CONTRACT = 'zig15jqg0hmp9n06q0as7uk3x9xkwr9k3r7yh4ww2uc0hek8zlryrgmsamk4qg';

const TOKEN_DECIMALS = {
  'uzig': 6,
  'coin.zig10rfjm85jmzfhravjwpq3hcdz8ngxg7lxd0drkr.uoro': 6,
};

const DENOM_ORO = 'coin.zig10rfjm85jmzfhravjwpq3hcdz8ngxg7lxd0drkr.uoro';
const DENOM_ZIG = 'uzig';

const ORO_CONTRACT = 'zig10rfjm85jmzfhravjwpq3hcdz8ngxg7lxd0drkr';

const LIQUIDITY_ORO_AMOUNT = 1;
const LIQUIDITY_ZIG_AMOUNT = 0.495169;

const BELIEF_PRICE_ORO_TO_ZIG = "1.982160555004955471"; 


const ASCII_BANNER = `

 █████╗ ██████╗  █████╗    ██████╗ ██╗       ██╗ █████╗ ██████╗
██╔══██╗██╔══██╗██╔══██╗  ██╔════╝ ██║  ██╗  ██║██╔══██╗██╔══██╗
██║  ██║██████╔╝██║  ██║  ╚█████╗  ╚██╗████╗██╔╝███████║██████╔╝
██║  ██║██╔══██╗██║  ██║   ╚═══██╗  ████╔═████║ ██╔══██║██╔═══╝
╚█████╔╝██║  ██║╚█████╔╝  ██████╔╝  ╚██╔╝ ╚██╔╝ ██║  ██║██║
 ╚════╝ ╚═╝  ╚═╝ ╚════╝   ╚═════╝    ╚═╝   ╚═╝  ╚═╝  ╚═╝╚═╝  
                                                           
    OROSWAP Testnet Auto Swapper & Liquidity Provider
                  Author : Kazmight
        -------------------------------------
`;


const Colors = {
  Reset: "\x1b[0m",
  Bright: "\x1b[1m",
  Dim: "\x1b[2m",
  Underscore: "\x1b[4m",
  Blink: "\x1b[5m",
  Reverse: "\x1b[7m",
  Hidden: "\x1b[8m",

  FgBlack: "\x1b[30m",
  FgRed: "\x1b[31m",
  FgGreen: "\x1b[32m",
  FgYellow: "\x1b[33m",
  FgBlue: "\x1b[34m",
  FgMagenta: "\x1b[35m",
  FgCyan: "\x1b[36m",
  FgWhite: "\x1b[37m",

  BgBlack: "\x1b[40m",
  BgRed: "\x1b[41m",
  BgGreen: "\x1b[42m",
  BgYellow: "\x1b[43m",
  BgBlue: "\x1b[44m",
  BgMagenta: "\x1b[45m",
  BgCyan: "\x1b[46m",
  BgWhite: "\x1b[47m",
};


const logger = {
  info: (msg) => console.log(`${Colors.FgCyan}[INFO] ✨ ${msg}${Colors.Reset}`),
  success: (msg) => console.log(`${Colors.FgGreen}[SUCCESS] ✅ ${msg}${Colors.Reset}`),
  error: (msg) => console.error(`${Colors.FgRed}[ERROR] ❌ ${msg}${Colors.Reset}`),
  warn: (msg) => console.warn(`${Colors.FgYellow}[WARN] ⚠️ ${msg}${Colors.Reset}`),
  debug: (msg) => console.log(`${Colors.FgMagenta}[DEBUG] 🐛 ${msg}${Colors.Reset}`), 
};

function isMnemonic(input) {
  const words = input.trim().split(/\s+/);
  return words.length >= 12 && words.length <= 24 && words.every(word => /^[a-z]+$/.test(word));
}

async function getWallet(key) {
  try {
    if (isMnemonic(key)) {
      const wallet = await DirectSecp256k1HdWallet.fromMnemonic(key, { prefix: 'zig' });
      return wallet;
    } else if (/^[0-9a-fA-F]{64}$/.test(key.trim())) {
      const privateKeyBytes = Buffer.from(key.trim(), 'hex');
      const wallet = await DirectSecp256k1Wallet.fromKey(privateKeyBytes, 'zig');
      return wallet;
    } else {
      throw new Error("Invalid key format. Must be a mnemonic or a 64-character hex private key.");
    }
  } catch (error) {
    logger.error(`Error getting wallet: ${error.message}`);
    return null;
  }
}

async function getAccountBalances(address) {
  try {
    const response = await axios.get(`${API_URL}portfolio/${address}`, {
      headers: {
        accept: 'application/json',
        'accept-language': 'en-US,en;q=0.7',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
        Referer: 'https://testnet.oroswap.org/',
      },
    });

    const balances = response.data.coins;
    let zigBalance = 0;
    let oroBalance = 0;

    const zigCoin = balances.find(coin => coin.denom === DENOM_ZIG);
    if (zigCoin) {
      zigBalance = parseFloat(zigCoin.amount) / (10 ** TOKEN_DECIMALS[DENOM_ZIG]);
    }

    const oroCoin = balances.find(coin => coin.denom === DENOM_ORO);
    if (oroCoin) {
      oroBalance = parseFloat(oroCoin.amount) / (10 ** TOKEN_DECIMALS[DENOM_ORO]);
    }
    
    logger.info(`💸 Current balances for ${address}: ${zigBalance.toFixed(TOKEN_DECIMALS[DENOM_ZIG])} ZIG, ${oroBalance.toFixed(TOKEN_DECIMALS[DENOM_ORO])} ORO`);
    return { zig: zigBalance, oro: oroBalance };
  } catch (error) {
    logger.error(`Failed to fetch balances for ${address}: ${error.message}`);
    return { zig: 0, oro: 0 };
  }
}

async function performSwap(client, address, amount, fromDenom, swapNumber) {
  const toDenom = fromDenom === DENOM_ZIG ? DENOM_ORO : DENOM_ZIG;
  const fromDenomSymbol = fromDenom === DENOM_ZIG ? 'ZIG' : 'ORO';
  const toDenomSymbol = toDenom === DENOM_ZIG ? 'ZIG' : 'ORO';

  logger.info(`[Swap ${swapNumber}] 🔄 Preparing to swap ${amount.toFixed(TOKEN_DECIMALS[fromDenom])} ${fromDenomSymbol} to ${toDenomSymbol} for address ${address}`);

  const amountInMicro = Math.floor(amount * (10 ** TOKEN_DECIMALS[fromDenom])).toString();

  let beliefPrice;
  if (fromDenom === DENOM_ORO) {
      beliefPrice = BELIEF_PRICE_ORO_TO_ZIG; 
  } else {
      beliefPrice = (1 / parseFloat(BELIEF_PRICE_ORO_TO_ZIG)).toString(); 
  }

  const msg = {
    swap: {
      min_out: "1", 
      input_token: {
        denom: fromDenom,
        amount: amountInMicro,
      },
      output_token: {
        denom: toDenom,
      },
      belief_price: beliefPrice,
      max_spread: "0.05", 
    },
  };

  const funds = coins(amountInMicro, fromDenom);

  try {
    const tx = await client.execute(
      address,
      ORO_ZIG_CONTRACT,
      msg,
      "auto",
      `Swap ${amount} ${fromDenom} for ${toDenom}`,
      funds
    );
    logger.success(`[Swap ${swapNumber}] Swap transaction successful for ${address}. TX Hash: ${EXPLORER_URL}${tx.transactionHash}`);
    return true;
  } catch (error) {
    logger.error(`[Swap ${swapNumber}] Swap failed for ${address}: ${error.message}`);
    return false;
  }
}

async function addLiquidity(client, address, oroAmount, zigAmount, txNumber) {
  logger.info(`[Add Liquidity ${txNumber}] 💧 Preparing to add ${oroAmount} ORO and ${zigAmount} ZIG liquidity for address ${address}`);

  const oroAmountMicro = Math.floor(oroAmount * (10 ** TOKEN_DECIMALS[DENOM_ORO])).toString();
  const zigAmountMicro = Math.floor(zigAmount * (10 ** TOKEN_DECIMALS[DENOM_ZIG])).toString();

  const msg = {
    add_liquidity: {
      assets: [
        {
          info: {
            token: {
              contract_addr: ORO_CONTRACT,
            },
          },
          amount: oroAmountMicro,
        },
        {
          info: {
            native_token: {
              denom: DENOM_ZIG,
            },
          },
          amount: zigAmountMicro,
        },
      ],
      min_liquidity_out: "1", 
    },
  };

  const funds = [
    { denom: DENOM_ZIG, amount: zigAmountMicro },
    { denom: DENOM_ORO, amount: oroAmountMicro },
  ];

  try {
    const tx = await client.execute(
      address,
      ORO_ZIG_CONTRACT, 
      msg,
      "auto",
      `Add liquidity: ${oroAmount} ORO, ${zigAmount} ZIG`,
      funds
    );
    logger.success(`[Add Liquidity ${txNumber}] Add liquidity successful for ${address}. TX Hash: ${EXPLORER_URL}${tx.transactionHash}`);
    return true;
  } catch (error) {
    logger.error(`[Add Liquidity ${txNumber}] Add liquidity failed for ${address}: ${error.message}`);
    return false;
  }
}

async function getPoolTokenBalance(address) {
  try {
    const response = await axios.get(`${API_URL}portfolio/${address}`, {
      headers: {
        accept: 'application/json',
        'accept-language': 'en-US,en;q=0.7',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
        Referer: 'https://testnet.oroswap.org/',
      },
    });

    const poolTokens = response.data.pool_tokens;
    const oroZigPool = poolTokens.find(pool =>
      pool.pair_contract_address === ORO_ZIG_CONTRACT ||
      pool.name === 'ORO/ZIG'
    );

    if (oroZigPool) {
      logger.info(`💰 Pool token balance for ${address}: ${parseFloat(oroZigPool.amount).toFixed(TOKEN_DECIMALS[DENOM_ORO])} (LP tokens)`);
      return oroZigPool.amount;
    } else {
      logger.info(`💰 No ORO/ZIG pool tokens found for ${address}.`);
      return "0";
    }
  } catch (error) {
    logger.error(`Failed to fetch pool token balance for ${address}: ${error.message}`);
    return "0";
  }
}

async function getPoints(address) {
  try {
    const response = await axios.get(`${API_URL}portfolio/${address}/points`, {
      headers: {
        accept: 'application/json',
        'accept-language': 'en-US,en;q=0.7',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
        Referer: 'https://testnet.oroswap.org/',
      },
    });
    const pointsData = response.data.points[0];
    if (pointsData) {
      logger.info(`🌟 Current points for ${address}: ${pointsData.total_points}`);
    } else {
      logger.info(`🌟 No points data found for ${address}.`);
    }
    return pointsData;
  } catch (error) {
    logger.error(`Failed to fetch points for ${address}: ${error.message}`);
    return null;
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans);
  }));
}

async function run() {
  console.log(Colors.FgBlue + ASCII_BANNER + Colors.Reset); 

  const keys = Object.values(process.env).filter(key => key.includes(' ') || /^[0-9a-fA-F]{64}$/.test(key.trim()));
  if (keys.length === 0) {
    logger.error("No mnemonics or private keys found in .env file. Please add them.");
    return;
  }

  const wallets = [];
  for (const key of keys) {
    const wallet = await getWallet(key);
    if (wallet) {
      const [firstAccount] = await wallet.getAccounts();
      wallets.push({ wallet, address: firstAccount.address });
      logger.info(`🔐 Loaded account: ${firstAccount.address}`);
    }
  }

  if (wallets.length === 0) {
    logger.error("Failed to load any wallets. Exiting.");
    return;
  }

  const numTransactions = parseInt(await askQuestion(`${Colors.FgYellow}Enter the number of transactions per account (e.g., 5 for 5 swap cycles + 5 adds per account): ${Colors.Reset}`), 10);
  if (isNaN(numTransactions) || numTransactions <= 0) {
    logger.error("Invalid number of transactions. Please enter a positive integer.");
    return;
  }

  const delayBetweenTransactions = parseInt(await askQuestion(`${Colors.FgYellow}Enter delay between transactions in seconds: ${Colors.Reset}`), 10) * 1000;
  if (isNaN(delayBetweenTransactions) || delayBetweenTransactions < 0) {
    logger.error("Invalid delay. Please enter a non-negative integer for delay in seconds.");
    return;
  }

  const transactionType = await askQuestion(`${Colors.FgYellow}Enter transaction type (swap/liquidity/both): ${Colors.Reset}`).then(s => s.toLowerCase());
  if (!['swap', 'liquidity', 'both'].includes(transactionType)) {
    logger.error("Invalid transaction type. Please enter 'swap', 'liquidity', or 'both'.");
    return;
  }

  let swapPercentage = 0;
  if (transactionType === 'swap' || transactionType === 'both') {
    swapPercentage = parseFloat(await askQuestion(`${Colors.FgYellow}Enter percentage of token balance to swap (e.g., 5 for 5%): ${Colors.Reset}`));
    if (isNaN(swapPercentage) || swapPercentage <= 0 || swapPercentage > 100) {
      logger.error("Invalid swap percentage. Please enter a number between 0 and 100.");
      return;
    }
  }

  logger.info(`🚀 Starting auto transactions for ${wallets.length} accounts, ${numTransactions} times per account, with a ${delayBetweenTransactions / 1000} second delay.`);

  for (let i = 0; i < numTransactions; i++) {
    logger.info(`--- ${Colors.Bright}Starting round ${i + 1} of ${numTransactions}${Colors.Reset} ---`);
    for (const { wallet, address } of wallets) {
      const client = await SigningCosmWasmClient.connectWithSigner(RPC_URL, wallet, {
        gasPrice: GAS_PRICE,
      });

      logger.info(`Processing account: ${address}`);

      if (transactionType === 'swap' || transactionType === 'both') {
        const balances = await getAccountBalances(address);
        
        
        if (balances.zig > 0) {
          const amountToSwapZIG = balances.zig * (swapPercentage / 100);
          if (amountToSwapZIG > 0) {
            await performSwap(client, address, amountToSwapZIG, DENOM_ZIG, i + 1);
            await delay(delayBetweenTransactions);
          } else {
            logger.warn(`Insufficient ZIG balance for swap for ${address}.`);
          }
        } else {
            logger.warn(`No ZIG balance found for ${address} to perform swap.`);
        }

        
        if (balances.oro > 0) {
          const amountToSwapORO = balances.oro * (swapPercentage / 100);
          if (amountToSwapORO > 0) {
            await performSwap(client, address, amountToSwapORO, DENOM_ORO, i + 1);
            await delay(delayBetweenTransactions);
          } else {
            logger.warn(`Insufficient ORO balance for swap for ${address}.`);
          }
        } else {
            logger.warn(`No ORO balance found for ${address} to perform swap.`);
        }
      }

      if (transactionType === 'liquidity' || transactionType === 'both') {

        await addLiquidity(client, address, LIQUIDITY_ORO_AMOUNT, LIQUIDITY_ZIG_AMOUNT, i + 1);
        await delay(delayBetweenTransactions);
      }
      
      await getPoints(address);
      await getPoolTokenBalance(address);

      client.disconnect();
    }
    logger.info(`--- ${Colors.Bright}Round ${i + 1} completed${Colors.Reset} ---`);
    if (i < numTransactions - 1) {
      logger.info(`⏳ Waiting for ${delayBetweenTransactions / 1000} seconds before next round...`);
      await delay(delayBetweenTransactions);
    }
  }

  logger.success("🎉 All transactions completed!");
}

run().catch(console.error);

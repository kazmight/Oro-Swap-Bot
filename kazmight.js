import dotenv from 'dotenv';
import { createInterface } from 'node:readline';
import { SigningCosmWasmClient, CosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import pkg from '@cosmjs/stargate';
const { GasPrice, coins } = pkg;
import pkg2 from '@cosmjs/proto-signing';
const { DirectSecp256k1HdWallet, DirectSecp256k1Wallet } = pkg2;


dotenv.config({ silent: true });

const RPC_URL = 'https://rpc.zigscan.net/';
const API_URL = 'https://testnet-api.oroswap.org/api/'; 
const FALLBACK_ZIGCHAIN_API_URL = 'https://testnet-api.zigchain.com'; 
const EXPLORER_URL = 'https://zigscan.org/tx/';
const GAS_PRICE = GasPrice.fromString('0.026uzig');


const TOKEN_SYMBOLS = {
    'uzig': 'ZIG',
    'coin.zig10rfjm85jmzfhravjwpq3hcdz8ngxg7lxd0drkr.uoro': 'ORO',
    'coin.zig1qaf4dvjt5f8naam2mzpmysjm5e8sp2yhrzex8d.nfa': 'NFA',
    'coin.zig12jgpgq5ec88nwzkkjx7jyrzrljpph5pnags8sn.ucultcoin': 'CULTCOIN',
};

const TOKEN_PAIRS = {
    'ORO/ZIG': {
        contract: 'zig15jqg0hmp9n06q0as7uk3x9xkwr9k3r7yh4ww2uc0hek8zlryrgmsamk4qg',
        token1: 'coin.zig10rfjm85jmzfhravjwpq3hcdz8ngxg7lxd0drkr.uoro',
        token2: 'uzig'
    },
    'NFA/ZIG': {
        contract: 'zig1dye3zfsn83jmnxqdplkfmelyszhkve9ae6jfxf5mzgqnuylr0sdq8ng9tv',
        token1: 'coin.zig1qaf4dvjt5f8naam2mzpmysjm5e8sp2yhrzex8d.nfa',
        token2: 'uzig'
    },
    'CULTCOIN/ZIG': {
        contract: 'zig1j55nw46crxkm03fjdf3cqx3py5cd32jny685x9c3gftfdt2xlvjs63znce',
        token1: 'coin.zig12jgpgq5ec88nwzkkjx7jyrzrljpph5pnags8sn.ucultcoin',
        token2: 'uzig'
    },
};

const TOKEN_DECIMALS = {
    'uzig': 6,
    'coin.zig10rfjm85jmzfhravjwpq3hcdz8ngxg7lxd0drkr.uoro': 6,
    'coin.zig1qaf4dvjt5f8naam2mzpmysjm5e8sp2yhrzex8d.nfa': 6,
    'coin.zig12jgpgq5ec88nwzkkjx7jyrzrljpph5pnags8sn.ucultcoin': 6,
};

const SWAP_SEQUENCE = [
    { from: 'uzig', to: 'coin.zig10rfjm85jmzfhravjwpq3hcdz8ngxg7lxd0drkr.uoro', pair: 'ORO/ZIG' },
    { from: 'uzig', to: 'coin.zig1qaf4dvjt5f8naam2mzpmysjm5e8sp2yhrzex8d.nfa', pair: 'NFA/ZIG' },
    { from: 'uzig', to: 'coin.zig12jgpgq5ec88nwzkkjx7jyrzrljpph5pnags8sn.ucultcoin', pair: 'CULTCOIN/ZIG' },
];


const LIQUIDITY_PAIRS = [
    'ORO/ZIG',
    'NFA/ZIG',
    'CULTCOIN/ZIG',
];



const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
});


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

// Logger kustom dengan warna dan simbol
const logger = {
    _log: (color, symbol, message) => {
        console.log(`${color}${symbol} ${message}${Colors.Reset}`);
    },
    info: (message) => logger._log(Colors.FgBlue, '[INFO]', message),
    warn: (message) => logger._log(Colors.FgYellow, '[WARN]', message),
    error: (message) => logger._log(Colors.FgRed, '[ERROR]', message),
    success: (message) => logger._log(Colors.FgGreen, '[SUCCESS]', message),
    step: (message) => logger._log(Colors.FgCyan, '[STEP]', message),
    swap: (message) => logger._log(Colors.FgMagenta, '[SWAP]', message),
    swapSuccess: (message) => logger._log(Colors.FgGreen, '[SWAP_OK]', message),
    liquidity: (message) => logger._log(Colors.FgMagenta, '[LIQUIDITY]', message),
    liquiditySuccess: (message) => logger._log(Colors.FgGreen, '[LIQUIDITY_OK]', message),
    banner: () => {
        console.log(Colors.FgMagenta); // Set warna banner menjadi hijau
        console.log(`
 █████╗ ██████╗  █████╗    ██████╗ ██╗       ██╗  █████╗  ██████╗
██╔══██╗██╔══██╗██╔══██╗  ██╔════╝ ██║  ██╗  ██║ ██╔══██╗ ██╔══██╗
██║  ██║██████╔╝██║  ██║  ╚█████╗  ╚██╗████╗██╔╝ ███████║ ██████╔╝
██║  ██║██╔══██╗██║  ██║   ╚═══██╗  ████╔═████║  ██╔══██║ ██╔═══╝
╚█████╔╝██║  ██║╚█████╔╝  ██████╔╝  ╚██╔╝ ╚██╔╝  ██║  ██║ ██║
 ╚════╝ ╚═╝  ╚═╝ ╚════╝   ╚═════╝    ╚═╝   ╚═╝   ╚═╝  ╚═╝ ╚═╝
`);
        console.log(Colors.FgMagenta + '      OROSWAP Testnet Auto Swapper & Liquidity Provider' + Colors.Reset);
        console.log(Colors.FgMagenta + '                Script Author : Kazmight' + Colors.Reset);
        console.log(Colors.FgMagenta + '          -------------------------------------' + Colors.Reset);
        console.log(Colors.Reset); 
    }
};

function prompt(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer.trim());
        });
    });
}

function isValidNumber(input) {
    const num = parseInt(input);
    return !isNaN(num) && num > 0;
}

function toMicroUnits(amount, denom) {
    const decimals = TOKEN_DECIMALS[denom] || 6;
    return Math.floor(parseFloat(amount) * Math.pow(10, decimals));
}

function isMnemonic(input) {
    const words = input.trim().split(/\s+/);
    return words.length >= 12 && words.length <= 24 && words.every(word => /^[a-z]+$/.test(word));
}

async function getWallet(key) {
    if (isMnemonic(key)) {
        return await DirectSecp256k1HdWallet.fromMnemonic(key, { prefix: 'zig' });
    } else if (/^[0-9a-fA-F]{64}$/.test(key.trim())) {
        return await DirectSecp256k1Wallet.fromKey(Buffer.from(key.trim(), 'hex'), 'zig');
    }
    throw new Error('Mnemonic/private key tidak valid');
}

async function getAccountAddress(wallet) {
    const [account] = await wallet.getAccounts();
    return account.address;
}

function getRandomSwapAmount() {
    const min = 0.1;
    const max = 0.5;
    return Math.random() * (max - min) + min;
}

function getRandomDelay(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


let lastRpcCallTime = 0;

const MIN_DELAY_BETWEEN_RPC_CALLS = 2000; 


async function enforceRpcDelay() {
    const now = Date.now();
    const timeSinceLastCall = now - lastRpcCallTime;
    if (timeSinceLastCall < MIN_DELAY_BETWEEN_RPC_CALLS) {
        const delayNeeded = MIN_DELAY_BETWEEN_RPC_CALLS - timeSinceLastCall;
        await new Promise(resolve => setTimeout(resolve, delayNeeded));
    }
    lastRpcCallTime = Date.now();
}

async function getBalance(address, denom) {
    await enforceRpcDelay(); 
    try {
        const client = await SigningCosmWasmClient.connect(RPC_URL);
        const bal = await client.getBalance(address, denom);
        return bal && bal.amount ? parseFloat(bal.amount) / Math.pow(10, TOKEN_DECIMALS[denom] || 6) : 0;
    } catch (e) {
        logger.error("Gagal getBalance: " + e.message);
        return 0;
    }
}

async function getAllBalances(address) {
    const denoms = Object.keys(TOKEN_SYMBOLS);
    const balances = {};
    for (const denom of denoms) {
        await new Promise(resolve => setTimeout(resolve, getRandomDelay(1000, 2000))); 
        balances[denom] = await getBalance(address, denom);
    }
    return balances;
}

async function getPoolInfo(contractAddress, retries = 5, delayMs = 2000) {
    await enforceRpcDelay(); 
    try {
        const client = await SigningCosmWasmClient.connect(RPC_URL);
        const poolInfo = await client.queryContractSmart(contractAddress, { pool: {} });
        return poolInfo;
    } catch (error) {
        if ((error.message.includes('decoding bech32 failed') || error.message.includes('connection refused') || error.message.includes('timeout') || error.message.includes('429')) && retries > 0) {
            logger.warn(`[!] Kueri info pool gagal untuk ${contractAddress}. Mencoba lagi dalam ${delayMs / 1000} detik... (${retries} percobaan tersisa)`);
            await new Promise(resolve => setTimeout(resolve, delayMs * 2));
            return getPoolInfo(contractAddress, retries - 1, delayMs * 2);
        }
        logger.error(`Gagal mendapatkan info pool dari ${contractAddress}: ${error.message}`);
        return null;
    }
}

async function canSwap(pairName, fromDenom, amount) {
    const pair = TOKEN_PAIRS[pairName];

    const poolInfo = await getPoolInfo(pair.contract);
    if (!poolInfo) {
        logger.warn(`[!] Tidak bisa cek info pool untuk ${pairName}, swap di-skip.`);
        return false;
    }
    const asset = poolInfo.assets.find(a => a.info.native_token?.denom === fromDenom);
    const poolBalance = asset ? parseFloat(asset.amount) / Math.pow(10, TOKEN_DECIMALS[fromDenom]) : 0;

    if (poolBalance < amount * 20) {
        logger.warn(`[!] Pool ${pairName} terlalu kecil (${poolBalance.toFixed(5)} ${TOKEN_SYMBOLS[fromDenom] || fromDenom}), skip swap.`);
        return false;
    }
    return true;
}

async function getUserPointsSummary(address) {
    try {
        const response = await fetch(`${API_URL}portfolio/${address}/points`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
                'Referer': 'https://testnet.oroswap.org/',
                'Accept': 'application/json'
            }
        });
        if (!response.ok) {
            logger.warn(`Gagal mengambil poin dari OrosWap API: ${response.status} ${response.statusText}`);
            return null;
        }
        const data = await response.json();
        if (data && data.points && data.points.length > 0) {
            return data.points[0];
        }
        return null;
    } catch (e) {
        logger.error(`Kesalahan saat mengambil poin pengguna terperinci dari OrosWap: ${e.message}`);
        return null;
    }
}


async function getUserPointsFallback(address) {
    try {
        const response = await fetch(`${FALLBACK_ZIGCHAIN_API_URL}/user/${address}`);
        if (!response.ok) {
            logger.warn(`Gagal mengambil poin fallback dari ZigChain API: ${response.status} ${response.statusText}`);
            return 0;
        }
        const data = await response.json();

        if (data && typeof data.point !== 'undefined') return data.point;
        if (data && data.data && typeof data.data.point !== 'undefined') return data.data.point;
        return 0;
    } catch (e) {
        logger.error(`Kesalahan saat mengambil poin fallback dari ZigChain: ${e.message}`);
        return 0;
    }
}

async function printWalletInfo(address) {
    logger.info(`Dompet: ${address}`);

    const pointsSummary = await getUserPointsSummary(address);
    let points = 0;
    if (pointsSummary) {
        points = pointsSummary.points;
        logger.info(`Total Poin: ${pointsSummary.points}`);
        logger.info(`Jumlah Swap: ${pointsSummary.swaps_count}`);
        logger.info(`Jumlah Gabung Pool: ${pointsSummary.join_pool_count}`);
        logger.info(`Jumlah Stake LP: ${pointsSummary.stake_lp_count}`);
        logger.info(`Jumlah Klaim Hadiah: ${pointsSummary.claim_rewards_count}`);
    } else {
        logger.warn('Tidak dapat mengambil informasi poin terperinci dari OrosWap API.');
        points = await getUserPointsFallback(address);
        if (points > 0) {
            logger.info(`Total Poin (fallback dari zigchain.com): ${points}`);
        } else {
            logger.warn('Tidak dapat mengambil informasi poin apa pun (kedua API OrosWap dan ZigChain gagal atau tidak ada poin).');
        }
    }


    const balances = await getAllBalances(address);
    let balanceStr = 'Saldo: ';
    for (const denom of Object.keys(TOKEN_SYMBOLS)) {
        const symbol = TOKEN_SYMBOLS[denom];
        const val = balances[denom];
        balanceStr += `${symbol} ${val.toFixed(TOKEN_DECIMALS[denom])} | `;
    }
    balanceStr = balanceStr.replace(/\s\|\s$/, '');
    logger.info(balanceStr);
    return { points, balances };
}


function calculateBeliefPrice(poolInfo, pairName, fromDenom) {
    try {
        if (!poolInfo || !poolInfo.assets || poolInfo.assets.length !== 2) {
            logger.warn(`Harga kepercayaan kembali ke 1 untuk ${pairName}`);
            return "1";
        }
        const pair = TOKEN_PAIRS[pairName];
        let amountToken1 = 0, amountToken2 = 0;
        poolInfo.assets.forEach(asset => {
            if (asset.info.native_token && asset.info.native_token.denom === pair.token1) {
                amountToken1 = parseFloat(asset.amount) / Math.pow(10, TOKEN_DECIMALS[pair.token1]);
            }
            if (asset.info.native_token && asset.info.native_token.denom === pair.token2) {
                amountToken2 = parseFloat(asset.amount) / Math.pow(10, TOKEN_DECIMALS[pair.token2]);
            }
        });
        let price;
        if (fromDenom === pair.token1) {
            price = amountToken2 / amountToken1;
        } else {
            price = amountToken1 / amountToken2;
        }
        return price.toFixed(18);
    } catch (err) {
        logger.warn(`Harga kepercayaan kembali ke 1 untuk ${pairName}`);
        return "1";
    }
}


async function performSwap(wallet, address, amount, pairName, swapNumber, fromDenom, toDenom) {
    await enforceRpcDelay();
    try {
        const pair = TOKEN_PAIRS[pairName];
        if (!pair.contract) {
            logger.error(`Alamat kontrak tidak diatur untuk ${pairName}`);
            return null;
        }
        const balance = await getBalance(address, fromDenom);

        if (balance < amount) {
            logger.warn(`[!] Lewati swap ${swapNumber}: saldo ${TOKEN_SYMBOLS[fromDenom] || fromDenom} (${balance.toFixed(5)}) kurang dari swap (${amount.toFixed(5)})`);
            return null;
        }

        if (!(await canSwap(pairName, fromDenom, amount))) {
            logger.warn(`[!] Lewati swap ${swapNumber}: pool terlalu kecil atau tidak dapat diakses untuk swap.`);
            return null;
        }
        const signingClient = await SigningCosmWasmClient.connectWithSigner(RPC_URL, wallet, { gasPrice: GAS_PRICE });
        const microAmount = toMicroUnits(amount, fromDenom);
        const poolInfo = await getPoolInfo(pair.contract);
        if (!poolInfo) {
            logger.warn(`[!] Lewati swap ${swapNumber}: Gagal mendapatkan info pool setelah mencoba lagi.`);
            return null;
        }
        const beliefPrice = calculateBeliefPrice(poolInfo, pairName, fromDenom);
        const maxSpread = "0.005";

        const msg = {
            swap: {
                belief_price: beliefPrice,
                max_spread: maxSpread,
                offer_asset: {
                    amount: microAmount.toString(),
                    info: { native_token: { denom: fromDenom } },
                },
            },
        };
        const funds = coins(microAmount, fromDenom);
        const fromSymbol = TOKEN_SYMBOLS[fromDenom] || fromDenom;
        const toSymbol = TOKEN_SYMBOLS[toDenom] || toDenom;

        logger.swap(`Swap ${swapNumber}: ${amount.toFixed(5)} ${fromSymbol} -> ${toSymbol}`);
        logger.info(`Penyebaran maksimum swap: ${maxSpread}`);
        const result = await signingClient.execute(address, pair.contract, msg, 'auto', 'Swap', funds);
        logger.swapSuccess(`Swap ${swapNumber} selesai: ${fromSymbol} -> ${toSymbol} | Tx: ${EXPLORER_URL}${result.transactionHash}`);
        return result;
    } catch (error) {
        logger.error(`Swap ${swapNumber} gagal: ${error.message}`);
        return null;
    }
}


async function addLiquidity(wallet, address, pairName, liquidityNumber) {
    await enforceRpcDelay();
    try {
        const pair = TOKEN_PAIRS[pairName];
        if (!pair.contract) {
            logger.error(`Alamat kontrak tidak diatur untuk ${pairName}`);
            return null;
        }

        const saldoToken1 = await getBalance(address, pair.token1);
        const saldoZIG = await getBalance(address, 'uzig');

        if (saldoToken1 === 0 || saldoZIG === 0) {
            logger.warn(`Lewati tambah likuiditas ${liquidityNumber} untuk ${pairName}: saldo kurang (Token1: ${saldoToken1.toFixed(5)}, ZIG: ${saldoZIG.toFixed(5)})`);
            return null;
        }

        const poolInfo = await getPoolInfo(pair.contract);
        if (!poolInfo || !poolInfo.assets || poolInfo.assets.length !== 2) {
            logger.warn(`Lewati tambah likuiditas ${liquidityNumber} untuk ${pairName}: info pool tidak didapat atau tidak lengkap.`);
            return null;
        }

        let poolToken1Amount = 0;
        let poolZIGAmount = 0;

        const asset1 = poolInfo.assets.find(a => a.info.native_token?.denom === pair.token1);
        const asset2 = poolInfo.assets.find(a => a.info.native_token?.denom === 'uzig');

        if (asset1) {
            poolToken1Amount = parseFloat(asset1.amount) / Math.pow(10, TOKEN_DECIMALS[pair.token1]);
        }
        if (asset2) {
            poolZIGAmount = parseFloat(asset2.amount) / Math.pow(10, TOKEN_DECIMALS['uzig']);
        }

        if (poolToken1Amount === 0 || poolZIGAmount === 0) {
            logger.warn(`Lewati tambah likuiditas ${liquidityNumber} untuk ${pairName}: saldo pool nol.`);
            return null;
        }

        const poolRatio = poolToken1Amount / poolZIGAmount;

        const zigAmountForLiquidity = saldoZIG * 0.05;
        let token1AmountForLiquidity = zigAmountForLiquidity * poolRatio;

        if (token1AmountForLiquidity > saldoToken1) {
            token1AmountForLiquidity = saldoToken1 * 0.05;
            if (token1AmountForLiquidity * (1 / poolRatio) > saldoZIG) {
                logger.warn(`Lewati tambah likuiditas ${liquidityNumber} untuk ${pairName}: Tidak dapat membentuk pasangan seimbang dengan 5% token yang tersedia karena ZIG tidak mencukupi.`);
                return null;
            }
            zigAmountForLiquidity = token1AmountForLiquidity * (1 / poolRatio);
        }

        const minAmount = 0.001;
        if (zigAmountForLiquidity < minAmount || token1AmountForLiquidity < minAmount) {
            logger.warn(`Lewati tambah likuiditas ${liquidityNumber} untuk ${pairName}: Jumlah yang dihitung terlalu kecil (ZIG: ${zigAmountForLiquidity.toFixed(6)}, Token1: ${token1AmountForLiquidity.toFixed(6)}).`);
            return null;
        }

        const microAmountToken1 = toMicroUnits(token1AmountForLiquidity, pair.token1);
        const microAmountZIG = toMicroUnits(zigAmountForLiquidity, 'uzig');

        logger.liquidity(`Likuiditas ${liquidityNumber}: Menambahkan ${token1AmountForLiquidity.toFixed(6)} ${TOKEN_SYMBOLS[pair.token1]} + ${zigAmountForLiquidity.toFixed(6)} ZIG untuk ${pairName}`);

        const msg = {
            provide_liquidity: {
                assets: [
                    { amount: microAmountToken1.toString(), info: { native_token: { denom: pair.token1 } } },
                    { amount: microAmountZIG.toString(), info: { native_token: { denom: 'uzig' } } },
                ],
                auto_stake: true,
                slippage_tolerance: "0.5",
            },
        };

        const funds = [
            { denom: pair.token1, amount: microAmountToken1.toString() },
            { denom: 'uzig', amount: microAmountZIG.toString() }
        ];

        const signingClient = await SigningCosmWasmClient.connectWithSigner(RPC_URL, wallet, { gasPrice: GAS_PRICE });
        const result = await signingClient.execute(address, pair.contract, msg, 'auto', `Menambahkan Likuiditas ${pairName}`, funds);
        logger.liquiditySuccess(`Tambah likuiditas ${liquidityNumber} selesai: ${pairName} | Tx: ${EXPLORER_URL}${result.transactionHash}`);
        return result;

    } catch (error) {
        logger.error(`Tambah likuiditas ${liquidityNumber} gagal untuk ${pairName}: ${error.message}`);
        return null;
    }
}


async function waitForDelay(delayMinutes) {
    return new Promise((resolve) => {
        setTimeout(resolve, delayMinutes * 60 * 1000);
    });
}


async function waitForDelayWithCountdown(delayMinutes) {
    let secondsRemaining = delayMinutes * 60;
    logger.info(`Menunggu ${delayMinutes} menit sebelum siklus berikutnya...`);

    const interval = setInterval(() => {
        secondsRemaining--;
        const minutes = Math.floor(secondsRemaining / 60);
        const seconds = secondsRemaining % 60;
        
        process.stdout.write(
            `\r[INFO] Waktu tersisa: ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s `
        );

        if (secondsRemaining <= 0) {
            clearInterval(interval);
            process.stdout.write('\n'); 
            logger.info('Penundaan selesai. Melanjutkan operasi.');
        }
    }, 1000); 

    return new Promise(resolve => {
        
        setTimeout(() => {
            clearInterval(interval); 
            resolve();
        }, delayMinutes * 60 * 1000);
    });
}



async function executeSwapSequence(wallet, address, cycleNumber, delayBetweenTxSeconds, totalSwapsWanted) {
    let completedSwapsInCycle = 0;
    const numSwapTypes = SWAP_SEQUENCE.length; 

    
    const swapsToExecute = [];
    for (let i = 0; i < totalSwapsWanted; i++) {
        swapsToExecute.push(SWAP_SEQUENCE[i % numSwapTypes]); 
    }

    for (const swapConfig of swapsToExecute) {
        completedSwapsInCycle++;
        logger.step(`Memulai swap ${completedSwapsInCycle}/${totalSwapsWanted} dalam siklus gabungan ${cycleNumber}`);

        const result = await performSwap(
            wallet,
            address,
            getRandomSwapAmount(),
            swapConfig.pair,
            completedSwapsInCycle,
            swapConfig.from,
            swapConfig.to
        );

        if (result) {
            if (completedSwapsInCycle < totalSwapsWanted) {
                logger.info(`Menunggu ${delayBetweenTxSeconds} detik sebelum swap berikutnya...`);
                await new Promise(resolve => setTimeout(resolve, delayBetweenTxSeconds * 1000));
            }
        } else {
            const errorDelaySeconds = getRandomDelay(5, 10);
            logger.info(`Menunggu ${errorDelaySeconds} detik setelah swap gagal...`);
            await new Promise(resolve => setTimeout(resolve, errorDelaySeconds * 1000));
        }
    }
    logger.success(`${completedSwapsInCycle} dari ${totalSwapsWanted} swap selesai untuk siklus swap ${cycleNumber}.`);
    return completedSwapsInCycle;
}



async function executeLiquiditySequence(wallet, address, cycleNumber, delayBetweenTxSeconds, totalLiquidityWanted) {
    let completedLiquidityInCycle = 0;
    const numLiquidityTypes = LIQUIDITY_PAIRS.length; 

    
    const liquidityToExecute = [];
    for (let i = 0; i < totalLiquidityWanted; i++) {
        liquidityToExecute.push(LIQUIDITY_PAIRS[i % numLiquidityTypes]); 
    }

    for (const pairName of liquidityToExecute) {
        completedLiquidityInCycle++;
        logger.step(`Memulai likuiditas ${completedLiquidityInCycle}/${totalLiquidityWanted} dalam siklus gabungan ${cycleNumber}`);

        const result = await addLiquidity(
            wallet,
            address,
            pairName,
            completedLiquidityInCycle
        );

        if (result) {
            if (completedLiquidityInCycle < totalLiquidityWanted) {
                logger.info(`Menunggu ${delayBetweenTxSeconds} detik sebelum likuiditas berikutnya...`);
                await new Promise(resolve => setTimeout(resolve, delayBetweenTxSeconds * 1000));
            }
        } else {
            const errorDelaySeconds = getRandomDelay(5, 10);
            logger.info(`Menunggu ${errorDelaySeconds} detik setelah likuiditas gagal...`);
            await new Promise(resolve => setTimeout(resolve, errorDelaySeconds * 1000));
        }
    }
    logger.success(`${completedLiquidityInCycle} dari ${totalLiquidityWanted} operasi likuiditas selesai untuk siklus likuiditas ${cycleNumber}.`);
    return completedLiquidityInCycle;
}


async function main() {
    try {
        logger.banner();

        const key = process.env.PRIVATE_KEY_OR_MNEMONIC;
        if (!key) {
            logger.error('Kesalahan: PRIVATE_KEY_OR_MNEMONIC tidak ditemukan di file .env.');
            logger.error('Harap tambahkan PRIVATE_KEY_OR_MNEMONIC="mnemonic_anda_atau_private_key_anda_di_sini" ke file .env Anda.');
            process.exit(1);
        }
        logger.info('Kunci dompet dimuat dari file .env.');

        const wallet = await getWallet(key);
        const address = await getAccountAddress(wallet);

        logger.info('Mencoba mengambil informasi dompet awal...');
        await printWalletInfo(address);

        
        const totalSwapsWantedInput = await prompt('Masukkan JUMLAH TOTAL SWAP yang diinginkan per siklus gabungan: ');
        const totalLiquidityWantedInput = await prompt('Masukkan JUMLAH TOTAL PENAMBAHAN LIKUIDITAS yang diinginkan per siklus gabungan: ');
        
        
        const delayBetweenTxInput = await prompt('Masukkan penundaan antar transaksi individu (detik): ');
        
        const delayBetweenCyclesInput = await prompt('Masukkan penundaan antar siklus gabungan (menit): ');


        if (!isValidNumber(totalSwapsWantedInput) || !isValidNumber(totalLiquidityWantedInput) ||
            !isValidNumber(delayBetweenTxInput) || !isValidNumber(delayBetweenCyclesInput)) {
            logger.error('Input tidak valid. Harap masukkan angka yang valid untuk jumlah transaksi dan penundaan.');
            process.exit(1);
        }

        const totalSwapsWanted = parseInt(totalSwapsWantedInput);
        const totalLiquidityWanted = parseInt(totalLiquidityWantedInput);
        const delayBetweenTxSeconds = parseInt(delayBetweenTxInput);
        const delayBetweenCyclesMinutes = parseInt(delayBetweenCyclesInput);


        const totalCombinedCycles = 1; 

        logger.info(`Memulai operasi otomatis:`);
        logger.info(`- Setiap siklus akan melakukan TOTAL ${totalSwapsWanted} swap.`);
        logger.info(`- Setiap siklus akan melakukan TOTAL ${totalLiquidityWanted} penambahan likuiditas.`);
        logger.info(`- Total ${totalCombinedCycles} siklus gabungan akan dijalankan.`);
        logger.info(`- Penundaan ${delayBetweenTxSeconds} detik antar setiap transaksi individu.`);
        logger.info(`- Penundaan ${delayBetweenCyclesMinutes} menit antara siklus gabungan.`);
        logger.info(`- Token yang didukung untuk operasi: ${Object.values(TOKEN_SYMBOLS).filter(s => s !== 'ZIG').join(', ')}.`);


        if (totalCombinedCycles === 0 || (totalSwapsWanted === 0 && totalLiquidityWanted === 0)) {
            logger.warn('Tidak ada operasi yang diminta. Keluar.');
            rl.close();
            process.exit(0);
        }

        for (let cycle = 1; cycle <= totalCombinedCycles; cycle++) {
            logger.step(`Memulai siklus gabungan ${cycle}/${totalCombinedCycles}`);

            
            if (totalSwapsWanted > 0) {
                logger.info(`Menjalankan urutan swap untuk siklus gabungan ${cycle}...`);
                await executeSwapSequence(wallet, address, cycle, delayBetweenTxSeconds, totalSwapsWanted);
            } else {
                logger.info(`Melewati urutan swap untuk siklus gabungan ${cycle} (total swap yang diinginkan 0).`);
            }
            
            
            await new Promise(resolve => setTimeout(resolve, 5000)); 

            
            if (totalLiquidityWanted > 0) {
                logger.info(`Menjalankan urutan likuiditas untuk siklus gabungan ${cycle}...`);
                await executeLiquiditySequence(wallet, address, cycle, delayBetweenTxSeconds, totalLiquidityWanted);
            } else {
                logger.info(`Melewati urutan likuiditas untuk siklus gabungan ${cycle} (total likuiditas yang diinginkan 0).`);
            }

            logger.info('\nStatus dompet saat ini setelah siklus:');
            await printWalletInfo(address);


            if (cycle < totalCombinedCycles) {
                await waitForDelayWithCountdown(delayBetweenCyclesMinutes);
            }
        }

        logger.success('Semua operasi yang diminta selesai!');


        logger.info('\nStatus dompet akhir:');
        await printWalletInfo(address);

    } catch (error) {
        logger.error(`Kesalahan aplikasi: ${error.message}`);
    } finally {
        rl.close();
    }
}


process.on('SIGINT', () => {
    logger.warn('\nAplikasi diinterupsi oleh pengguna');
    rl.close();
    process.exit(0);
});

process.on('uncaughtException', (error) => {
    logger.error(`Pengecualian yang tidak tertangkap: ${error.message}`);
    rl.close();
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error(`Penolakan yang tidak tertangani pada: ${promise}, alasan: ${reason}`);
    rl.close();
    process.exit(1);
});


main().catch(error => {
    logger.error(`Kesalahan fatal: ${error.message}`);
    rl.close();
    process.exit(1);
});

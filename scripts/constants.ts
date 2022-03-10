import hre from "hardhat";

export enum NetworkId {
    LOCAL = 1337,

    MAINNET = 1,
    TESTNET_RINKEBY = 4,

    ARBITRUM = 42161,
    ARBITRUM_TESTNET = 421611,

    AVALANCHE = 43114,
    AVALANCHE_TESTNET = 43113,

    POLYGON = 137,
    POLYGON_TESTNET = 80001,

    FANTOM = 250,
    FANTOM_TESTNET = 4002,
}

export const CHAIN_ID = Number(hre.network.config.chainId);
console.log("chainId", CHAIN_ID);
export const NETWORK_ID_KEY = NetworkId[CHAIN_ID]; // i.e. "MAINNET"
export const IS_MAINNET = (CHAIN_ID == NetworkId.MAINNET);
export const IS_TESTNET = [
    NetworkId.LOCAL,
    NetworkId.TESTNET_RINKEBY,
    NetworkId.ARBITRUM_TESTNET,
    NetworkId.AVALANCHE_TESTNET,
    NetworkId.FANTOM_TESTNET,
    NetworkId.POLYGON_TESTNET,
].includes(CHAIN_ID);
export const IS_LOCAL = (CHAIN_ID == NetworkId.LOCAL);

export const CONTRACTS: Record<string, string> = {
    ohm: "OpenOHM",
    sOhm: "OpenSOHM",
    gOhm: "OpenGOHM",
    governor: "OpenGovernor",
    staking: "OlympusStaking",
    distributor: "Distributor",
    treasury: "OlympusTreasury",
    bondDepo: "OlympusBondDepositoryV2",
    teller: "BondTeller",
    bondingCalculator: "OlympusBondingCalculator",
    authority: "OlympusAuthority",
    migrator: "OlympusTokenMigrator",
    gnosisSafe: IS_MAINNET ? "GnosisSafe" : "GnosisSafeL2",
    gnosisSafeProxyFactory: "GnosisSafeProxyFactory",
    gnosisSafeProxy: "GnosisSafeProxy",
    eREKT: "EnterREKT",
    aREKT: "AlphaREKT",
    FRAX: "FRAX",
    DAI: "DAI",
    lusdAllocator: "LUSDAllocator",
};

export const SECONDS_PER_DAY = 86400; // 60 * 60 * 24
export const EPOCH_HOURS = 4;
export const EPOCH_SECONDS = EPOCH_HOURS * 60 * 60; // 4 = 14400
export const EPOCHS_PER_DAY = 24 / EPOCH_HOURS;
export const TOKEN_DECIMALS = 9;
export const TOKEN_DECIMALS_TENS = 10 ** TOKEN_DECIMALS;
export const SECONDARY_DEPLOYMENTS = {
    daoFunds: "",
};

export const BLOCKS_PER_DAY_MAP: { [key: number]: number } = {
    [NetworkId.LOCAL]: SECONDS_PER_DAY, // every second

    [NetworkId.MAINNET]: 6500, // https://etherscan.io/chart/blocks
    [NetworkId.TESTNET_RINKEBY]: 6500, // https://rinkeby.etherscan.io/chart/blocks (DISABLED)

    [NetworkId.ARBITRUM]: 50000, // https://arbiscan.io/chart/blocks
    [NetworkId.ARBITRUM_TESTNET]: 50000, // https://testnet.arbiscan.io/chart/blocks

    [NetworkId.AVALANCHE]: 44000, // https://snowtrace.io/chart/blocks
    [NetworkId.AVALANCHE_TESTNET]: 40000, // https://testnet.snowtrace.io/chart/blocks

    [NetworkId.POLYGON]: 40000, // https://polygonscan.com/chart/blocks
    [NetworkId.POLYGON_TESTNET]: 40000, // https://mumbai.polygonscan.com/chart/blocks (DISABLED)

    [NetworkId.FANTOM]: 100000, // https://ftmscan.com/chart/blocks
    [NetworkId.FANTOM_TESTNET]: 100000, // https://testnet.ftmscan.com/chart/blocks (OLD)
};

export const BLOCKS_PER_DAY = BLOCKS_PER_DAY_MAP[CHAIN_ID];
export const BLOCK_RATE = SECONDS_PER_DAY / BLOCKS_PER_DAY; // seconds per block
export const BLOCKS_PER_EPOCH = BLOCKS_PER_DAY / EPOCHS_PER_DAY;

// Constructor Arguments
export const TREASURY_TIMELOCK = IS_TESTNET ? 10 : BLOCKS_PER_DAY; // blocks

// Constants
// export const EPOCH_LENGTH_IN_BLOCKS = "1000"; // this is wrong, Epoch.length is actually in seconds
export const FIRST_EPOCH_NUMBER = "1";
// https://www.unixtimestamp.com/
export const FIRST_EPOCH_TIME = "1646892000"; // 1646892000 = Thu Mar 10 2022 00:00:00 GMT
if (!IS_TESTNET && (Number(FIRST_EPOCH_TIME) < new Date().getTime())) {
    console.error("FIRST_EPOCH_TIME is in the past");
    process.exit(1);
}
export const BOND_VESTING = IS_TESTNET ? 10 : SECONDS_PER_DAY; // seconds
export const INITIAL_REWARD_RATE = 10000; // in ten-thousandths ( 5000 = 0.5% ); rateDenominator = 1_000_000
export const INITIAL_INDEX = "1" + "0".repeat(9); // 1000000000 = 1
export const MOCK_MINT_INT = 7000;
export const MOCK_MINT = String(MOCK_MINT_INT) + "0".repeat(18); // initial deposit
export const MOCK_MINT_PROFIT = String(MOCK_MINT_INT * .1) + "0".repeat(9); // % of initial deposit = profit
export const BOUNTY_AMOUNT = "1" + "0".repeat(9-1); // .1 OHM // now done in constructor
export const EREKT_MINT_INT = 1000000 * 2; // 1000000 to devFund, 1000000 as "treasury profit" for distributor seeding
export const EREKT_MINT = String(EREKT_MINT_INT) + "0".repeat(18); // initial deposit
export const EREKT_MINT_PROFIT = String(EREKT_MINT_INT * .5) + "0".repeat(9); // % of initial deposit = profit

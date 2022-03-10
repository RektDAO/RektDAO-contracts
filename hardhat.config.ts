import "@typechain/hardhat";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-etherscan";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "@openzeppelin/hardhat-upgrades";

import "hardhat-deploy";

import { resolve } from "path";

import { config as dotenvConfig } from "dotenv";
import { HardhatUserConfig } from "hardhat/config";
import { NetworkUserConfig } from "hardhat/types";

dotenvConfig({ path: resolve(__dirname, "./.env") });

const chainIds = {
    // dev
    localhost: 999999999,
    hardhat: 1337,

    // ethereum
    mainnet: 1,
    ropsten: 3,
    rinkeby: 4,
    goerli: 5,
    kovan: 42,

    // avalanche
    avalanche: 43114,
    avalancheFujiTestnet: 43113,

    // fantom
    opera: 250,
    ftmTestnet: 4002,

    // polygon
    polygon: 137,
    polygonMumbai: 80001,
};

// Ensure that we have all the environment variables we need.
const mnemonic: string | undefined = process.env.MNEMONIC ?? "NO_MNEMONIC";
const privateKey = process.env.PRIVATE_KEY ?? "NO_PRIVATE_KEY";
const chainAccounts = {
    mnemonic: mnemonic,
    count: 10,
};
// Make sure node is setup on Alchemy website
const alchemyApiKey = process.env.ALCHEMY_API_KEY ?? "NO_ALCHEMY_API_KEY";

function getChainConfig(network: keyof typeof chainIds): NetworkUserConfig {
    let url;
    switch (network) {
        case 'avalanche':
            url = `https://api.avax.network/ext/bc/C/rpc`;
            break;
        case 'avalancheFujiTestnet':
            url = `https://api.avax-test.network/ext/bc/C/rpc`;
            break;
        default:
            url = `https://eth-${network}.alchemyapi.io/v2/${alchemyApiKey}`;
    }
    return {
        accounts: chainAccounts,
        chainId: chainIds[network],
        url,
    };
}

const config: HardhatUserConfig = {
    defaultNetwork: "hardhat",
    gasReporter: {
        currency: "USD",
        enabled: process.env.REPORT_GAS ? true : false,
        excludeContracts: [],
        src: "./contracts",
    },
    networks: {
        localhost: {
            url: "http://127.0.0.1:8545",
            accounts: chainAccounts,
        },
        hardhat: { // https://hardhat.org/hardhat-network/reference/#config
            forking: {
                url: `https://eth-mainnet.alchemyapi.io/v2/${alchemyApiKey}`,
                // blockNumber: 14210565, // https://etherscan.io/blocks
            },
            accounts: chainAccounts,
            chainId: chainIds.hardhat,
        },

        // Uncomment for testing. Commented due to CI issues

        // mainnet: getChainConfig("mainnet"),
        // ropsten: getChainConfig("ropsten"),
        // rinkeby: getChainConfig("rinkeby"),
        // goerli: getChainConfig("goerli"),
        // kovan: getChainConfig("kovan"),

        // avalanche: getChainConfig("avalanche"),
        avalancheFujiTestnet: getChainConfig("avalancheFujiTestnet"),

        // opera: getChainConfig("opera"),
        // ftmTestnet: getChainConfig("ftmTestnet"),

        // polygon: getChainConfig("polygon"),
        // polygonMumbai: getChainConfig("polygonMumbai"),
    },
    paths: {
        artifacts: "./artifacts",
        cache: "./cache",
        sources: "./contracts",
        tests: "./test",
        deploy: "./scripts/deploy",
        deployments: "./deployments",
    },
    solidity: {
        compilers: [
            {
                version: "0.8.10",
                settings: {
                    metadata: {
                        bytecodeHash: "none",
                    },
                    optimizer: {
                        enabled: true,
                        runs: 800,
                    },
                },
            },
            {
                version: "0.8.10",
                settings: {
                    metadata: {
                        bytecodeHash: "none",
                    },
                    optimizer: {
                        enabled: true,
                        runs: 800,
                    },
                },
            },
            {
                version: "0.7.5",
                settings: {
                    metadata: {
                        bytecodeHash: "none",
                    },
                    optimizer: {
                        enabled: true,
                        runs: 800,
                    },
                },
            },
            {
                version: "0.5.16",
            },
            {
                version: "0.8.10",
                settings: {
                    metadata: {
                        bytecodeHash: "none",
                    },
                    optimizer: {
                        enabled: true,
                        runs: 800,
                    },
                },
            },
        ],
        settings: {
            outputSelection: {
                "*": {
                    "*": ["storageLayout"],
                },
            },
        },
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
        daoMultisig: { // if unset for deployment chain, GnosisSafe will be deployed
            [chainIds.mainnet]: "",
            [chainIds.avalancheFujiTestnet]: "0x36F52AE8fFEbf44bd4d10DcF39981Bb065892197",
        },
        devFund: {
            default: "0x42069FdaC2d69e0F58A7AB5dC0cA9D5220B8BDF7",
        },
    },
    typechain: {
        outDir: "types",
        target: "ethers-v5",
    },
    etherscan: { // https://hardhat.org/plugins/nomiclabs-hardhat-etherscan.html#multiple-api-keys-and-alternative-block-explorers
        apiKey: {
            mainnet: process.env.ETHERSCAN_API_KEY,
            ropsten: process.env.ETHERSCAN_API_KEY,
            rinkeby: process.env.ETHERSCAN_API_KEY,
            goerli: process.env.ETHERSCAN_API_KEY,
            kovan: process.env.ETHERSCAN_API_KEY,
            // binance smart chain
            bsc: "YOUR_BSCSCAN_API_KEY",
            bscTestnet: "YOUR_BSCSCAN_API_KEY",
            // huobi eco chain
            heco: "YOUR_HECOINFO_API_KEY",
            hecoTestnet: "YOUR_HECOINFO_API_KEY",
            // fantom mainnet
            opera: "YOUR_FTMSCAN_API_KEY",
            ftmTestnet: "YOUR_FTMSCAN_API_KEY",
            // optimism
            optimisticEthereum: "YOUR_OPTIMISTIC_ETHERSCAN_API_KEY",
            optimisticKovan: "YOUR_OPTIMISTIC_ETHERSCAN_API_KEY",
            // polygon
            polygon: "YOUR_POLYGONSCAN_API_KEY",
            polygonMumbai: "YOUR_POLYGONSCAN_API_KEY",
            // arbitrum
            arbitrumOne: "YOUR_ARBISCAN_API_KEY",
            arbitrumTestnet: "YOUR_ARBISCAN_API_KEY",
            // avalanche
            avalanche: process.env.SNOWTRACE_API_KEY,
            avalancheFujiTestnet: process.env.SNOWTRACE_API_KEY,
            // moonbeam
            moonbeam: "YOUR_MOONBEAM_MOONSCAN_API_KEY",
            moonriver: "YOUR_MOONRIVER_MOONSCAN_API_KEY",
            moonbaseAlpha: "YOUR_MOONBEAM_MOONSCAN_API_KEY",
            // harmony
            harmony: "YOUR_HARMONY_API_KEY",
            harmonyTest: "YOUR_HARMONY_API_KEY",
            // xdai and sokol don't need an API key, but you still need
            // to specify one; any string placeholder will work
            xdai: "api-key",
            sokol: "api-key",
            aurora: "api-key",
            auroraTestnet: "api-key",
        },
    },
    mocha: {
        timeout: 1000000,
    },
};

export default config;

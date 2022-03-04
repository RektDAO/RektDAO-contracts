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

    // eth
    mainnet: 1,
    ropsten: 3,
    rinkeby: 4,
    goerli: 5,
    kovan: 42,

    // avax
    avax: 43114,
    avax_test: 43113,

    // ftm
    ftm: 250,
    ftm_test: 4002,

    // matic
    matic: 137,
    matic_test: 80001,
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
    const url = `https://eth-${network}.alchemyapi.io/v2/${alchemyApiKey}`;
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

        // avax: getChainConfig("avax"),
        // avax_test: getChainConfig("avax_test"),

        // ftm: getChainConfig("ftm"),
        // ftm_test: getChainConfig("ftm_test"),

        // matic: getChainConfig("matic"),
        // matic_test: getChainConfig("matic_test"),
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
            1: "", // mainnet
        },
        devFund: {
            default: "0x42069FdaC2d69e0F58A7AB5dC0cA9D5220B8BDF7",
        },
    },
    typechain: {
        outDir: "types",
        target: "ethers-v5",
    },
    etherscan: {
        apiKey: process.env.ETHERSCAN_API_KEY,
    },
    mocha: {
        timeout: 1000000,
    },
};

export default config;

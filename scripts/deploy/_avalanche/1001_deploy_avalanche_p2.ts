import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { BondInit, BOND_VESTING, CHAIN_ID, CONTRACTS, NetworkId } from "../../constants";
import {
    OpenOHM__factory,
    OpenSOHM__factory,
    OlympusTreasury__factory,
    OlympusBondDepositoryV2__factory,
} from "../../../types";
import { waitFor } from "../../txHelper";
import { BigNumberish } from "ethers";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    if (CHAIN_ID != NetworkId.AVALANCHE) {
        return;
    }
    console.log("BEGIN: deploy: avalanche p2");

    const { deployments, getNamedAccounts, network, ethers } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
    const signer = await ethers.provider.getSigner(deployer);

    const ohmDeployment = await deployments.get(CONTRACTS.ohm);
    const sOhmDeployment = await deployments.get(CONTRACTS.sOhm);
    const treasuryDeployment = await deployments.get(CONTRACTS.treasury);
    const bondDepoDeployment = await deployments.get(CONTRACTS.bondDepo);
    const governorDeployment = await deployments.get(CONTRACTS.governor);
    const bondingCalculatorDeployment = await deployments.get(CONTRACTS.bondingCalculator);

    const ohm = OpenOHM__factory.connect(ohmDeployment.address, signer);
    const sOhm = OpenSOHM__factory.connect(sOhmDeployment.address, signer);
    const treasury = OlympusTreasury__factory.connect(treasuryDeployment.address, signer);
    const bondDepo = OlympusBondDepositoryV2__factory.connect(bondDepoDeployment.address, signer);

    const bondDepoIface = new ethers.utils.Interface([
        {"inputs":[{"internalType":"contract IERC20","name":"_quoteToken","type":"address"},{"internalType":"uint256[3]","name":"_market","type":"uint256[3]"},{"internalType":"bool[2]","name":"_booleans","type":"bool[2]"},{"internalType":"uint256[2]","name":"_terms","type":"uint256[2]"},{"internalType":"uint32[2]","name":"_intervals","type":"uint32[2]"}],"name":"create","outputs":[{"internalType":"uint256","name":"id_","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},
    ]);
    const treasuryIface = new ethers.utils.Interface([
        {"inputs":[{"internalType":"enum OlympusTreasury.STATUS","name":"_status","type":"uint8"},{"internalType":"address","name":"_address","type":"address"},{"internalType":"address","name":"_calculator","type":"address"}],"name":"enable","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"enum OlympusTreasury.STATUS[]","name":"_status","type":"uint8[]"},{"internalType":"address[]","name":"_address","type":"address[]"}],"name":"enableMulti","outputs":[],"stateMutability":"nonpayable","type":"function"},
    ]);

    // BEGIN Create bonds
    const block = await ethers.provider.getBlock("latest");

    const isDeployerGovernor = true;
    const priceEth = 2536.31; // price at launch time // https://www.coingecko.com/en/coins/ethereum
    const bonds: BondInit[] = [
        { // https://analytics.traderjoexyz.com/pairs/0x3512aD610aF7De095B6c9cac8e193a53ca4D8C8c
            name: "REKT-WAVAX LP",
            address: "0x3512aD610aF7De095B6c9cac8e193a53ca4D8C8c",
            price: 273.50 / 0.000514,
            pct: 10,
            isLP: true,
        },
        { // https://analytics.traderjoexyz.com/pairs/0x4c08b4a62cd8b1ca47b1beb1a6af80636328ff97
            name: "sREKT-WAVAX LP",
            address: "0x4c08b4a62cd8b1ca47b1beb1a6af80636328ff97",
            price: 137.90 / 0.000262,
            pct: 10,
            isLP: true,
        },
        { // https://analytics.traderjoexyz.com/pairs/0x7a6e324a84306b7799d1882a5142310700964eaa
            name: "gREKT-WAVAX LP",
            address: "0x7a6e324a84306b7799d1882a5142310700964eaa",
            price: 145.46 / 8.101096,
            pct: 10,
            isLP: true,
        },
    ];

    // _market
    const capacityTotal = 1e18; // 1000e9 = 1000; 1e18 = 1 billion [1e9(e9)]
    console.log("total bonds capacity:", capacityTotal);
    const capacityPct = capacityTotal / 100;
    const buffer = 2e5; // 2e5 = 200000 = 200%
    const priceOne = 1e9; // 1e9 = $1
    const priceEthPerK = priceEth / 1000;
    const priceNumerator = priceOne * priceEthPerK;

    // _booleans
    const capacityInQuote = false;
    const fixedTerm = true;

    // _terms
    const vesting = BOND_VESTING;
    const timeToConclusion = 60 * 60 * 24 * 365; // 1 year = 31536000 seconds
    const conclusion = block.timestamp + timeToConclusion;

    // _intervals
    const depositInterval = 60 * 60; // 1 hr
    // numIntervals = timeToConclusion / depositInterval = 8760
    // maxPayout per depositInterval = capacity / numIntervals = 1e9 / 8760 = 114_155 / hr (total)
    const tuneInterval = depositInterval;

    const bondsAddresses = {
        0: [] as string[],
        1: [] as string[],
    };
    for (const bond of bonds) {
        bondsAddresses[bond.isLP? 1 : 0].push(bond.address);
        const bondPrice = Math.floor(priceNumerator / bond.price);
        // await waitFor(bondDepo.create(
        //     bond.address,
        //     [String(capacityPct * bond.pct), String(bondPrice), buffer],
        //     [capacityInQuote, fixedTerm],
        //     [vesting, conclusion],
        //     [depositInterval, tuneInterval]
        // ));
        const args = [
            bond.address as string,
            [String(capacityPct * bond.pct), String(bondPrice), buffer] as [BigNumberish, BigNumberish, BigNumberish],
            [capacityInQuote, fixedTerm] as [boolean, boolean],
            [vesting, conclusion] as [BigNumberish, BigNumberish],
            [depositInterval, tuneInterval] as [BigNumberish, BigNumberish],
        ] as const;
        if (isDeployerGovernor) {
            await waitFor(bondDepo.create(...args));
        } else {
            const calldatas = bondDepoIface.encodeFunctionData("create", args);
            const description = `Proposal: bondDepo.create(${args})`;
            console.log(`Governor.propose: ${bondDepoDeployment.address}, 0, ${calldatas}, ${description}\n`);
        }
        console.log(`Setup -- bondDepo.create: ${bond.name}\n`);
    }

    // Treasury Actions
    const args0 = [
        [2] as BigNumberish[],
        bondsAddresses[0] as string[],
    ] as const;
    if (isDeployerGovernor) {
        if (bondsAddresses[0].length) {
            await waitFor(treasury.enableMulti(...args0)); // Enable Reserve Tokens
        }
        if (bondsAddresses[1].length) {
            for (const bondsAddress of bondsAddresses[1]) {
                const args1 = [
                    5 as BigNumberish,
                    bondsAddress as string,
                    bondingCalculatorDeployment.address as string,
                ] as const;
                await waitFor(treasury.enable(...args1)); // Enable LP Tokens
            }
        }
    } else {
        if (bondsAddresses[0].length) {
            const calldatas = treasuryIface.encodeFunctionData("enableMulti", args0);
            const description = `Proposal: treasury.enableMulti(${args0})`;
            console.log(`Governor.propose: ${treasuryDeployment.address}, 0, ${calldatas}, ${description}\n`);
        }
        if (bondsAddresses[1].length) {
            for (const bondsAddress of bondsAddresses[1]) {
                const args1 = [
                    5 as BigNumberish,
                    bondsAddress as string,
                    bondingCalculatorDeployment.address as string,
                ] as const;
                const calldatas = treasuryIface.encodeFunctionData("enable", args1);
                const description = `Proposal: treasury.enable(${args1})`;
                console.log(`Governor.propose: ${treasuryDeployment.address}, 0, ${calldatas}, ${description}\n`);
            }
        }
        console.log(`Setup -- treasury.enable[Multi]\n`);
    }

    // END Create bonds

    console.log("END: deploy: avalanche p2");
};

func.tags = [
    "avalanche",
    "avalancheP2",
];
func.dependencies = [
    CONTRACTS.ohm,
    CONTRACTS.treasury,
    CONTRACTS.bondDepo,
];

export default func;

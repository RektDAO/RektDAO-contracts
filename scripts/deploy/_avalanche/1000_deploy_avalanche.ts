import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { BOND_VESTING, CHAIN_ID, CONTRACTS, NetworkId } from "../../constants";
import {
    OpenOHM__factory,
    OpenSOHM__factory,
    OlympusTreasury__factory,
    OlympusBondDepositoryV2__factory,
} from "../../../types";
import { waitFor } from "../../txHelper";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    if (CHAIN_ID != NetworkId.AVALANCHE) {
        return;
    }
    console.log("BEGIN: deploy: avalanche");

    const { deployments, getNamedAccounts, network, ethers } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
    const signer = await ethers.provider.getSigner(deployer);

    const ohmDeployment = await deployments.get(CONTRACTS.ohm);
    const sOhmDeployment = await deployments.get(CONTRACTS.sOhm);
    const treasuryDeployment = await deployments.get(CONTRACTS.treasury);
    const bondDepoDeployment = await deployments.get(CONTRACTS.bondDepo);

    const ohm = OpenOHM__factory.connect(ohmDeployment.address, signer);
    const sOhm = OpenSOHM__factory.connect(sOhmDeployment.address, signer);
    const treasury = OlympusTreasury__factory.connect(treasuryDeployment.address, signer);
    const bondDepo = OlympusBondDepositoryV2__factory.connect(bondDepoDeployment.address, signer);

    // https://www.coingecko.com/en/coins/wrapped-avax
    const reserveTokenAddress1 = "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7"; // wrapped native token: WAVAX
    // https://www.coingecko.com/en/coins/benqi-liquid-staked-avax
    const reserveTokenAddress2 = "0x2b2c81e08f1af8835a78bb2a90ae924ace0ea4be"; // SAVAX
    // https://www.coingecko.com/en/coins/dai
    const reserveTokenAddress3 = "0xd586e7f844cea2f87f50152665bcbc2c279d8d70"; // DAI
    // https://www.coingecko.com/en/coins/frax
    const reserveTokenAddress4 = "0xd24c2ad096400b6fbcd2ad8b24e7acbc21a1da64"; // FRAX
    // https://www.coingecko.com/en/coins/joe
    const reserveTokenAddress5 = "0x57319d41F71E81F3c65F2a47CA4e001EbAFd4F33"; // xJOE
    // https://www.coingecko.com/en/coins/the-graph
    const reserveTokenAddress6 = "0x8a0cac13c7da965a312f08ea4229c37869e85cb9"; // GRT

    // Treasury Actions
    await waitFor(treasury.enableMulti([2], [
        reserveTokenAddress1,
        reserveTokenAddress2,
        reserveTokenAddress3,
        reserveTokenAddress4,
        reserveTokenAddress5,
        reserveTokenAddress6,
    ])); // Enable as a reserve Token

    // Create bonds...
    const block = await ethers.provider.getBlock("latest");

    // _market
    const capacityTotal = 10e18; // 1000e9 = 1000; 1e18 = 1 billion [1e9(e9)]
    console.log("total bonds capacity:", capacityTotal);
    const capacityPct = capacityTotal / 100;
    const buffer = 2e5; // 2e5 = 200000 = 200%
    const priceOne = 1e9; // 1e9 = $1
    const priceEth = 2611.19; // price at launch time
    const priceEthPerK = priceEth / 1000;
    const priceNumerator = priceOne * priceEthPerK;
    const priceToken1 = 75.45; // price at launch time
    const bondPrice1 = Math.floor(priceNumerator / priceToken1);
    const priceToken2 = 75.15; // price at launch time
    const bondPrice2 = Math.floor(priceNumerator / priceToken2);
    const priceToken3 = 1; // price at launch time
    const bondPrice3 = Math.floor(priceNumerator / priceToken3);
    const priceToken4 = 1; // price at launch time
    const bondPrice4 = Math.floor(priceNumerator / priceToken4);
    const priceToken5 = 0.993710; // price at launch time
    const bondPrice5 = Math.floor(priceNumerator / priceToken5);
    const priceToken6 = 0.335559; // price at launch time
    const bondPrice6 = Math.floor(priceNumerator / priceToken6);

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
    // maxPayout per depositInterval = capacity / numIntervals = 10e9 / 8760 = 1_141_552 / hr (total)
    const tuneInterval = depositInterval;

    // create bond: reserveTokenAddress1
    await waitFor(bondDepo.create(
        reserveTokenAddress1,
        [String(capacityPct * 10), String(bondPrice1), buffer],
        [capacityInQuote, fixedTerm],
        [vesting, conclusion],
        [depositInterval, tuneInterval]
    ));
    console.log("Setup -- bond: reserveTokenAddress1");

    // create bond: reserveTokenAddress2
    await waitFor(bondDepo.create(
        reserveTokenAddress2,
        [String(capacityPct * 15), String(bondPrice2), buffer],
        [capacityInQuote, fixedTerm],
        [vesting, conclusion],
        [depositInterval, tuneInterval]
    ));
    console.log("Setup -- bond: reserveTokenAddress2");

    // create bond: reserveTokenAddress3
    await waitFor(bondDepo.create(
        reserveTokenAddress3,
        [String(capacityPct * 10), String(bondPrice3), buffer],
        [capacityInQuote, fixedTerm],
        [vesting, conclusion],
        [depositInterval, tuneInterval]
    ));
    console.log("Setup -- bond: reserveTokenAddress3");

    // create bond: reserveTokenAddress4
    await waitFor(bondDepo.create(
        reserveTokenAddress4,
        [String(capacityPct * 10), String(bondPrice4), buffer],
        [capacityInQuote, fixedTerm],
        [vesting, conclusion],
        [depositInterval, tuneInterval]
    ));
    console.log("Setup -- bond: reserveTokenAddress4");

    // create bond: reserveTokenAddress5
    await waitFor(bondDepo.create(
        reserveTokenAddress5,
        [String(capacityPct * 10), String(bondPrice5), buffer],
        [capacityInQuote, fixedTerm],
        [vesting, conclusion],
        [depositInterval, tuneInterval]
    ));
    console.log("Setup -- bond: reserveTokenAddress5");

    // create bond: reserveTokenAddress6
    await waitFor(bondDepo.create(
        reserveTokenAddress6,
        [String(capacityPct * 5), String(bondPrice6), buffer],
        [capacityInQuote, fixedTerm],
        [vesting, conclusion],
        [depositInterval, tuneInterval]
    ));
    console.log("Setup -- bond: reserveTokenAddress6");

    // END Create bonds

    console.log("END: deploy: avalanche");
};

func.tags = ["avalanche"];
func.dependencies = [
    CONTRACTS.ohm,
    CONTRACTS.treasury,
    CONTRACTS.bondDepo,
];

export default func;

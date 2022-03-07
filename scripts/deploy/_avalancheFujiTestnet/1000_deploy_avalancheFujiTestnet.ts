import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { CHAIN_ID, CONTRACTS, NetworkId } from "../../constants";
import {
    OpenOHM__factory,
    OpenSOHM__factory,
    OlympusTreasury__factory,
    OlympusBondDepositoryV2__factory,
} from "../../../types";
import { waitFor } from "../../txHelper";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    if (CHAIN_ID != NetworkId.AVALANCHE_TESTNET) {
        return;
    }
    console.log("BEGIN: deploy: avalancheFujiTestnet");

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

    // https://faucet.avax-test.network/ -> https://traderjoexyz.com/trade
    const reserveTokenAddress1 = "0xd00ae08403B9bbb9124bB305C09058E32C39A48c";
    // https://faucets.chain.link/fuji
    const reserveTokenAddress2 = "0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846";

    // Treasury Actions
    await waitFor(treasury.enableMulti([2], [reserveTokenAddress1, reserveTokenAddress2])); // Enable as a reserve Token

    // Create bonds...
    const block = await ethers.provider.getBlock("latest");

    // _market
    const capacityTotal = 10e18; // 1000e9 = 1000; 1e18 = 1 billion [1e9(e9)]
    console.log("total bonds capacity:", capacityTotal);
    const capacityPct = capacityTotal / 100;
    const buffer = 2e5; // 2e5 = 200000 = 200%
    const priceOne = 1e9; // 1e9 = $1
    const priceEth = 2639.59; // price at launch time
    const priceNative = 78.16; // price at launch time
    const priceEthPerK = priceEth / 1000;
    const initialPrice1 = Math.floor(priceOne * priceNative / priceEthPerK);
    const priceToken2 = 13.86; // price at launch time
    const initialPrice2 = Math.floor(priceOne * priceToken2 / priceEthPerK);

    // _booleans
    const capacityInQuote = false;
    const fixedTerm = true;

    // _terms
    const vesting = 10; // seconds
    const timeToConclusion = 60 * 60 * 24 * 365; // 1 year = 31536000 seconds
    const conclusion = block.timestamp + timeToConclusion;

    // _intervals
    const depositInterval = 60 * 60; // 1 hr
    // numIntervals = timeToConclusion / depositInterval = 8760
    // maxPayout per depositInterval = capacity / numIntervals = 10e9 / 8760 = 1_141_552 / hr (total)
    const tuneInterval = depositInterval;

    // create bond: reserveTokenAddress1
    await bondDepo.create(
        reserveTokenAddress1,
        [String(capacityPct * 50), String(initialPrice1), buffer],
        [capacityInQuote, fixedTerm],
        [vesting, conclusion],
        [depositInterval, tuneInterval]
    );
    console.log("Setup -- bond: reserveTokenAddress1");

    // create bond: reserveTokenAddress2
    await bondDepo.create(
        reserveTokenAddress2,
        [String(capacityPct * 50), String(initialPrice2), buffer],
        [capacityInQuote, fixedTerm],
        [vesting, conclusion],
        [depositInterval, tuneInterval]
    );
    console.log("Setup -- bond: reserveTokenAddress2");
    // END Create bonds

    console.log("END: deploy: avalancheFujiTestnet");
};

func.tags = ["avalancheFujiTestnet"];
func.dependencies = [
    CONTRACTS.ohm,
    CONTRACTS.treasury,
    CONTRACTS.bondDepo,
];
func.runAtTheEnd = true;

export default func;

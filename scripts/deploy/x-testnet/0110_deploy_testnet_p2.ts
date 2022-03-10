import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { CONTRACTS, MOCK_MINT, MOCK_MINT_PROFIT, IS_TESTNET } from "../../constants";
import {
    OpenOHM__factory,
    OpenSOHM__factory,
    OlympusTreasury__factory,
    OlympusBondDepositoryV2__factory,
    DAI__factory,
    FRAX__factory,
} from "../../../types";
import { waitFor } from "../../txHelper";

const faucetContract = "OhmFaucet";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    if (!IS_TESTNET) {
        return;
    }

    const { deployments, getNamedAccounts, network, ethers } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
    const signer = await ethers.provider.getSigner(deployer);

    const ohmDeployment = await deployments.get(CONTRACTS.ohm);
    const sOhmDeployment = await deployments.get(CONTRACTS.sOhm);
    const treasuryDeployment = await deployments.get(CONTRACTS.treasury);
    const daiDeployment = await deployments.get(CONTRACTS.DAI);
    const fraxDeployment = await deployments.get(CONTRACTS.FRAX);
    const bondDepoDeployment = await deployments.get(CONTRACTS.bondDepo);

    const ohm = OpenOHM__factory.connect(ohmDeployment.address, signer);
    const sOhm = OpenSOHM__factory.connect(sOhmDeployment.address, signer);
    const mockDai = DAI__factory.connect(daiDeployment.address, signer);
    const mockFrax = FRAX__factory.connect(fraxDeployment.address, signer);
    const treasury = OlympusTreasury__factory.connect(treasuryDeployment.address, signer);
    const bondDepo = OlympusBondDepositoryV2__factory.connect(bondDepoDeployment.address, signer);

    const faucetDeployment = await deployments.get(faucetContract);

    let faucetBalance = await ohm.balanceOf(faucetDeployment.address);
    const minOhm = ethers.BigNumber.from(10000e9);
    if (faucetBalance.gt(minOhm)) {
        // short circuit if faucet balance is above 10k ohm
        console.log("Sufficient faucet balance");
        // return;
    }

    const daiAmount = MOCK_MINT;

    // Mint Frax
    const fraxAmount = MOCK_MINT;
    await waitFor(mockFrax.mint(deployer, fraxAmount));
    const fraxBalance = await mockFrax.balanceOf(deployer);
    console.log("Frax minted: ", fraxBalance.toString());

    // Treasury Actions
    await waitFor(treasury.enable(2, mockFrax.address, ethers.constants.AddressZero)); // Enable Frax as a reserve Token

    // Deposit and mint ohm
    await waitFor(mockFrax.approve(treasury.address, fraxAmount)); // Approve treasury to use the frax
    await waitFor(treasury.deposit(fraxAmount, mockFrax.address, MOCK_MINT_PROFIT)); // Deposit Frax into treasury, with a profit set, so that we have reserves for staking
    const ohmMinted = await ohm.balanceOf(deployer);
    console.log("Ohm minted: ", ohmMinted.toString());

    // Fund faucet w/ newly minted frax.
    await waitFor(ohm.approve(faucetDeployment.address, ohmMinted));
    await waitFor(ohm.transfer(faucetDeployment.address, ohmMinted));

    faucetBalance = await ohm.balanceOf(faucetDeployment.address);
    console.log("Faucet balance:", faucetBalance.toString());

    // Create bonds...
    const block = await ethers.provider.getBlock("latest");

    // _market
    let capacityTotal = 100e18; // 1000e9 = 1000; 1e18 = 1 billion [1e9(e9)]
    console.log("total bonds capacity:", capacityTotal);
    let capacityPct = capacityTotal / 100;
    let initialPrice = 1e9; // 1e9 = $1
    let buffer = 2e5; // 2e5 = 200000 = 200%

    // _booleans
    let capacityInQuote = false;
    let fixedTerm = true;

    // _terms
    let vesting = 10;
    let timeToConclusion = 60 * 60 * 24 * 365; // 1 year = 31536000 seconds
    let conclusion = block.timestamp + timeToConclusion;

    // _intervals
    let depositInterval = 60 * 60; // 1 hr
    // numIntervals = timeToConclusion / depositInterval = 8760
    // maxPayout per depositInterval = capacity / numIntervals = 100e9 / 8760 = 11_415_525 / hr (total)
    let tuneInterval = depositInterval;

    // create bond: DAI
    await waitFor(bondDepo.create(
        mockDai.address,
        [String(capacityPct * 10), String(initialPrice * 1), buffer],
        [capacityInQuote, fixedTerm],
        [vesting, conclusion],
        [depositInterval, tuneInterval]
    ));
    console.log("Setup -- bond: DAI");

    // create bond: FRAX
    await waitFor(bondDepo.create(
        mockFrax.address,
        [String(capacityPct * 10), String(initialPrice * 2), buffer],
        [capacityInQuote, fixedTerm],
        [vesting, conclusion],
        [depositInterval, tuneInterval]
    ));
    console.log("Setup -- bond: FRAX");
    // END Create bonds

    // extra mint
    await waitFor(mockDai.mint(deployer, daiAmount));
    await waitFor(mockDai.approve(bondDepo.address, daiAmount)); // Approve bondDepo to use the dai
    await waitFor(mockFrax.mint(deployer, fraxAmount));
    await waitFor(mockFrax.approve(bondDepo.address, fraxAmount)); // Approve bondDepo to use the frax
};

func.tags = ["faucet", "testnet"];
func.dependencies = [
    CONTRACTS.ohm,
    CONTRACTS.DAI,
    CONTRACTS.FRAX,
    CONTRACTS.treasury,
    CONTRACTS.bondDepo,
];
func.runAtTheEnd = true;

export default func;

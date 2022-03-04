import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { waitFor } from "../txHelper";
import { CONTRACTS, EREKT_MINT, EREKT_MINT_INT, EREKT_MINT_PROFIT, INITIAL_REWARD_RATE, TOKEN_DECIMALS_TENS } from "../constants";
import {
    OlympusAuthority__factory,
    Distributor__factory,
    OpenOHM__factory,
    OlympusStaking__factory,
    OpenSOHM__factory,
    OpenGOHM__factory,
    OpenGovernor__factory,
    OlympusTreasury__factory,
    OlympusBondDepositoryV2__factory,
    EnterREKT__factory,
} from "../../types";


// TODO: Shouldn't run setup methods if the contracts weren't redeployed.
const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts, ethers } = hre;
    const { deployer, devFund } = await getNamedAccounts();
    const signer = await ethers.provider.getSigner(deployer);

    const authorityDeployment = await deployments.get(CONTRACTS.authority);
    const ohmDeployment = await deployments.get(CONTRACTS.ohm);
    const sOhmDeployment = await deployments.get(CONTRACTS.sOhm);
    const gOhmDeployment = await deployments.get(CONTRACTS.gOhm);
    const distributorDeployment = await deployments.get(CONTRACTS.distributor);
    const treasuryDeployment = await deployments.get(CONTRACTS.treasury);
    const stakingDeployment = await deployments.get(CONTRACTS.staking);
    const bondDepoDeployment = await deployments.get(CONTRACTS.bondDepo);
    const governorDeployment = await deployments.get(CONTRACTS.governor);
    const eRektDeployment = await deployments.get(CONTRACTS.eREKT);

    const authorityContract = await OlympusAuthority__factory.connect(
        authorityDeployment.address,
        signer
    );
    const ohm = OpenOHM__factory.connect(ohmDeployment.address, signer);
    const sOhm = OpenSOHM__factory.connect(sOhmDeployment.address, signer);
    const gOhm = OpenGOHM__factory.connect(gOhmDeployment.address, signer);
    const distributor = Distributor__factory.connect(distributorDeployment.address, signer);
    const staking = OlympusStaking__factory.connect(stakingDeployment.address, signer);
    const treasury = OlympusTreasury__factory.connect(treasuryDeployment.address, signer);
    const bondDepo = OlympusBondDepositoryV2__factory.connect(bondDepoDeployment.address, signer);
    const governor = OpenGovernor__factory.connect(governorDeployment.address, signer);
    const eRekt = EnterREKT__factory.connect(eRektDeployment.address, signer);

    // treasury enables:
    // [treasury.enable(8, distributor.address...) done already]

    // BondDepository mints from NoteKeeper::addNote
    await waitFor(treasury.enable(8, bondDepo.address, ethers.constants.AddressZero)); // Allows bondDepo to mint ohm.
    // BondDepository calls deposited() so enable it too
    await waitFor(treasury.enableMulti([0,4], [bondDepo.address, deployer])); // reserve depositor, liquidity depositor
    // await waitFor(treasury.enable(0, bondDepo.address, ethers.constants.AddressZero)); // bondDepo reserve depositor
    // await waitFor(treasury.enable(4, bondDepo.address, ethers.constants.AddressZero)); // bondDepo liquidity depositor
    // await waitFor(treasury.enable(0, deployer, ethers.constants.AddressZero)); // deployer reserve depositor
    // await waitFor(treasury.enable(4, deployer, ethers.constants.AddressZero)); // deployer liquidity depositor
    await waitFor(treasury.enable(9, sOhm.address, ethers.constants.AddressZero)); // set sOHM
    // [treasury.enable(2, RESERVETOKEN.address...) needs to be done per token per chain!]
    // [treasury.enable(5, LIQUIDITYTOKEN.address...) needs to be done per token per chain!]
    console.log("Setup -- treasury.enable");

    await waitFor(gOhm.setStaking(staking.address)); // change gOHM minter
    console.log("Setup -- gOhm.setStaking");

    // git eRekt
    await waitFor(treasury.enable(2, eRekt.address, ethers.constants.AddressZero)); // Enable eRekt as a reserve Token
    await waitFor(eRekt.approve(treasury.address, ethers.constants.MaxUint256));
    await waitFor(treasury.deposit(EREKT_MINT, eRekt.address, EREKT_MINT_PROFIT));
    await waitFor(ohm.approve(staking.address, ethers.constants.MaxUint256)); // Approve staking contact to spend deployer's OHM
    await waitFor(staking.stake(devFund, (Number(EREKT_MINT_PROFIT) /*/ TOKEN_DECIMALS_TENS*/), false, true));
    console.log("Setup -- ohm.mint & staking.stake: to development fund");

    // const sOhmSupply = Number(await sOhm.totalSupply());
    // await waitFor(gOhm.mint(devFund, (await gOhm.balanceTo(sOhmSupply * .1)))); // 10% to development fund
    // await waitFor(distributor.addRecipient(devFund, INITIAL_REWARD_RATE * .1)); // .01% of future rewards to development fund

    // Set distributor on staking *after* devFund staking.stake
    await waitFor(staking.setDistributor(distributor.address));
    console.log("Setup -- staking.setDistributor:  distributor set on staking");
};

func.tags = ["setup"];
func.dependencies = [
    CONTRACTS.authority,
    CONTRACTS.ohm,
    CONTRACTS.sOhm,
    CONTRACTS.gOhm,
    CONTRACTS.distributor,
    CONTRACTS.treasury,
    CONTRACTS.staking,
    CONTRACTS.bondDepo,
];

export default func;

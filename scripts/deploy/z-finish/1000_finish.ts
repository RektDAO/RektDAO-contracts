import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { waitFor } from "../../txHelper";
import { CONTRACTS, TOKEN_DECIMALS_TENS } from "../../constants";
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
} from "../../../types";


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

    // governor is governor
    await waitFor(authorityContract.pushPolicy(governorDeployment.address, true));
    console.log("Setup -- authorityContract.pushPolicy: set policy on authority");
    await waitFor(authorityContract.pushGovernor(governorDeployment.address, true));
    console.log("Setup -- authorityContract.pushGovernor: set governor on authority");
};

func.tags = ["setup", "finish"];
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
func.runAtTheEnd = true;

export default func;

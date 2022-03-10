import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { CONTRACTS } from "../constants";
import { verify } from "../verifyHelper";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const treasuryDeployment = await deployments.get(CONTRACTS.treasury);
    const ohmDeployment = await deployments.get(CONTRACTS.ohm);
    const sOhmDeployment = await deployments.get(CONTRACTS.sOhm);
    const stakingDeployment = await deployments.get(CONTRACTS.staking);
    const authorityDeployment = await deployments.get(CONTRACTS.authority);

    // TODO: firstEpochBlock is passed in but contract constructor param is called _nextEpochBlock
    const constructorArguments: any[] = [
        treasuryDeployment.address,
        ohmDeployment.address,
        sOhmDeployment.address,
        stakingDeployment.address,
        authorityDeployment.address,
    ];
    const dep = await deploy(CONTRACTS.distributor, {
        from: deployer,
        args: constructorArguments,
        log: true,
        skipIfAlreadyDeployed: true,
    });
    if (dep.newlyDeployed) await verify(hre, dep.address, constructorArguments);
};

func.tags = [CONTRACTS.distributor, "staking"];
func.dependencies = [
    CONTRACTS.treasury,
    CONTRACTS.ohm,
    CONTRACTS.sOhm,
    CONTRACTS.staking,
    CONTRACTS.bondingCalculator,
    CONTRACTS.authority,
];

export default func;

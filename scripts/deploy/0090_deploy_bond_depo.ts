import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { CONTRACTS } from "../constants";
import { verify } from "../verifyHelper";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const authorityDeployment = await deployments.get(CONTRACTS.authority);
    const ohmDeployment = await deployments.get(CONTRACTS.ohm);
    const gOhmDeployment = await deployments.get(CONTRACTS.gOhm);
    const stakingDeployment = await deployments.get(CONTRACTS.staking);
    const treasuryDeployment = await deployments.get(CONTRACTS.treasury);

    const constructorArguments: any[] = [
        authorityDeployment.address,
        ohmDeployment.address,
        gOhmDeployment.address,
        stakingDeployment.address,
        treasuryDeployment.address,
    ];
    const dep = await deploy(CONTRACTS.bondDepo, {
        from: deployer,
        args: constructorArguments,
        log: true,
        skipIfAlreadyDeployed: true,
    });
    if (dep.newlyDeployed) await verify(hre, dep.address, constructorArguments);
};

func.tags = [CONTRACTS.bondDepo, "staking", "bonding"];
func.dependencies = [
    CONTRACTS.authority,
    CONTRACTS.ohm,
    CONTRACTS.gOhm,
    CONTRACTS.staking,
    CONTRACTS.treasury,
];

export default func;

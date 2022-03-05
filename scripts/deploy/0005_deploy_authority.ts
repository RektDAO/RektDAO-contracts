import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { CONTRACTS } from "../constants";
import { verify } from "../verifyHelper";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const governorDeployment = await deployments.get(CONTRACTS.governor);

    const constructorArguments: any[] = [deployer, deployer, deployer, deployer];
    const authorityDeployment = await deploy(CONTRACTS.authority, {
        from: deployer,
        args: constructorArguments,
        log: true,
        skipIfAlreadyDeployed: true,
    });
    await verify(hre, authorityDeployment.address, constructorArguments);
};

func.tags = [CONTRACTS.authority, "migration", "staking"];
func.dependencies = [
    CONTRACTS.governor,
];

export default func;

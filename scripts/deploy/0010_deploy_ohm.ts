import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { CONTRACTS } from "../constants";
import { verify } from "../verifyHelper";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const authorityDeployment = await deployments.get(CONTRACTS.authority);

    const constructorArguments: any[] = [authorityDeployment.address];
    const dep = await deploy(CONTRACTS.ohm, {
        from: deployer,
        args: constructorArguments,
        log: true,
        skipIfAlreadyDeployed: true,
    });
    if (dep.newlyDeployed) await verify(hre, dep.address, constructorArguments);
};

func.tags = [CONTRACTS.ohm, "staking", "tokens"];
func.dependencies = [CONTRACTS.authority];
export default func;

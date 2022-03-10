import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { CONTRACTS, IS_TESTNET } from "../../constants";
import { verify } from "../../verifyHelper";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    if (!IS_TESTNET) {
        return;
    }

    const { deployments, getNamedAccounts, network, ethers } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const constructorArguments: any[] = [0];
    const dep = await deploy(CONTRACTS.FRAX, {
        from: deployer,
        args: constructorArguments,
        log: true,
        skipIfAlreadyDeployed: true,
    });
    if (dep.newlyDeployed) await verify(hre, dep.address, constructorArguments);
};

export default func;
func.tags = [CONTRACTS.FRAX, "testnet"];

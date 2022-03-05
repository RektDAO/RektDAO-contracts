import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { CONTRACTS, TREASURY_TIMELOCK } from "../constants";
import { verify } from "../verifyHelper";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts, ethers } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
    const signer = await ethers.provider.getSigner(deployer);

    const ohmDeployment = await deployments.get(CONTRACTS.ohm);
    const authorityDeployment = await deployments.get(CONTRACTS.authority);

    const constructorArguments: any[] = [ohmDeployment.address, TREASURY_TIMELOCK, authorityDeployment.address];
    const treasuryDeployment = await deploy(CONTRACTS.treasury, {
        from: deployer,
        args: constructorArguments,
        log: true,
        skipIfAlreadyDeployed: true,
    });
    await verify(hre, treasuryDeployment.address, constructorArguments);
};

func.tags = [CONTRACTS.treasury, "treasury"];
func.dependencies = [CONTRACTS.ohm];

export default func;

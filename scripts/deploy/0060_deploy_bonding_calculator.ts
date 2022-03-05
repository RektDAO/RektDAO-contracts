import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { CONTRACTS } from "../constants";
import { verify } from "../verifyHelper";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts, ethers } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
    const signer = await ethers.provider.getSigner(deployer);

    const ohmDeployment = await deployments.get(CONTRACTS.ohm);

    const constructorArguments: any[] = [ohmDeployment.address];
    const bondingCalculatorDeployment = await deploy(CONTRACTS.bondingCalculator, {
        from: deployer,
        args: constructorArguments,
        log: true,
        skipIfAlreadyDeployed: true,
    });
    await verify(hre, bondingCalculatorDeployment.address, constructorArguments);
};

func.tags = [CONTRACTS.bondingCalculator, "staking", "bonding"];
func.dependencies = [CONTRACTS.ohm];

export default func;

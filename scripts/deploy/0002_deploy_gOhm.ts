import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { CONTRACTS } from "../constants";
import { verify } from "../verifyHelper";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const sOhmDeployment = await deployments.get(CONTRACTS.sOhm);
    // const migratorDeployment = await deployments.get(CONTRACTS.migrator);

    const constructorArguments: any[] = [deployer, sOhmDeployment.address];
    const gOhmDeployment = await deploy(CONTRACTS.gOhm, {
        from: deployer,
        args: constructorArguments,
        log: true,
        skipIfAlreadyDeployed: true,
    });
    await verify(hre, gOhmDeployment.address, constructorArguments);
};

func.tags = [CONTRACTS.gOhm, /*"migration", */"tokens"];
func.dependencies = [
    // CONTRACTS.migrator,
];

export default func;

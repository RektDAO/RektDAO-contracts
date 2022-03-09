import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { CONTRACTS, EREKT_MINT_INT } from "../constants";
import { verify } from "../verifyHelper";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const constructorArguments: any[] = [EREKT_MINT_INT];
    const dep = await deploy(CONTRACTS.eREKT, {
        from: deployer,
        args: constructorArguments,
        log: true,
        skipIfAlreadyDeployed: true,
    });
    if (dep.newlyDeployed) await verify(hre, dep.address, constructorArguments, "contracts/REKT/eREKT.sol:EnterREKT");
};

func.tags = [CONTRACTS.eREKT, "tokens"];
func.dependencies = [
];

export default func;

import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { BLOCKS_PER_DAY, CONTRACTS } from "../constants";
import { verify } from "../verifyHelper";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const gOhmDeployment = await deployments.get(CONTRACTS.gOhm);

    const constructorArguments: any[] = [
        gOhmDeployment.address,
        Math.round(BLOCKS_PER_DAY / 24) /* will change this after deploying ie setVotingPeriod(BLOCKS_PER_DAY * 3) */
    ];
    const dep = await deploy(CONTRACTS.governor, {
        from: deployer,
        args: constructorArguments,
        log: true,
        skipIfAlreadyDeployed: true,
    });
    if (dep.newlyDeployed) await verify(hre, dep.address, constructorArguments);
};

func.tags = [CONTRACTS.governor, "governor"];
func.dependencies = [
    CONTRACTS.gOhm,
];

export default func;

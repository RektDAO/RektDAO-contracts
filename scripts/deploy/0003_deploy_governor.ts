import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { BLOCKS_PER_DAY, CONTRACTS } from "../constants";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const gOhmDeployment = await deployments.get(CONTRACTS.gOhm);

    await deploy(CONTRACTS.governor, {
        from: deployer,
        args: [
            gOhmDeployment.address,
            Math.round(BLOCKS_PER_DAY / 24) /* will change this after deploying ie setVotingPeriod(BLOCKS_PER_DAY * 3) */
        ],
        log: true,
        skipIfAlreadyDeployed: true,
    });
};

func.tags = [CONTRACTS.governor, "governor"];
func.dependencies = [
    CONTRACTS.gOhm,
];

export default func;

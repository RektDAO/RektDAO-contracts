import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { CONTRACTS, SECONDARY_DEPLOYMENTS } from "../../constants";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts, network, ethers } = hre;
    const { deployer } = await getNamedAccounts();

    const ohmDeployment = await deployments.get(CONTRACTS.ohm);
    const sOhmDeployment = await deployments.get(CONTRACTS.sOhm);
    const gOhmDeployment = await deployments.get(CONTRACTS.gOhm);
    const governorDeployment = await deployments.get(CONTRACTS.governor);
    const treasuryDeployment = await deployments.get(CONTRACTS.treasury);
    // const migratorDeployment = await deployments.get(CONTRACTS.migrator);
    const bondingCalculatorDeployment = await deployments.get(CONTRACTS.bondingCalculator);
    const stakingDeployment = await deployments.get(CONTRACTS.staking);
    const distributorDeployment = await deployments.get(CONTRACTS.distributor);
    const bondDepoDeployment = await deployments.get(CONTRACTS.bondDepo);
    const daiDeployment = await deployments.get(CONTRACTS.DAI);
    const fraxDeployment = await deployments.get(CONTRACTS.FRAX);

    console.log("// LOCAL ADDRESSES");
    console.log("REACT_APP_LOCAL_CONTRACT_OHM_V2=" + ohmDeployment.address);
    console.log("REACT_APP_LOCAL_CONTRACT_SOHM_V2=" + sOhmDeployment.address);
    console.log("REACT_APP_LOCAL_CONTRACT_GOHM_ADDRESS=" + gOhmDeployment.address);
    console.log("REACT_APP_LOCAL_CONTRACT_GOVERNOR_ADDRESS=" + governorDeployment.address);
    console.log("REACT_APP_LOCAL_CONTRACT_TREASURY_V2=" + treasuryDeployment.address);
    console.log("REACT_APP_LOCAL_CONTRACT_MIGRATOR_ADDRESS="/* + migratorDeployment.address */);
    console.log("REACT_APP_LOCAL_CONTRACT_BONDINGCALC_V2=" + bondingCalculatorDeployment.address);
    console.log("REACT_APP_LOCAL_CONTRACT_STAKING_V2=" + stakingDeployment.address);
    console.log("REACT_APP_LOCAL_CONTRACT_DISTRIBUTOR_ADDRESS=" + distributorDeployment.address);
    console.log("REACT_APP_LOCAL_CONTRACT_BOND_DEPOSITORY=" + bondDepoDeployment.address);
    console.log("REACT_APP_LOCAL_CONTRACT_DAI_ADDRESS=" + daiDeployment.address);
    console.log("REACT_APP_LOCAL_CONTRACT_FRAX_ADDRESS=" + fraxDeployment.address);
    console.log("REACT_APP_LOCAL_CONTRACT_DAO_TREASURY=" + SECONDARY_DEPLOYMENTS.daoFunds);
    console.log("// /LOCAL ADDRESSES");
};

func.tags = ["setup", "finish"];
func.dependencies = [
    CONTRACTS.ohm,
    CONTRACTS.sOhm,
    CONTRACTS.gOhm,
    CONTRACTS.governor,
    CONTRACTS.treasury,
    // CONTRACTS.migrator,
    CONTRACTS.bondingCalculator,
    CONTRACTS.staking,
    CONTRACTS.distributor,
    CONTRACTS.bondDepo,
    CONTRACTS.DAI,
    CONTRACTS.FRAX,
];
func.runAtTheEnd = true;

export default func;

import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { CONTRACTS, NETWORK_ID_KEY, SECONDARY_DEPLOYMENTS } from "../../constants";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts, network, ethers } = hre;
    const { deployer, daoMultisig } = await getNamedAccounts();

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
    const daiDeployment = await deployments.getOrNull(CONTRACTS.DAI) || { address: "" };
    const fraxDeployment = await deployments.getOrNull(CONTRACTS.FRAX) || { address: "" };

    const daoFundsAddress = SECONDARY_DEPLOYMENTS.daoFunds || daoMultisig;

    // TODO: remove from .env
    console.log("\n\n// FOR FRONTEND: .env");
    console.log(`// ${NETWORK_ID_KEY} ADDRESSES`);
    console.log(`REACT_APP_${NETWORK_ID_KEY}_CONTRACT_OHM_V2=${ohmDeployment.address}`);
    console.log(`REACT_APP_${NETWORK_ID_KEY}_CONTRACT_SOHM_V2=${sOhmDeployment.address}`);
    console.log(`REACT_APP_${NETWORK_ID_KEY}_CONTRACT_GOHM_ADDRESS=${gOhmDeployment.address}`);
    console.log(`REACT_APP_${NETWORK_ID_KEY}_CONTRACT_GOVERNOR_ADDRESS=${governorDeployment.address}`);
    console.log(`REACT_APP_${NETWORK_ID_KEY}_CONTRACT_TREASURY_V2=${treasuryDeployment.address}`);
    console.log(`REACT_APP_${NETWORK_ID_KEY}_CONTRACT_MIGRATOR_ADDRESS=`); // migratorDeployment.address
    console.log(`REACT_APP_${NETWORK_ID_KEY}_CONTRACT_BONDINGCALC_V2=${bondingCalculatorDeployment.address}`);
    console.log(`REACT_APP_${NETWORK_ID_KEY}_CONTRACT_STAKING_V2=${stakingDeployment.address}`);
    console.log(`REACT_APP_${NETWORK_ID_KEY}_CONTRACT_DISTRIBUTOR_ADDRESS=${distributorDeployment.address}`);
    console.log(`REACT_APP_${NETWORK_ID_KEY}_CONTRACT_BOND_DEPOSITORY=${bondDepoDeployment.address}`);
    console.log(`REACT_APP_${NETWORK_ID_KEY}_CONTRACT_DAO_TREASURY=${daoFundsAddress}`);
    console.log(`REACT_APP_${NETWORK_ID_KEY}_CONTRACT_DAI_ADDRESS=${daiDeployment.address}`);
    console.log(`REACT_APP_${NETWORK_ID_KEY}_CONTRACT_FRAX_ADDRESS=${fraxDeployment.address}`);
    console.log(`// /${NETWORK_ID_KEY} ADDRESSES`);

    console.log("\n\n// FOR FRONTEND: networkDetails.ts");
    console.log(`// ${NETWORK_ID_KEY} ADDRESSES`);
    console.log(`OHM_V2: "${ohmDeployment.address}",`);
    console.log(`SOHM_V2: "${sOhmDeployment.address}",`);
    console.log(`GOHM_ADDRESS: "${gOhmDeployment.address}",`);
    console.log(`GOVERNOR_ADDRESS: "${governorDeployment.address}",`);
    console.log(`TREASURY_V2: "${treasuryDeployment.address}",`);
    console.log(`MIGRATOR_ADDRESS: "",`); // migratorDeployment.address
    console.log(`BONDINGCALC_V2: "${bondingCalculatorDeployment.address}",`);
    console.log(`STAKING_V2: "${stakingDeployment.address}",`);
    console.log(`DISTRIBUTOR_ADDRESS: "${distributorDeployment.address}",`);
    console.log(`BOND_DEPOSITORY: "${bondDepoDeployment.address}",`);
    console.log(`DAO_TREASURY: "${daoFundsAddress}",`);
    console.log(`DAI_ADDRESS: "${daiDeployment.address}",`);
    console.log(`FRAX_ADDRESS: "${fraxDeployment.address}",`);
    console.log(`// /${NETWORK_ID_KEY} ADDRESSES`);
};

func.tags = ["setup", "finish", "print"];
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
];
func.runAtTheEnd = true;

export default func;

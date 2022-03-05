import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { waitFor } from "../txHelper";
import { CONTRACTS, IS_LOCAL, IS_MAINNET, SECONDARY_DEPLOYMENTS } from "../constants";
import { verify } from "../verifyHelper";
import {
    GnosisSafe__factory,
    GnosisSafeL2__factory,
    GnosisSafeProxyFactory__factory,
    // GnosisSafeProxy__factory,
} from "../../types";

// https://blog.gnosis.pm/gnosis-safes-multichain-future-b676b5b8f431
// https://medium.com/gauntlet-networks/multisig-transactions-with-gnosis-safe-f5dbe67c1c2d

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts, network, ethers } = hre;
    const { deploy } = deployments;
    const { deployer, daoMultisig } = await getNamedAccounts();

    if (daoMultisig) {
        SECONDARY_DEPLOYMENTS.daoFunds = daoMultisig;
        console.log("daoMultisig exists; skipping: ", CONTRACTS.gnosisSafe);
        return;
    }

    const signer = await ethers.provider.getSigner(deployer);

    let constructorArguments: any[] = [];
    const gnosisSafeSingletonDeployment = await deploy(CONTRACTS.gnosisSafe, {
        from: deployer,
        args: constructorArguments,
        log: true,
        skipIfAlreadyDeployed: true,
        // deterministicDeployment: true,
    });
    await verify(hre, gnosisSafeSingletonDeployment.address, constructorArguments);

    const gnosisSafeSingleton__factory = IS_MAINNET ? GnosisSafe__factory : GnosisSafeL2__factory;
    const gnosisSafeSingleton = gnosisSafeSingleton__factory.connect(gnosisSafeSingletonDeployment.address, signer);

    const gnosisSafeProxyFactoryDeployment = await deploy(CONTRACTS.gnosisSafeProxyFactory, {
        from: deployer,
        args: constructorArguments,
        log: true,
        skipIfAlreadyDeployed: true,
        // deterministicDeployment: true,
    });
    await verify(hre, gnosisSafeProxyFactoryDeployment.address, constructorArguments);

    const gnosisSafeProxyFactory = GnosisSafeProxyFactory__factory.connect(gnosisSafeProxyFactoryDeployment.address, signer);

    // https://github.com/gnosis/safe-contracts/blob/main/test/utils/setup.ts#L83
    const initializer = gnosisSafeSingleton.interface.encodeFunctionData("setup", [
        [deployer],
        1,
        ethers.constants.AddressZero,
        "0x",
        ethers.constants.AddressZero,
        ethers.constants.AddressZero,
        0,
        ethers.constants.AddressZero
    ]);
    const saltNonce = await ethers.provider.getTransactionCount(gnosisSafeProxyFactoryDeployment.address);
    const gnosisSafeProxyReceipt = await waitFor(gnosisSafeProxyFactory.createProxyWithNonce(
        gnosisSafeSingletonDeployment.address,
        initializer,
        saltNonce
    ));
    // console.log("gnosisSafeProxyTx", gnosisSafeProxyTx);

    gnosisSafeProxyReceipt.events?.every((event, i) => {
        if (event.event == "ProxyCreation") {
            SECONDARY_DEPLOYMENTS.daoFunds = event.args ? event.args[0] : null;
            return false; // break
        }
        return true; // continue
    });
    if (!SECONDARY_DEPLOYMENTS.daoFunds) {
        console.log("SECONDARY_DEPLOYMENTS.daoFunds NOT SET");
        return;
    }
    console.log("SECONDARY_DEPLOYMENTS.daoFunds", SECONDARY_DEPLOYMENTS.daoFunds);
};

export default func;
func.tags = [
    CONTRACTS.gnosisSafe,
    CONTRACTS.gnosisSafeProxyFactory,
    CONTRACTS.gnosisSafeProxy,
];

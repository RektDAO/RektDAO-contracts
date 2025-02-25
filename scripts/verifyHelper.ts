import { HardhatRuntimeEnvironment } from "hardhat/types";
import { IS_LOCAL } from "./constants";

// https://hardhat.org/plugins/nomiclabs-hardhat-etherscan.html#using-programmatically
export async function verify(hre: HardhatRuntimeEnvironment, address: string, constructorArguments: any[], contract: string | undefined = undefined): Promise<any> {
    if (IS_LOCAL) {
        return true;
    }
    try {
        const res = await hre.run("verify:verify", {
            address,
            constructorArguments,
            contract,
        });
        console.log("\n");
        return true;
    } catch (e) {
        console.error("verify failed:", address, constructorArguments, e);
        return false;
    }
}

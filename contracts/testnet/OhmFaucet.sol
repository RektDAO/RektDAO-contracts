// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.7.5;

import "../interfaces/IERC20.sol";
import "../interfaces/IERC20Metadata.sol";
import "../types/Ownable.sol";

contract OhmFaucet is Ownable {
    IERC20 public ohm;
    uint256 public constant dripTokens = 10;
    uint256 public dripWei;

    constructor(address _ohm) {
        setOhm(_ohm);
    }

    function setOhm(address _ohm) public onlyOwner {
        ohm = IERC20(_ohm);
        dripWei = dripTokens * ((10**IERC20Metadata(_ohm).decimals()));
    }

    function dispense() external {
        require(ohm.balanceOf(msg.sender) == 0, "OHM already dispensed");
        ohm.transfer(msg.sender, dripWei);
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

//import {IgOHM} from "../interfaces/IgOHM.sol";
import {MockOpenERC20} from "./MockOpenERC20.sol";

// TODO fulfills IgOHM but is not inheriting because of dependency issues
contract MockOpenGOHM is MockOpenERC20 {
    /* ========== CONSTRUCTOR ========== */

    uint256 public immutable index;

    constructor(uint256 _initIndex) MockOpenERC20("Governance OHM", "gOHM") {
        index = _initIndex;
    }

    function migrate(address _staking, address _sOhm) external {}

    function balanceFrom(uint256 _amount) public view returns (uint256) {
        return (_amount * index) / 10**decimals();
    }

    function balanceTo(uint256 _amount) public view returns (uint256) {
        return (_amount * (10**decimals())) / index;
    }
}

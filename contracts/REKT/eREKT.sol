// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

// base generated via https://wizard.openzeppelin.com/#erc20

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract EnterREKT is ERC20 {
    constructor(uint256 _amount) ERC20("enter REKT", "eREKT") {
        _mint(msg.sender, _amount * 10 ** decimals());
    }
}

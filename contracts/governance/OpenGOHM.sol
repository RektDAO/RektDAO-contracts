// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

// base generated via https://wizard.openzeppelin.com/#erc20
// compatible w/ https://www.withtally.com/register/protocol

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

import "./OpenGOHMVotes.sol";

contract OpenGOHM is ERC20, ERC20Permit, ERC20Votes, OpenGOHMVotes {
    constructor(address _approved, address _sOHM)
        ERC20("Governance REKT", "gREKT")
        ERC20Permit("Governance REKT")
        OpenGOHMVotes(_approved, _sOHM)
    {}

    // The following functions are overrides required by Solidity.

    function _afterTokenTransfer(address from, address to, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._afterTokenTransfer(from, to, amount);
    }

    function _mint(address to, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._mint(to, amount);
    }

    function _burn(address account, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._burn(account, amount);
    }
}

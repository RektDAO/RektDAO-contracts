// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/IOpenOHM.sol";

import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
import "./types/OlympusAccessControlled.sol";

contract OpenOHM is ERC20Permit, IOpenOHM, OlympusAccessControlled {
    using SafeMath for uint256;

    constructor(address _authority)
        ERC20("Olympus", "OHM")
        ERC20Permit("Olympus")
        OlympusAccessControlled(IOlympusAuthority(_authority))
    {}

    // OVERRIDE
    function decimals() public view virtual override returns (uint8) {
        return 9;
    }

    function mint(address account_, uint256 amount_) external override onlyVault {
        _mint(account_, amount_);
    }

    function burn(uint256 amount) external override {
        _burn(msg.sender, amount);
    }

    function burnFrom(address account_, uint256 amount_) external override {
        _burnFrom(account_, amount_);
    }

    function _burnFrom(address account_, uint256 amount_) internal {
        uint256 decreasedAllowance_ = allowance(account_, msg.sender).sub(
            amount_,
            "ERC20: burn amount exceeds allowance"
        );

        _approve(account_, msg.sender, decreasedAllowance_);
        _burn(account_, amount_);
    }
}

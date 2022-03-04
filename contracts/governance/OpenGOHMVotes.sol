// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "../interfaces/IOpenGOHM.sol";
import "../interfaces/IOpenSOHM.sol";

abstract contract OpenGOHMVotes is IOpenGOHM, ERC20 {
    /* ========== DEPENDENCIES ========== */

    using Address for address;
    using SafeMath for uint256;

    /* ========== MODIFIERS ========== */

    modifier onlyApproved() {
        require(msg.sender == approved, "Only approved");
        _;
    }

    /* ========== STATE VARIABLES ========== */

    IOpenSOHM public sOHM;
    address public approved; // minter

    /* ========== CONSTRUCTOR ========== */

    constructor(address _approved, address _sOHM) {
        require(_approved != address(0), "Zero address: Approved");
        approved = _approved;
        require(_sOHM != address(0), "Zero address: sOHM");
        sOHM = IOpenSOHM(_sOHM);
    }

    /* ========== MUTATIVE FUNCTIONS ========== */

    /**
     * @notice transfer mint rights from deployer to staking
     * @notice can only be done once
     * @param _staking address
     */
    function setStaking(address _staking) external override onlyApproved {
        require(_staking != approved, "Invalid argument");
        require(_staking != address(0), "Zero address found");
        approved = _staking;
    }

    /**
        @notice mint gOHM
        @param _to address
        @param _amount uint
     */
    function mint(address _to, uint256 _amount) external override onlyApproved {
        _mint(_to, _amount);
    }

    /**
        @notice burn gOHM
        @param _from address
        @param _amount uint
     */
    function burn(address _from, uint256 _amount) external override onlyApproved {
        _burn(_from, _amount);
    }

    /* ========== VIEW FUNCTIONS ========== */

    /**
     * @notice pull index from sOHM token
     */
    function index() public view override returns (uint256) {
        return sOHM.index();
    }

    /**
        @notice converts gOHM amount to OHM
        @param _amount uint
        @return uint
     */
    function balanceFrom(uint256 _amount) public view override returns (uint256) {
        return _amount.mul(index()).div(10**decimals());
    }

    /**
        @notice converts OHM amount to gOHM
        @param _amount uint
        @return uint
     */
    function balanceTo(uint256 _amount) public view override returns (uint256) {
        return _amount.mul(10**decimals()).div(index());
    }
}

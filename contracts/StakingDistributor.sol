// SPDX-License-Identifier: AGPL-3.0
pragma solidity >=0.7.5;

import "./Staking.sol";

// import "./libraries/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
// import "./libraries/SafeMath.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./libraries/Uniswap/FixedPoint.sol";

// import "./interfaces/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/IOpenSOHM.sol";
import "./interfaces/ITreasury.sol";
import "./interfaces/IDistributor.sol";

import "./types/OlympusAccessControlled.sol";

contract Distributor is IDistributor, OlympusAccessControlled {
    /* ========== DEPENDENCIES ========== */

    using FixedPoint for FixedPoint.uq112x112;
    using SafeMath for uint256;
    using SafeERC20 for IERC20;
    using SafeERC20 for IOpenSOHM;

    /* ====== VARIABLES ====== */

    IERC20 private immutable ohm;
    IOpenSOHM public immutable sOHM;
    ITreasury private immutable treasury;
    address private immutable staking;

    mapping(uint256 => Adjust) public adjustments;
    uint256 public override bounty;

    uint256 private constant rateDenominator = 1_000_000;

    /* ====== STRUCTS ====== */

    struct Info {
        uint256 rate; // in ten-thousandths ( 5000 = 0.5% )
        address recipient;
    }
    Info[] public info;

    struct Adjust {
        bool add;
        uint256 rate;
        uint256 target;
    }

    /* ====== CONSTRUCTOR ====== */

    constructor(
        address _treasury,
        address _ohm,
        address _sOHM,
        address _staking,
        address _authority
    ) OlympusAccessControlled(IOlympusAuthority(_authority)) {
        require(_treasury != address(0), "Zero address: Treasury");
        treasury = ITreasury(_treasury);
        require(_ohm != address(0), "Zero address: OHM");
        ohm = IERC20(_ohm);
        require(_sOHM != address(0), "Zero address: sOHM");
        sOHM = IOpenSOHM(_sOHM);
        require(_staking != address(0), "Zero address: Staking");
        staking = _staking;

        _setBounty(1e8); // 1e8 == .1 OHM
    }

    /* ====== PUBLIC FUNCTIONS ====== */

    /**
        @notice send epoch reward to staking contract
     */
    function distribute() external override {
        require(msg.sender == staking, "Only staking");
        // distribute rewards to each recipient
        for (uint256 i = 0; i < info.length; i++) {
            if (info[i].rate > 0) {
                treasury.mint(info[i].recipient, nextRewardAt(info[i].rate)); // mint and send tokens
                adjust(i); // check for adjustment
            }
        }
    }

    function retrieveBounty() external override returns (uint256) {
        require(msg.sender == staking, "Only staking");
        // If the distributor bounty is > 0, mint it for the staking contract.
        if (bounty > 0) {
            treasury.mint(address(staking), bounty);
        }

        return bounty;
    }

    /* ====== INTERNAL FUNCTIONS ====== */

    /**
        @notice increment reward rate for collector
     */
    function adjust(uint256 _index) internal {
        Adjust memory adjustment = adjustments[_index];
        if (adjustment.rate != 0) {
            if (adjustment.add) {
                // if rate should increase
                info[_index].rate = info[_index].rate.add(adjustment.rate); // raise rate
                if (info[_index].rate >= adjustment.target) {
                    // if target met
                    adjustments[_index].rate = 0; // turn off adjustment
                    info[_index].rate = adjustment.target; // set to target
                }
            } else {
                // if rate should decrease
                if (info[_index].rate > adjustment.rate) {
                    // protect from underflow
                    info[_index].rate = info[_index].rate.sub(adjustment.rate); // lower rate
                } else {
                    info[_index].rate = 0;
                }

                if (info[_index].rate <= adjustment.target) {
                    // if target met
                    adjustments[_index].rate = 0; // turn off adjustment
                    info[_index].rate = adjustment.target; // set to target
                }
            }
        }
    }

    /**
     * @notice set bounty to incentivize keepers
     * @param _bounty uint256
     */
    function _setBounty(uint256 _bounty) internal {
        require(_bounty <= 2e9, "Too much");
        bounty = _bounty;
    }

    /**
        @notice adds recipient for distributions
        @param _recipient address
        @param _rewardRate uint
     */
    function _addRecipient(address _recipient, uint256 _rewardRate) internal {
        require(_recipient != address(0), "Zero address: Recipient");
        require(_rewardRate <= rateDenominator, "Rate cannot exceed denominator");
        info.push(Info({recipient: _recipient, rate: _rewardRate}));
    }

    /* ====== VIEW FUNCTIONS ====== */

    /**
        @notice for informational purposes
        @notice pure function for sqrt
        @param _x uint
        @return uint
     */
    function sqrt(uint256 _x) public pure returns (uint256) {
        return Babylonian.sqrt(_x);
    }

    /**
        @notice for informational purposes
        @notice pure function for sqrt of fraction
        @param _x uint
        @param _y uint
        @return uint
     */
    function sqrtFraction(uint256 _x, uint256 _y) public pure returns (uint256) {
        return sqrtFractionWith18(_x, _y).div(1e18);
    }

    /**
        @notice for informational purposes
        @notice pure function for sqrt of fraction, with 18 decimals
        @param _x uint
        @param _y uint
        @return uint
     */
    function sqrtFractionWith18(uint256 _x, uint256 _y) public pure returns (uint256) {
        return FixedPoint.sqrt(FixedPoint.fraction(_x, _y)).decode112with18();
    }

    /**
        @notice for informational purposes
        @notice view function for next reward's quadratic denominator
        @return uint
     */
    function nextRewardDenom() public view returns (uint256) {
        return nextRewardDenomWith18().div(1e18);
    }

    /**
        @notice view function for next reward's quadratic denominator, with 18 decimals
        @return uint
     */
    function nextRewardDenomWith18() public view returns (uint256) {
        uint256 staked = sOHM.circulatingSupply();

        // 1e15 = sOHM decimals (1e9) in millions (1e6)
        // add 1 at end so denom is min 1 - NOT necessary due to existence of eREKT before distribution
        return FixedPoint.sqrt(FixedPoint.fraction(staked, 1e15)).decode112with18(); // .add(1e18);
    }

    /**
        @notice view function for next reward at given rate
        @param _rate uint
        @return uint
     */
    function nextRewardAt(uint256 _rate) public view override returns (uint256) {
        return ohm.totalSupply().mul(_rate).div(rateDenominator).mul(1e18).div(nextRewardDenomWith18());
    }

    /**
        @notice view function for next reward for specified address
        @param _recipient address
        @return uint
     */
    function nextRewardFor(address _recipient) public view override returns (uint256) {
        uint256 reward;
        for (uint256 i = 0; i < info.length; i++) {
            if (info[i].recipient == _recipient) {
                reward = reward.add(nextRewardAt(info[i].rate));
            }
        }
        return reward;
    }

    /* ====== POLICY FUNCTIONS ====== */

    /**
     * @notice set bounty to incentivize keepers
     * @param _bounty uint256
     */
    function setBounty(uint256 _bounty) external override onlyGovernor {
        _setBounty(_bounty);
    }

    /**
        @notice adds recipient for distributions
        @param _recipient address
        @param _rewardRate uint
     */
    function addRecipient(address _recipient, uint256 _rewardRate) external override onlyGovernor {
        _addRecipient(_recipient, _rewardRate);
    }

    /**
        @notice removes recipient for distributions
        @param _index uint
     */
    function removeRecipient(uint256 _index) external override {
        require(
            msg.sender == authority.governor() || msg.sender == authority.guardian(),
            "Caller is not governor or guardian"
        );
        require(info[_index].recipient != address(0), "Recipient does not exist");
        info[_index].recipient = address(0);
        info[_index].rate = 0;
    }

    /**
        @notice set adjustment info for a collector's reward rate
        @param _index uint
        @param _add bool
        @param _rate uint
        @param _target uint
     */
    function setAdjustment(
        uint256 _index,
        bool _add,
        uint256 _rate,
        uint256 _target
    ) external override {
        require(
            msg.sender == authority.governor() || msg.sender == authority.guardian(),
            "Caller is not governor or guardian"
        );
        require(info[_index].recipient != address(0), "Recipient does not exist");

        if (msg.sender == authority.guardian()) {
            require(_rate <= info[_index].rate.mul(25).div(1000), "Limiter: cannot adjust by >2.5%");
        }

        if (!_add) {
            require(_rate <= info[_index].rate, "Cannot decrease rate by more than it already is");
        }

        adjustments[_index] = Adjust({add: _add, rate: _rate, target: _target});
    }
}

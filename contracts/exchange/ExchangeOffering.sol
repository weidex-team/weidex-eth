pragma solidity 0.4.24;

import "./Exchange.sol";
import "../utils/CrowdsaleLib.sol";
import "../utils/Token.sol";

contract ExchangeOffering is Exchange {

    using CrowdsaleLib for CrowdsaleLib.Crowdsale;

    mapping(address => CrowdsaleLib.Crowdsale) public crowdsales;

    mapping(address => mapping(address => uint256)) public userContributionForProject;

    event TokenPurchase(
        address indexed project,
        address indexed contributor,
        uint256 tokens,
        uint256 weiAmount
    );

    function registerCrowdsale(
        address _project,
        address _projectWallet,
        uint256[7] _values
    )
        public
        onlyOwner
    {
        crowdsales[_project] = CrowdsaleLib.createCrowdsale(_projectWallet, _values);

        require(
            crowdsales[_project].isValid(),
            "Crowdsale is not active."
        );

        // project contract validation
        require(
            getBonusFactor(_project, crowdsales[_project].minContribution) >= 0,
            "The project should have *getBonusFactor* function implemented. The function should return the bonus percentage depending on the start/end date and contribution amount. Should return 0 if there is no bonus."
        );

        // project contract validation
        require(
            isUserWhitelisted(_project, this),
            "The project should have *isUserWhitelisted* function implemented. This contract address should be whitelisted"
        );
    }

    function buyTokens(address _project)
       public
       payable
    {
        address contributor = msg.sender;

        uint256 weiAmount = msg.value;

        require(
            isUserWhitelisted(_project, contributor), "User is not whitelisted"
        );

        require(
            validContribution(_project, contributor, weiAmount),
            "Contribution is not valid: Check minimum/maximum contribution amount or if crowdsale cap is reached"
        );

        uint256 tokens = weiAmount.mul(crowdsales[_project].tokenRatio);

        uint256 bonus = getBonusFactor(_project, weiAmount);

        uint256 bonusAmount = tokens.mul(bonus).div(100);

        uint256 totalPurchasedTokens = tokens.add(bonusAmount);

        require(Token(_project).transfer(contributor, totalPurchasedTokens), "Transfer failed");

        crowdsales[_project].weiRaised = crowdsales[_project].weiRaised.add(weiAmount);

        userContributionForProject[_project][contributor] = userContributionForProject[_project][contributor].add(weiAmount);

        balances[ETH][crowdsales[_project].wallet] = balances[ETH][crowdsales[_project].wallet].add(weiAmount);

        emit TokenPurchase(_project, contributor, totalPurchasedTokens, weiAmount);
    }

    function saleOpen(address _project)
        public
        view
        returns(bool)
    {
        return crowdsales[_project].isOpened();
    }

    function getBonusFactor(address _project, uint256 _weiAmount)
        public
        view
        returns(uint256)
    {
        return Token(_project).getBonusFactor(crowdsales[_project].startTime, crowdsales[_project].endTime, _weiAmount);
    }

    function isUserWhitelisted(address _project, address _user)
        public
        view
        returns(bool)
    {
        return Token(_project).isUserWhitelisted(_user);
    }

    function validContribution(
        address _project,
        address _user,
        uint256 _weiAmount
    )
        private
        view
        returns(bool)
    {
        if (saleOpen(_project)) {
            // minimum contribution check
            if (_weiAmount < crowdsales[_project].minContribution) {
                return false;
            }

            // maximum contribution check
            if (userContributionForProject[_project][_user].add(_weiAmount) > crowdsales[_project].maxContribution) {
                return false;
            }

            // token sale capacity check
            if (crowdsales[_project].capacity > crowdsales[_project].weiRaised.add(_weiAmount)) {
                return false;
            }
        } else {
            return false;
        }

        return msg.value != 0; // check for non zero contribution
    }

}

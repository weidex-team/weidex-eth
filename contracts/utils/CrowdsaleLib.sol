pragma solidity 0.4.24;

library CrowdsaleLib {

    struct Crowdsale {
        uint256 startTime;
        uint256 endTime;
        uint256 capacity;
        uint256 leftAmount;
        uint256 tokenRatio;
        uint256 minContribution;
        uint256 maxContribution;
        uint256 weiRaised;
        address wallet;
    }

    function isValid(Crowdsale storage _self)
        internal
        view
        returns (bool)
    {
        return (
            (_self.startTime >= now) &&
            (_self.endTime >= _self.startTime) &&
            (_self.tokenRatio > 0) &&
            (_self.wallet != address(0))
        );
    }

    function isOpened(Crowdsale storage _self)
        internal
        view
        returns (bool)
    {
        return (now >= _self.startTime && now <= _self.endTime);
    }

    function createCrowdsale(
        address _wallet,
        uint256[8] _values
    )
        internal
        pure
        returns (Crowdsale memory)
    {
        return Crowdsale({
            startTime: _values[0],
            endTime: _values[1],
            capacity: _values[2],
            leftAmount: _values[3],
            tokenRatio: _values[4],
            minContribution: _values[5],
            maxContribution: _values[6],
            weiRaised: _values[7],
            wallet: _wallet
        });
    }

}

pragma solidity 0.4.24;

import "../utils/Math.sol";
import "../utils/Ownable.sol";

contract DailyVolumeUpdater is Ownable {

    using Math for uint256;

    uint256 public dailyVolume;

    uint256 public dailyVolumeCap;

    uint256 private lastDay;

    uint256 private lastVolumeCapUpdate;

    constructor()
        public
    {
        dailyVolume = 0;
        dailyVolumeCap = 1000 ether;
        lastDay = today();
    }

    /**
    * @dev Allows the owner to change the daily volume capacity.
    * Can be called once every 30 days.
    * @param _dailyVolumeCap uint256 representing the daily volume capacity
    */
    function setDailyVolumeCap(uint256 _dailyVolumeCap)
        public
        onlyOwner
    {
        require(
            lastVolumeCapUpdate + 30 days > block.timestamp,
            "Daily volume cap can be updated once every 30 days"
        );

        dailyVolumeCap = _dailyVolumeCap;

        lastVolumeCapUpdate = block.timestamp;
    }

    /**
    * @dev Internal function that increments the daily volume.
    * @param _volume uint256 representing the amount of volume increasement.
    */
    function updateVolume(uint256 _volume)
        internal
    {
        if(today() > lastDay) {
            dailyVolume = _volume;
            lastDay = today();
        } else {
            dailyVolume = dailyVolume.add(_volume);
        }
    }

    /**
    * @dev Internal function to check if the volume capacity is reached.
    * @return Whether the volume is reached or not.
    */
    function isVolumeReached()
        internal
        view
        returns(bool)
    {
        return dailyVolume >= dailyVolumeCap;
    }

    /**
    * @dev Private function to determine today's index
    * @return uint256 of today's index.
    */
    function today()
        private
        view
        returns(uint256)
    {
        return block.timestamp.div(1 days);
    }

}

/**
 * MovingAvgAudioLevelTrackerFunction
 * @param audioLevel - The audioLevel of the speaker, value between 0 and 1
 *  @returns {object}
 *   @property {number} movingAvg - moving average raw audio level
 *   @property {number} logMovingAvg - moving average mapped to value between 0 and 1
 */
export type MovingAvgAudioLevelTrackerFunction = (audioLevel: number) => {
  movingAvg: number;
  logMovingAvg: number;
};

/**
 * Util factory to create moving average audio level tracker.
 * return a function that can be called with each audio level update and returns the moving average and log
 * moving average values.
 * See for reference: https://developer.vonage.com/en/video/guides/ui-customization/general-customization#adjusting-user-interface-based-on-audio-levels
 * @returns {MovingAvgAudioLevelTrackerFunction}
 */

const createMovingAvgAudioLevelTracker = (): MovingAvgAudioLevelTrackerFunction => {
  let movingAvg = 0;
  return (audioLevel: number) => {
    if (audioLevel === null || movingAvg <= audioLevel) {
      movingAvg = audioLevel;
    } else {
      movingAvg = 0.7 * movingAvg + 0.3 * audioLevel;
    }
    // 1.5 scaling to map the -30 - 0 dBm range to [0,1]
    const logLevel = Math.log(movingAvg) / Math.LN10 / 1.5 + 1;
    const normalizedLogLevel = Math.min(Math.max(logLevel, 0), 1);
    return {
      movingAvg,
      logMovingAvg: normalizedLogLevel,
    };
  };
};

export default createMovingAvgAudioLevelTracker;

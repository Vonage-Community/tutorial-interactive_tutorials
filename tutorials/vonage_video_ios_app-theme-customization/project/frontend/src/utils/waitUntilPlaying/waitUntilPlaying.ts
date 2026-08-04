/**
 * Util function, returns a promise that resolves when video element is playing
 * or after timeout (default 2000ms)
 * @param {(HTMLVideoElement | HTMLObjectElement)} video - DOM element where video is rendered to
 * @param {number} timeoutMs - custom timeout to resolve, default 2000ms
 * @returns {Promise<void>} A promise resolves when video starts playing or is rejected if video can't be played
 */
const waitUntilPlaying = (
  video: HTMLVideoElement | HTMLObjectElement,
  timeoutMs: number = 2000
): Promise<void> => {
  return new Promise<void>((resolve) => {
    video.addEventListener(
      'timeupdate',
      () => {
        resolve();
      },
      { once: true }
    );
    video.addEventListener(
      'loadedmetadata',
      () => {
        resolve();
      },
      { once: true }
    );
    setTimeout(() => {
      resolve();
    }, timeoutMs);
  });
};

export default waitUntilPlaying;

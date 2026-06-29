import useSessionContext from './useSessionContext';

/**
 * Returns the subscriber ID for the current active speaker, or undefined if no participant is actively speaking.
 * @returns {string | undefined} Returns the active speaker ID or undefined if there is no active speaker.
 */
const useActiveSpeaker = (): string | undefined => {
  const { activeSpeakerId } = useSessionContext();
  return activeSpeakerId;
};

export default useActiveSpeaker;

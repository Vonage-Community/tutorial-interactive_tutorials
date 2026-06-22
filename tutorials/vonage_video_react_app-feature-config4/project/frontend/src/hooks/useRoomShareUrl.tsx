import useRoomName from './useRoomName';
/**
 * Creates a shareable link to the waiting room for the current meeting room.
 * @returns {string} - The shareable link.
 */
const useRoomShareUrl = (): string => {
  const roomName = useRoomName();
  const { origin } = window.location;
  return `${origin}/waiting-room/${roomName}`;
};

export default useRoomShareUrl;

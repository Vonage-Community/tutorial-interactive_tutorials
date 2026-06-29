import Autolinker from 'autolinker';

/**
 * This helper function takes in a message, and returns an array containing string groups to concatenate back into a message.
 * The string groups are of the format: string without links (if present), hyperlink, and text to display for hyperlink
 *
 * Example: First one: http://localhost:5173/room/purple-wolf
 * Array containing:
 * - Array containing:
 *  - First one:
 *  - http://localhost:5173/room/purple-wolf\
 *  - localhost:5173/room/purple-wolf
 * @param {string} message - The unmodified chat message to format.
 * @returns {string[][]} - An array of arrays containing strings to render in a chat message.
 */
const linkGroupsParser = (message: string): string[][] => {
  const autoLinkedMessage = Autolinker.link(message, {
    email: false,
    phone: false,
    mention: false,
    hashtag: false,
  });
  const regex = /((?!<a\b)[^<]+)?(?:<a href="([^"]+)"[^>]*>([^<]+)<\/a>)?/g;
  const allMatches = [...autoLinkedMessage.matchAll(regex)];
  const onlyStrings = allMatches
    // Remove undefined captures so we have an array of strings or an empty array
    .map((matchArray) =>
      matchArray.filter((match) => typeof match === 'string').filter((match) => match.length)
    )
    // Removes empty arrays
    .filter((stringArrays) => stringArrays.length);
  // We remove the first match group as it's the unmodified message.
  const onlyMatches = onlyStrings.map((matchArray) => matchArray.slice(1));

  return onlyMatches;
};

export default linkGroupsParser;

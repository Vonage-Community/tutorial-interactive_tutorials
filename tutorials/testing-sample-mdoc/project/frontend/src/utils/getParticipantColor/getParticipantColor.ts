// Colors from: https://mui.com/material-ui/customization/color/#2014-material-design-color-palettes
const colorMap = {
  0: '#f44336',
  1: '#607d8b',
  2: '#9c27b0',
  3: '#673ab7',
  4: '#3f51b5',
  5: '#2196f3',
  6: '#ff5722',
  7: '#00bcd4',
  8: '#ffc107',
  9: '#4caf50',
};

/**
 * Returns a color code based on the ASCII sum of the given username.
 * @param {string} username - The username for which the color is to be determined.
 * @returns {string} The color corresponding to the username.
 */
const getParticipantColor = (username: string): string => {
  // Performs modular division on the sum of ASCII values from a username
  // to map a color value.
  const asciiValue = username
    .split('')
    .reduce((sum, currentValue) => sum + currentValue.charCodeAt(0), 0);
  const randomBaseTen = (asciiValue % 10) as keyof typeof colorMap;

  return colorMap[randomBaseTen];
};

export default getParticipantColor;

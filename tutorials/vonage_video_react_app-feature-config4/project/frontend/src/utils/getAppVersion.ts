import packageInfo from '../../package.json';

/**
 * Gets the current application version specified in the `package.json`.
 * @returns {string} - The application version.
 */
export default (): string => `vera-${packageInfo.version}`;

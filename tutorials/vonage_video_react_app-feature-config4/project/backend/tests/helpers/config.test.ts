import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import loadConfig from '../../helpers/config';

describe('loadConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv }; // Copy originalEnv to avoid mutation across tests
  });

  test('should return defined values', () => {
    process.env.VIDEO_SERVICE_PROVIDER = 'opentok';
    process.env.OT_API_KEY = 'test-key';
    process.env.OT_API_SECRET = 'test-secret';

    const config = loadConfig();
    expect(config.provider).toBe('opentok');

    if (config.provider === 'opentok') {
      expect(config.apiKey).toBe('test-key');
      expect(config.apiSecret).toBe('test-secret');
    }
  });

  test('should throw error for missing OpenTok config values', () => {
    process.env.VIDEO_SERVICE_PROVIDER = 'opentok';
    process.env.OT_API_KEY = undefined;
    process.env.OT_API_SECRET = undefined;

    expect(() => loadConfig()).toThrow('Missing config values for OpenTok');
  });

  test('should throw error for missing Vonage config values', () => {
    process.env.VIDEO_SERVICE_PROVIDER = 'vonage';
    process.env.VONAGE_APP_ID = undefined;
    process.env.VONAGE_PRIVATE_KEY = undefined;

    expect(() => loadConfig()).toThrow('Missing config values for Vonage');
  });
});

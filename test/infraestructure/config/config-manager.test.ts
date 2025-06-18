import * as dotenv from 'dotenv';
import { ConfigManager } from 'src/infraestructure/config/config-manager';

dotenv.config();

describe('ConfigManager', () => {
  describe('get', () => {
    beforeEach(() => {
      process.env.TEST_KEY = 'testValue';
      process.env.EMPTY_KEY = '';
    });

    afterEach(() => {
      delete process.env.TEST_KEY;
      delete process.env.EMPTY_KEY;
      delete process.env.UNDEFINED_KEY;
    });

    it('should return the environment variable when it is set', () => {
      expect(ConfigManager.get('TEST_KEY')).toBe('testValue');
    });

    it('should return the fallback value when the environment variable is not set', () => {
      expect(ConfigManager.get('UNDEFINED_KEY', 'defaultValue')).toBe(
        'defaultValue',
      );
    });

    it('should throw an error when the environment variable is not set and no fallback is provided', () => {
      expect(() => ConfigManager.get('UNDEFINED_KEY')).toThrow(
        'Missing environment variable: UNDEFINED_KEY',
      );
    });

    it('should return an empty string when the environment variable is set to an empty string', () => {
      expect(ConfigManager.get('EMPTY_KEY', 'default')).toBe('');
    });
  });

  describe('getNumber', () => {
    beforeEach(() => {
      process.env.NUMBER_KEY = '123';
      process.env.INVALID_NUMBER_KEY = 'abc';
    });

    afterEach(() => {
      delete process.env.NUMBER_KEY;
      delete process.env.INVALID_NUMBER_KEY;
      delete process.env.UNDEFINED_NUMBER_KEY;
    });

    it('should return the environment variable as a number when it is a valid number', () => {
      expect(ConfigManager.getNumber('NUMBER_KEY')).toBe(123);
    });

    it('should return the fallback value when the environment variable is not set', () => {
      expect(ConfigManager.getNumber('UNDEFINED_NUMBER_KEY', 456)).toBe(456);
    });

    it('should throw an error when the environment variable is set to a non-number string', () => {
      expect(() => ConfigManager.getNumber('INVALID_NUMBER_KEY')).toThrow(
        'Invalid number for env var INVALID_NUMBER_KEY',
      );
    });

    it('should throw an error when the environment variable is not set and no fallback is provided', () => {
      expect(() => ConfigManager.getNumber('UNDEFINED_NUMBER_KEY')).toThrow(
        'Missing environment variable: UNDEFINED_NUMBER_KEY',
      );
    });

    it('should throw an error when fallback provided is not a valid number', () => {
      expect(() =>
        ConfigManager.getNumber('UNDEFINED_NUMBER_KEY', NaN),
      ).toThrow('Invalid number for env var UNDEFINED_NUMBER_KEY');
    });
  });
});

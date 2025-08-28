import { isDebugMode } from './debug';

// Mock environment variables for testing
const originalEnv = process.env;

describe('Debug Utility', () => {
  beforeEach(() => {
    // Reset environment variables before each test
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    // Restore original environment variables
    process.env = originalEnv;
  });

  test('should return false when REACT_APP_DEBUG is not set', () => {
    delete process.env.REACT_APP_DEBUG;
    expect(isDebugMode()).toBe(false);
  });

  test('should return false when REACT_APP_DEBUG is set to false', () => {
    process.env.REACT_APP_DEBUG = 'false';
    expect(isDebugMode()).toBe(false);
  });

  test('should return false when REACT_APP_DEBUG is set to anything other than true', () => {
    process.env.REACT_APP_DEBUG = 'yes';
    expect(isDebugMode()).toBe(false);
    
    process.env.REACT_APP_DEBUG = '1';
    expect(isDebugMode()).toBe(false);
    
    process.env.REACT_APP_DEBUG = 'on';
    expect(isDebugMode()).toBe(false);
  });

  test('should return true when REACT_APP_DEBUG is set to true', () => {
    process.env.REACT_APP_DEBUG = 'true';
    expect(isDebugMode()).toBe(true);
  });

  test('should return false when REACT_APP_DEBUG is set to empty string', () => {
    process.env.REACT_APP_DEBUG = '';
    expect(isDebugMode()).toBe(false);
  });

  test('should return false when REACT_APP_DEBUG is set to undefined', () => {
    process.env.REACT_APP_DEBUG = undefined;
    expect(isDebugMode()).toBe(false);
  });

  test('should return false when REACT_APP_DEBUG is set to null', () => {
    process.env.REACT_APP_DEBUG = null as any;
    expect(isDebugMode()).toBe(false);
  });
});

/**
 * Check if debug mode is enabled
 * Debug mode is enabled ONLY when REACT_APP_DEBUG=true is set in .env.local
 * All other values (including false, undefined, or any other string) disable debug mode
 */
export const isDebugMode = (): boolean => {
  return process.env.REACT_APP_DEBUG === 'true';
};

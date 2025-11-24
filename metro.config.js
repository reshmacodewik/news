const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  server: {
    port: 8082,  // Set the port to a different one if 8081 is occupied
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);

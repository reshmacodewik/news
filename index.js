import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

console.log('[BOOT] appName =', appName); // should print "arcalisnews"
AppRegistry.registerComponent(appName, () => App);

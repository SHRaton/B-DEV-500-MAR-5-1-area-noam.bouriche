import { AppRegistry } from 'react-native';
import App from './App.js';
import { name as appName } from './app.json';

// Ajoutez cette ligne pour utiliser react-native-web
AppRegistry.registerComponent(appName, () => App);
AppRegistry.runApplication(appName, {
  initialProps: {},
  rootTag: document.getElementById('root'),
});

import { AppRegistry } from 'react-native';
import App from './App.js';
import appJson from './app.json';
const appName = appJson.name;

// Ajoutez cette ligne pour utiliser react-native-web
AppRegistry.registerComponent(appName, () => App);
AppRegistry.runApplication(appName, {
  initialProps: {},
  rootTag: document.getElementById('root'),
});

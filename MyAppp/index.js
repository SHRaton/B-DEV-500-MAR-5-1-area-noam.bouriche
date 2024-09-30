import {AppRegistry} from 'react-native';
import App from './App.js';
import appJson from './app.json';
const appName = appJson.name; // Utilisation de l'export par défaut

AppRegistry.registerComponent(appName, () => App);

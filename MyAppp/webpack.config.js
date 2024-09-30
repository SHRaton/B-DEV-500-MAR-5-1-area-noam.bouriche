const path = require('path');

module.exports = {
  entry: './index.web.js',  // Point d'entrée de votre application
  output: {
    filename: 'bundle.js',  // Fichier de sortie
    path: path.resolve(__dirname, 'public'),  // Répertoire de sortie pour les fichiers générés
    publicPath: '/',  // Servir à partir de la racine
  },
  mode: 'development',
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),  // Sert les fichiers statiques (HTML, images, etc.)
    },
    compress: true,  // Compression des fichiers
    port: 8080,  // Port local
    historyApiFallback: true,  // Support des routes SPA (Single Page Application)
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],  // Extensions de fichiers supportées
    alias: {
      'react-native$': 'react-native-web',  // Rediriger les imports React Native vers React Native Web
    },
    fallback: {
      "crypto": require.resolve("crypto-browserify"),  // Polyfills pour certaines bibliothèques
      "stream": require.resolve("stream-browserify"),
    },
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,  // Types de fichiers à traiter
        exclude: /node_modules/,  // Exclure les modules externes
        use: {
          loader: 'babel-loader',  // Utiliser Babel pour transpiler le code
          options: {
            presets: [
              '@babel/preset-env',  // Pour le JavaScript moderne
              '@babel/preset-react',  // Pour les composants React
              '@babel/preset-typescript'  // Support TypeScript
            ]
          }
        }
      },
      {
        test: /\.css$/,  // Fichiers CSS
        use: ['style-loader', 'css-loader'],  // Charger et injecter les styles CSS
      },
      {
        test: /\.(png|jpg|gif|svg)$/,  // Types d'images supportées
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[path][name].[ext]',  // Structure du nom de fichier
            }
          }
        ]
      }
    ]
  },
  devtool: 'inline-source-map',  // Génère des sourcemaps pour faciliter le débogage
};

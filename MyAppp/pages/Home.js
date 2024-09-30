import React from 'react';
import { View, Text, StyleSheet, Image, Button } from 'react-native';

const Home = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>AREA</Text>
      <Image
        source={require('../assets/raton.png')} // Remplacez le chemin par le chemin correct vers votre image
        style={styles.image}
        resizeMode="contain" // Optionnel, pour s'assurer que l'image est redimensionnée correctement
      />
      <View style={styles.buttonContainer}>
        <Button title="Login" onPress={() => console.log('Login pressed')} />
        <View style={styles.spacing}></View>
        <Button title="Register" onPress={() => console.log('Register pressed')} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20, // Optionnel, pour ajouter un peu de marge intérieure
  },
  title: {
    fontSize: 48, // Augmentez la taille pour rendre le texte plus grand
    fontWeight: 'bold',
    marginBottom: 20, // Marge sous le titre
  },
  image: {
    width: 200, // Ajustez la largeur comme nécessaire
    height: 200, // Ajustez la hauteur comme nécessaire
    marginBottom: 20, // Marge sous l'image
  },
  buttonContainer: {
    flexDirection: 'column',
  },
  spacing: {
    height: 20,
  },
});

export default Home;

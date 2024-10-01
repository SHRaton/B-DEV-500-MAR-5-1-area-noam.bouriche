import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Platform } from 'react-native';
import { useRouter } from 'expo-router';

const HomeScreen = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Area</Text>
      <Image
        source={require('../../assets/images/favicon.png')} // Assurez-vous que ce chemin est correct
        style={styles.image}
        resizeMode="contain" // Optionnel, pour s'assurer que l'image est redimensionnée correctement
      />
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => router.push('/login')}>
          <Text style={styles.buttonText}>Se connecter</Text>
        </TouchableOpacity>
        <View style={styles.spacing}></View>
        <TouchableOpacity style={styles.button} onPress={() => router.push('/register')}>
          <Text style={styles.buttonText}>S'inscrire</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  title: {
    fontSize: 60,
    fontWeight: 'bold',
    marginTop: 50,
    marginBottom: 20,
  },
  image: {
    width: Platform.OS === 'web' ? '60%' : '90%',
    height: Platform.OS === 'web' ? '60%' : '50%',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    width: '60%',
    height: 150,
  },
  button: {
    backgroundColor: '#511B8A', // Couleur de fond du bouton
    borderRadius: 10, // Arrondi des bords
    paddingVertical: 10, // Espacement vertical
    paddingHorizontal: 20, // Espacement horizontal
    alignItems: 'center', // Centrer le texte
    justifyContent: 'center',
    height: '45%',
  },
  buttonText: {
    color: '#FFFFFF', // Couleur du texte
    fontSize: 16, // Taille de la police
    fontWeight: 'bold', // Poids de la police
  },
  spacing: {
    height: '10%',
  },
});

export default HomeScreen;

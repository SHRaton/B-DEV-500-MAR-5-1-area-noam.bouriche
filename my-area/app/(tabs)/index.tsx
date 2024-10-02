import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Platform } from 'react-native';
import { useRouter } from 'expo-router';

const HomeScreen = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Areacoon</Text>
        <Text style={styles.subtitle}>
          Welcome visitor !
          Thanks to Areacoon, automate your tasks like never before !
        </Text>
        <Text style={styles.sub_subtitle}>
          The automation platform for your digital life.
        </Text>
        {/* Nouvelle disposition : flexDirection 'row' */}
        <View style={styles.rowContainer}>
          <Image
            source={require('../../assets/images/favicon.png')}
            style={styles.image}
            resizeMode="contain"
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={() => router.push('/register')}>
              <Text style={styles.buttonText}>SIGN UP</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.signInButton]} onPress={() => router.push('/login')}>
              <Text style={styles.signInButtonText}>SIGN IN</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#514137',
    marginBottom: 20,
    marginTop: -30,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 30,
    color: '#555',
    marginBottom: 15,
    marginTop: 50,
    textAlign: 'center',
    maxWidth: '80%',
  },
  sub_subtitle: {
    fontSize: 25,
    color: '#555',
    marginBottom: 10,
    textAlign: 'center',
    maxWidth: '80%',
  },
  // Nouvelle disposition en ligne
  rowContainer: {
    flexDirection: 'row', // Crée une disposition en ligne (horizontale)
    justifyContent: 'space-between', // Espace entre les composants
    alignItems: 'center', // Aligne les composants verticalement
    width: '100%',
    maxWidth: 1200, // Limite la largeur du conteneur
    marginTop: 70,
  },
  image: {
    width: 450,
    height: 450,
  },
  buttonContainer: {
    flex: 1,
    marginLeft: 250,
  },
  button: {
    backgroundColor: '#514137',
    borderRadius: 10,
    paddingVertical: 25,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  signInButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#514137',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signInButtonText: {
    color: '#514137',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions, Platform } from 'react-native';
import { useRouter } from 'expo-router';

// Obtenir la largeur et la hauteur de l'écran
const { width, height } = Dimensions.get('window');

const HomeScreen = () => {
  const router = useRouter();

  useEffect(() => {
    // Vérifie si l'utilisateur est authentifié
    const checkAuth = async () => {
      const response = await fetch(`http://localhost:5000/check-auth`, {
        method: 'GET',
        credentials: 'include',  // Envoie les cookies pour la session
      });
      const data = await response.json();

      if (data.authenticated) {
        router.push('/home');  // Redirige vers la page de login si non authentifié
      }
    };

    checkAuth();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Areacoon</Text>
        <Text style={styles.subtitle}>
          Welcome visitor !{'\n'}
          Thanks to Areacoon, automate your tasks like never before !
        </Text>
        <Text style={styles.sub_subtitle}>
          The automation platform for your digital life.
        </Text>
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
    fontSize: width < 400 ? 40 : 56,  // Réduit la taille de la police sur petits écrans
    fontWeight: 'bold',
    color: '#514137',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: width < 400 ? 18 : 30,  // Taille de police dynamique
    color: '#555',
    marginBottom: 15,
    textAlign: 'center',
    maxWidth: '80%',
  },
  sub_subtitle: {
    fontSize: width < 400 ? 16 : 25,  // Taille de police dynamique
    color: '#555',
    marginBottom: 10,
    textAlign: 'center',
    maxWidth: '80%',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    maxWidth: 1200,
    marginTop: 70,
  },
  image: {
    width: width < 400 ? 250 : 450,  // Ajuste la taille de l'image sur petits écrans
    height: width < 400 ? 250 : 450, // Taille dynamique de l'image
  },
  buttonContainer: {
    flex: 1,
    marginLeft: width < 400 ? 50 : 250,  // Réduit l'espace entre les boutons sur petits écrans
  },
  button: {
    backgroundColor: '#514137',
    borderRadius: 10,
    paddingVertical: 15, // Taille plus petite pour mobile
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
    fontSize: width < 400 ? 14 : 18, // Ajuste la taille du texte sur petits écrans
    fontWeight: 'bold',
  },
  signInButtonText: {
    color: '#514137',
    fontSize: width < 400 ? 14 : 18, // Ajuste la taille du texte sur petits écrans
    fontWeight: 'bold',
  },
});

export default HomeScreen;

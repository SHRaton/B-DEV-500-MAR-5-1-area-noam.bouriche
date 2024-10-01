import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Platform, Button } from 'react-native';
import { useRouter } from 'expo-router';

const HomeScreen = () => {
  const router = useRouter();

  useEffect(() => {
    // Vérifie si l'utilisateur est authentifié
    const checkAuth = async () => {
      const response = await fetch('http://localhost:5000/check-auth', {
        method: 'GET',
        credentials: 'include',  // Envoie les cookies pour la session
      });
      const data = await response.json();

      if (!data.authenticated) {
        router.push('/login');  // Redirige vers la page de login si non authentifié
      }
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:5000/logout', {
        method: 'POST',
        credentials: 'include',  // Envoie les cookies pour détruire la session
      });

      if (response.ok) {
        router.push('/');  // Redirige l'utilisateur vers la page de login après la déconnexion
      } else {
        console.error('Erreur lors de la déconnexion');
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <View>
      <View style={styles.contenairDisconnect}>
        <TouchableOpacity style={styles.buttonDisconnect} onPress={handleLogout}>
        </TouchableOpacity>
      </View>
      <View style={styles.container}>
        <Text style={styles.title}>Area</Text>
        <Image
          source={require('../assets/images/favicon.png')} // Assurez-vous que ce chemin est correct
          style={styles.image}
          resizeMode="contain" // Optionnel, pour s'assurer que l'image est redimensionnée correctement
        />
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.buttonAreas} onPress={() => router.push('/my_areas')}>
            <Text style={styles.buttonText}>My Areas</Text>
          </TouchableOpacity>
          <View style={styles.spacing}></View>
          <TouchableOpacity style={styles.buttonAddArea} onPress={() => router.push('/add_area')}>
            <Text style={styles.buttonText}>Add Area</Text>
          </TouchableOpacity>
        </View>
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
  },
  contenairDisconnect: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    padding: 10,
    width: '100%',
  },
  buttonAreas: {
    backgroundColor: '#2B211B', // Couleur de fond du bouton
    borderRadius: 20, // Arrondi des bords
    paddingVertical: 10, // Espacement vertical
    paddingHorizontal: 20, // Espacement horizontal
    alignItems: 'center', // Centrer le texte
  },
  buttonAddArea: {
    backgroundColor: '#514137', // Couleur de fond du bouton 2B211B 514137
    borderRadius: 20, // Arrondi des bords
    paddingVertical: 10, // Espacement vertical
    paddingHorizontal: 20, // Espacement horizontal
    alignItems: 'center', // Centrer le texte
  },
  buttonDisconnect: {
    backgroundColor: 'red', // Couleur de fond du bouton
    borderRadius: 20, // Arrondi des bords
    paddingVertical: 10, // Espacement vertical
    paddingHorizontal: 20, // Espacement horizontal
    width: 20,
  },
  buttonText: {
    color: '#FFFFFF', // Couleur du texte
    fontSize: 16, // Taille de la police
    fontWeight: 'bold', // Poids de la police
  },
  spacing: {
    height: 40,
  },
});

export default HomeScreen;

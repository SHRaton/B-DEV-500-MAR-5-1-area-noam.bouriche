import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ImageBackground, Platform, Button, Pressable, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { API_URL } from '@env';

const HomeScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Vérifie si l'utilisateur est authentifié
    const checkAuth = async () => {
      const response = await fetch(`${API_URL}/check-auth`, {
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
      const response = await fetch(`${API_URL}/logout`, {
        method: 'POST',
        credentials: 'include',  // Envoie les cookies pour détruire la session
      });

      if (response.ok) {
        setModalVisible(false);
        router.push('/');  // Redirige l'utilisateur vers la page de login après la déconnexion
      } else {
        console.error('Erreur lors de la déconnexion');
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const handleProfile = () => {
    setModalVisible(false); // Masquer le menu
    router.push('/profile'); // Rediriger vers la page de profil
  };

  return (
    <View>
      <View style={styles.contenairDisconnect}>
        <Pressable onPress={() => setModalVisible(true)}>
          <ImageBackground
            source={require('../assets/images/profil.png')}
            style={styles.buttonDisconnect}
            imageStyle={{ borderRadius: 50 }}
          >
          </ImageBackground>
        </Pressable>
      </View>

      {/* Menu déroulant (Popup) */}
      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Pressable style={styles.modalButton} onPress={handleProfile}>
              <Text style={styles.modalButtonText}>Accéder au profil</Text>
            </Pressable>
            <Pressable style={styles.modalButton} onPress={handleLogout}>
              <Text style={styles.modalButtonText}>Se déconnecter</Text>
            </Pressable>
            <Pressable style={styles.modalCancelButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalButtonText}>Annuler</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      <View style={styles.container}>
        <View style={styles.imageContenair}>
          <Image
            source={require('../assets/images/favicon.png')}
            style={styles.image}
            resizeMode="contain"
          />
        </View>
        <View style={styles.buttonContainer}>
          <Pressable style={styles.buttonAreas} onPress={() => router.push('/my_areas')}>
            <Text style={styles.buttonText}>My Areas</Text>
          </Pressable>
          <View style={styles.spacing}></View>
          <Pressable style={styles.buttonAddArea} onPress={() => router.push('/add_area')}>
            <Text style={styles.buttonText}>Add an Area</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  title: {
    fontSize: 60,
    fontWeight: 'bold',
    marginTop: 50,
    marginBottom: 20,
  },
  imageContenair: {
    width: 350,
    height: 350,
  },
  image: {
    width: '100%',
    height: '100%',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    width: '60%',
    height: 100,
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
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  buttonAddArea: {
    backgroundColor: '#514137', // Couleur de fond du bouton 2B211B 514137
    borderRadius: 20, // Arrondi des bords
    paddingVertical: 10, // Espacement vertical
    paddingHorizontal: 20, // Espacement horizontal
    alignItems: 'center', // Centrer le texte
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  buttonDisconnect: {
    width: 70,
    height: 70,
  },
  buttonText: {
    color: '#FFFFFF', // Couleur du texte
    fontSize: 20, // Taille de la police
    fontWeight: 'bold', // Poids de la police
  },
  spacing: {
    height: 40,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fond semi-transparent
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: 250,
    alignItems: 'center',
  },
  modalButton: {
    backgroundColor: '#2B211B',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginVertical: 10,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalCancelButton: {
    backgroundColor: '#514137',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginVertical: 10,
    width: '100%',
    alignItems: 'center',
  },
});

export default HomeScreen;

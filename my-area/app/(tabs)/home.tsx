import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ImageBackground, Platform, Pressable, Modal, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

const HomeScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const response = await fetch(`http://localhost:5000/check-auth`, {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();

      if (!data.authenticated) {
        router.push('/');
      }
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch(`http://localhost:5000/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        setModalVisible(false);
        router.push('/');
      } else {
        console.error('Erreur lors de la déconnexion');
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const handleProfile = () => {
    setModalVisible(false);
    router.push('/profile');
  };

  const handleLinkAccounts = () => {
    setModalVisible(false);
    router.push('/link_accounts');
  };

  return (
    <View style={styles.container}>
      <View style={styles.contenairDisconnect}>
        <Pressable onPress={() => setModalVisible(true)}>
          <ImageBackground
            source={require('../../assets/images/profil.png')}
            style={styles.buttonDisconnect}
            imageStyle={{ borderRadius: 50 }}
          />
        </Pressable>
      </View>

      {/* Popup menu */}
      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Pressable style={styles.modalButton} onPress={handleProfile}>
              <Text style={styles.modalButtonText}>Profile page</Text>
            </Pressable>
            <Pressable style={styles.modalButton} onPress={handleLinkAccounts}>
              <Text style={styles.modalButtonText}>Link Accounts</Text>
            </Pressable>
            <Pressable style={styles.modalButton} onPress={handleLogout}>
              <Text style={styles.modalButtonText}>Disconnect</Text>
            </Pressable>
            <Pressable style={styles.modalCancelButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalButtonText}>Exit</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.imageContenair}>
          <Image
            source={require('../../assets/images/favicon.png')}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        {/* Bouton "My Areas" */}
        <View style={styles.buttonContainer}>
          <Pressable style={styles.buttonAreas} onPress={() => router.push('/my_areas')}>
            <Text style={styles.buttonText}>My Areas</Text>
          </Pressable>
        </View>

        {/* Image whatis.png */}
        <View style={styles.triggerSection}>
          <Image
            source={require('../../assets/images/whatis.png')}
            style={styles.triggerImage}
            resizeMode="contain"
          />
        </View>

        {/* Image trigger.png */}
        <View style={styles.triggerSection}>
          <Image
            source={require('../../assets/images/trigger.png')}
            style={styles.triggerImage}
            resizeMode="contain"
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Fond blanc
  },
  contentContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  imageContenair: {
    width: 200,
    height: 200,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  buttonContainer: {
    width: '50%',
    marginBottom: 20,
  },
  buttonAreas: {
    backgroundColor: '#2B211B',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 3,
    width: '100%',
    height: 90,
  },
  buttonDisconnect: {
    width: 70,
    height: 70,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 52,
    fontWeight: 'bold',
  },
  contenairDisconnect: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    padding: 10,
    width: '100%',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    backgroundColor: '#2B211B',
    padding: 20,
    borderRadius: 10,
    width: 250,
    alignItems: 'center',
  },
  modalButton: {
    backgroundColor: '#514137',
    paddingVertical: 10,
    borderRadius: 10,
    marginVertical: 5,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalCancelButton: {
    backgroundColor: '#7b3b3b',
    paddingVertical: 10,
    borderRadius: 10,
    marginVertical: 5,
    width: '100%',
    alignItems: 'center',
  },
  triggerSection: {
    width: '90%',
    alignItems: 'center',
  },
  triggerImage: {
    width: '150%',
    height: 900,
  },
});

export default HomeScreen;

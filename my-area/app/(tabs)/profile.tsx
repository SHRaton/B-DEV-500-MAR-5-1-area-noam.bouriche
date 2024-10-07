import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

const router = useRouter();

const ProfileScreen = () => {
  // State pour stocker les informations utilisateur
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Fonction pour récupérer les informations de l'utilisateur
  const fetchUserInfo = async () => {
    try {
      const response = await fetch('http://localhost:5000/get-user-info', {
        method: 'GET',
        credentials: 'include', // Pour inclure les cookies avec la session
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data);  // Stocke les infos utilisateur dans le state
      } else {
        const errorData = await response.json();
        setError(errorData.error);  // Stocke l'erreur si la requête échoue
      }
    } catch (error) {
      setError('Failed to fetch user info');  // Gère les erreurs de réseau
    }
  };

  // Appel à fetchUserInfo au chargement du composant
  useEffect(() => {
    fetchUserInfo();
  }, []);

  // Fonction pour gérer la déconnexion
  const handleLogout = async () => {
    try {
      const response = await fetch(`http://localhost:5000/logout`, {
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

  // Si les informations utilisateur ne sont pas encore chargées
  if (!user) {
    return (
      <View style={styles.container}>
        {error ? <Text style={styles.errorText}>{error}</Text> : <Text>Loading...</Text>}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Conteneur de profil */}
      <View style={styles.profileContainer}>
        {/* Affichage de la photo de profil */}
        <Image source={require('../../assets/images/profil.png')} style={styles.profileImage} resizeMode="contain" />

        {/* Affichage des informations utilisateur */}
        <View style={styles.infoContainer}>
          <Text style={styles.nameText}> Your profile :</Text>

          <Text style={styles.InfoText}>
            <Text style={{ fontWeight: 'bold' }}> Username: </Text>
            {user.username}</Text>

          <Text style={styles.InfoText}>
          <Text style={{ fontWeight: 'bold' }}> Email address : </Text>
            {user.email}</Text>

          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Autres informations utilisateur ou options de profil */}
      <Pressable style={styles.disconnectButton} onPress={handleLogout}>
        <Text style={styles.disconnectButtonText}>Disconnect</Text>
      </Pressable>

      <View style={styles.additionalInfoContainer}>
        <Text style={styles.sectionTitle}>About this page</Text>
        <Text style={styles.aboutText}>
          This page allows you to view and manage your personal informations.
        </Text>
        <Text style={styles.aboutText}>
          Here you'll find your username, e-mail address and other account details.
        </Text>
        <Text style={styles.aboutText}>
          This page also offers the possibility of modifying this information to keep your profile up to date.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 20,
    justifyContent: 'center',
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
  },
  infoContainer: {
    alignItems: 'center',
  },
  nameText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#514137',
    marginBottom: 5,
    textAlign: 'center',
  },
  InfoText: {
    fontSize: 18,
    color: '#555',
    marginBottom: 15,
    textAlign: 'center',
  },
  editButton: {
    backgroundColor: '#514137',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  additionalInfoContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#514137',
    marginBottom: 10,
    textAlign: 'center',
  },
  aboutText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 5,
  },
  disconnectButton: {
    backgroundColor: '#f02424',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 25,
    alignSelf: 'center',
    marginVertical: 20,
  },
  disconnectButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 16,
    color: '#f02424',
    textAlign: 'center',
  },
});

export default ProfileScreen;

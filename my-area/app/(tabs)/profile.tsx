import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, Pressable, TextInput, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import PhotoSelection from './photo_selection';

const ProfileScreen = () => {
  const router = useRouter();

  // State to store user information
  const [user, setUser] = useState(null);
  const [showPhotoSelection, setShowPhotoSelection] = useState(false);
  const [editedUser, setEditedUser] = useState(null);  // State pour les données éditées
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);  // Mode édition
  const [modalVisible, setModalVisible] = useState(false);

  const photos = {
    1: require('../../assets/images/photo_1.png'),
    2: require('../../assets/images/photo_2.png'),
    3: require('../../assets/images/photo_3.png'),
    4: require('../../assets/images/photo_4.png'),
    5: require('../../assets/images/photo_5.png'),
    6: require('../../assets/images/photo_6.png'),
    7: require('../../assets/images/photo_7.png'),
    8: require('../../assets/images/photo_8.png'),
    9: require('../../assets/images/photo_9.png'),
    10: require('../../assets/images/photo_10.png'),
  };

  // Function to fetch user information
  const fetchUserInfo = async () => {
    try {
      const response = await fetch('http://localhost:5000/get-user-info', {
        method: 'GET',
        credentials: 'include', // Include cookies with the session
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setUser(data);  // Store user info in state
        setEditedUser(data);  // Initialize edited user info with current user info
      } else {
        const errorData = await response.json();
        setError(errorData.error);  // Store error if request fails
      }
    } catch (error) {
      setError('Failed to fetch user info');  // Handle network errors
    }
  };

  useEffect(() => {
    // Vérifie si l'utilisateur est authentifié
    const checkAuth = async () => {
      const response = await fetch(`http://localhost:5000/check-auth`, {
        method: 'GET',
        credentials: 'include',  // Envoie les cookies pour la session
      });
      const data = await response.json();

      if (!data.authenticated) {
        router.push('/');  // Redirige vers la page de login si non authentifié
      }
    };
    
    checkAuth();
    fetchUserInfo();
  }, []);

  // Function to handle logout
  const handleLogout = async () => {
    try {
      const response = await fetch(`http://localhost:5000/logout`, {
        method: 'POST',
        credentials: 'include',  // Send cookies to destroy session
      });

      if (response.ok) {
        setModalVisible(false);
        router.push('/');  // Redirect user to login page after logout
      } else {
        console.error('Error during logout');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleChangePassword = () => {
    router.push('/change-password');
  }

  // Function to save edited profile
  const handleSave = async () => {
    try {
      const response = await fetch('http://localhost:5000/update-user-info', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(editedUser),  // Envoyer les nouvelles informations utilisateur
      });
  
      if (response.ok) {
        const updatedUser = await response.json();
        setUser(editedUser);  // Met à jour l'utilisateur dans l'état local avec les nouvelles données
        setIsEditing(false);  // Désactiver le mode édition
      } else {
        console.error('Error updating profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };  

  const handleSelectPhoto = async (photo) => {
    console.log(photo);
    try {
      const response = await fetch('http://localhost:5000/update-photo', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ photo_id: photo }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setEditedUser({ ...editedUser, photo_id: photo });
      setShowPhotoSelection(false);
      console.log('Photo de profil mise à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la photo de profil:', error);
    }
  };

  // If user info is not yet loaded
  if (!user) {
    return (
      <View style={styles.container}>
        {error ? <Text style={styles.errorText}>{error}</Text> : <Text>Loading...</Text>}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.back} onPress={() => router.push("/home")}>
          <Image
            source={require('../../assets/images/left.png')}
            style={styles.backIcon}
            resizeMode="contain"
          />
        </Pressable>
        <Text style={styles.title}>Profile page</Text>
      </View>

      <View style={styles.profileContainer}>
        {/* Display profile picture */}
        <Pressable onPress={() => setShowPhotoSelection(true)}>
          <Image 
            source={photos[editedUser.photo_id]} // Image de profil actuelle
            style={styles.profileImage} 
            resizeMode="cover" 
          />
        </Pressable>

        {/* Mode édition */}
        {isEditing ? (
          <View style={styles.infoContainer}>
            <Text style={styles.nameText}>Edit your profile:</Text>

            {/* Champ pour modifier le username */}
            <Text style={styles.labelText}>Username:</Text>
            <TextInput
              style={styles.input}
              value={editedUser.username}
              onChangeText={(text) => setEditedUser({ ...editedUser, username: text })}
            />

            {/* Champ pour modifier l'email */}
            <Text style={styles.labelText}>Email address:</Text>
            <TextInput
              style={styles.input}
              value={editedUser.email}
              onChangeText={(text) => setEditedUser({ ...editedUser, email: text })}
            />

            <Text style={styles.labelText}>Bio:</Text>
            <TextInput
              style={styles.input}
              value={editedUser.bio}
              onChangeText={(text) => setEditedUser({ ...editedUser, bio: text })}
            />

            <Pressable style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </Pressable>
          </View>
        ) : (
          /* Display user information */
          <View style={styles.infoContainer}>
            <Text style={styles.nameText}>Your profile:</Text>

            <Text style={styles.InfoText}>
              <Text style={{ fontWeight: 'bold' }}>Username: </Text>
              {user.username}
            </Text>

            <Text style={styles.InfoText}>
              <Text style={{ fontWeight: 'bold' }}>Email address: </Text>
              {user.email}
            </Text>

            <Text style={styles.InfoText}>
              <Text style={{ fontWeight: 'bold' }}>Bio: </Text>
              {user.bio}
            </Text>

            <Pressable style={styles.editButton} onPress={handleEdit}>
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </Pressable>

            <Pressable style={styles.changeButton} onPress={handleChangePassword}>
              <Text style={styles.editButtonText}>Change password </Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* Other user information or profile options */}
      <Pressable style={styles.disconnectButton} onPress={handleLogout}>
        <Text style={styles.disconnectButtonText}>Disconnect</Text>
      </Pressable>

      <View style={styles.additionalInfoContainer}>
        <Text style={styles.sectionTitle}>About this page</Text>
        <Text style={styles.aboutText}>
          This page allows you to view and manage your personal information.
        </Text>
        <Text style={styles.aboutText}>
          Here you'll find your username, e-mail address, and other account details.
        </Text>
        <Text style={styles.aboutText}>
          This page also offers the possibility of modifying this information to keep your profile up to date.
        </Text>
      </View>

      {/* Modal for Photo Selection */}
      <Modal
        transparent={true}
        animationType="slide"
        visible={showPhotoSelection}
        onRequestClose={() => setShowPhotoSelection(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <PhotoSelection 
              onSelect={handleSelectPhoto} 
              onClose={() => setShowPhotoSelection(false)} 
            />
          </View>
        </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  back: {
    marginRight: 10,
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
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
  labelText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'left',
    marginBottom: 5,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    width: '100%',
  },
  editButton: {
    backgroundColor: '#514137',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeButton: {
    backgroundColor: '#514137',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 25,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
  },
  saveButtonText: {
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
});

export default ProfileScreen;

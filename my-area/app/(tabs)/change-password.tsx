import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Image, Platform, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';

const ChangePasswordScreen = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();
  const { width } = useWindowDimensions();

  const isMobile = width <= 768;

  const handleChangePassword = async () => {
    try {
      // Validation basique
      if (newPassword !== confirmPassword) {
        setErrorMessage('Les mots de passe ne correspondent pas');
        return;
      }

      const response = await fetch('http://localhost:5000/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage('Mot de passe modifié avec succès');
        setErrorMessage('');
        // Redirection après 2 secondes
        setTimeout(() => {
          router.push('/home');
        }, 2000);
      } else {
        setErrorMessage(data.error || 'Erreur lors du changement de mot de passe');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setErrorMessage('Erreur de connexion au serveur');
    }
  };

  const handleHomeNavigation = () => {
    router.push('/home');
  };

  return (
    <View style={styles.containerMain}>
      {!isMobile && Platform.OS === 'web' && (
        <Image source={require('../../assets/images/leftbar.png')} style={styles.leftBar} />
      )}
      {!isMobile && (
        <Pressable style={styles.homeButton} onPress={handleHomeNavigation}>
          <Image source={require('../../assets/images/left.png')} style={styles.homeIcon} />
          <Text style={styles.homeText}>Home</Text>
        </Pressable>
      )}
      {!isMobile && (
        <View style={styles.leftTextContainer}>
          <Text style={styles.text1}>Sécurisez votre compte</Text>
          <Text style={styles.text2}>Changez votre mot de passe pour plus de sécurité</Text>
        </View>
      )}

      <View style={[styles.container, isMobile && styles.containerMobile]}>
        <Text style={styles.maintitle}>AREA</Text>
        <Text style={styles.tagline}>Changement de mot de passe</Text>
        <Text style={styles.subTagline}>Veuillez choisir un nouveau mot de passe sécurisé</Text>

        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
        {successMessage ? <Text style={styles.success}>{successMessage}</Text> : null}

        <TextInput
          style={styles.input}
          placeholder="Nouveau mot de passe"
          placeholderTextColor="#d3d3d3"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          placeholder="Confirmer le nouveau mot de passe"
          placeholderTextColor="#d3d3d3"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <Pressable
          style={[styles.changeButton, isHovered && styles.changeButtonHover]}
          onPress={handleChangePassword}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Text style={styles.changeButtonText}>Changer le mot de passe</Text>
        </Pressable>

        <Pressable onPress={() => router.push('/home')}>
          <Text style={styles.cancelText}>Annuler</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  containerMain: {
    flex: 1,
    flexDirection: 'row',
  },
  containerMobile: {
    marginLeft: 0,
    width: '100%',
  },
  leftBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '50%',
    height: '100%',
    borderTopEndRadius: 300,
    backgroundColor: '#594F48',
  },
  leftTextContainer: {
    position: 'absolute',
    left: '10%',
    bottom: '10%',
    width: '40%',
  },
  text1: {
    fontSize: 40,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  text2: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  homeButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  homeIcon: {
    width: 24,
    height: 24,
    marginRight: 5,
    tintColor: 'white',
  },
  homeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginLeft: '50%',
  },
  maintitle: {
    fontSize: 80,
  },
  tagline: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  subTagline: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 20,
    borderRadius: 5,
    width: '80%',
    backgroundColor: '#f0f0f0',
  },
  changeButton: {
    backgroundColor: '#6200EE',
    padding: 15,
    borderRadius: 5,
    width: '80%',
    alignItems: 'center',
    marginBottom: 10,
    transition: 'transform 0.8s ease-in-out, box-shadow 0.8s ease-in-out',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  changeButtonHover: {
    transform: 'scale(1.001)',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.3)',
  },
  changeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelText: {
    color: '#6200EE',
    marginTop: 10,
    fontSize: 14,
  },
  error: {
    color: 'red',
    marginBottom: 20,
  },
  success: {
    color: 'green',
    marginBottom: 20,
  }
});

if (Platform.OS === 'web') {
  const styleSheet = StyleSheet.create({
    '@media (max-width: 768px)': {
      containerMain: {
        flexDirection: 'column',
      },
      leftBar: {
        display: 'none',
      },
      leftTextContainer: {
        display: 'none',
      },
      container: {
        marginLeft: 0,
        width: '100%',
      },
    },
  });

  Object.assign(styles, StyleSheet.flatten(styleSheet));
}

export default ChangePasswordScreen;
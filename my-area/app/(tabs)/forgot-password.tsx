import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Image, Platform, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';

const ForgotPasswordScreen = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();
  const { width } = useWindowDimensions();

  const isMobile = width <= 768;

  const handleSubmit = async () => {
    try {
      const response = await fetch(`http://localhost:5000/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        setMessage('Un email de réinitialisation a été envoyé à votre adresse email.');
      } else {
        setIsSuccess(false);
        setMessage(data.error || 'Une erreur est survenue.');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setIsSuccess(false);
      setMessage('Une erreur est survenue lors de la connexion au serveur.');
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
            <Text style={styles.text1}>Turn your ideas into reality.</Text>
            <Text style={styles.text2}>Create your own automatism with Actions and Reactions</Text>
        </View>
      )}
      
      <View style={[styles.container, isMobile && styles.containerMobile]}>
        <Text style={styles.maintitle}>AREA</Text>
        <Text style={styles.title}>Forgotten password ?</Text>
        <Text style={styles.subtitle}>
          Enter your email address et we are gonna send you a reset password link.
        </Text>

        {message ? (
          <Text style={[styles.message, isSuccess ? styles.successMessage : styles.errorMessage]}>
            {message}
          </Text>
        ) : null}

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#d3d3d3"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Pressable
          style={[styles.submitButton, isHovered && styles.submitButtonHover]}
          onPress={handleSubmit}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Text style={styles.submitButtonText}>Send link</Text>
        </Pressable>

        <Pressable onPress={() => router.push('/login')}>
          <Text style={styles.backToLoginText}>Return to login page</Text>
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
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    maxWidth: '80%',
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
  submitButton: {
    backgroundColor: '#6200EE',
    padding: 15,
    borderRadius: 5,
    width: '80%',
    alignItems: 'center',
    marginBottom: 20,
    transition: 'transform 0.8s ease-in-out, box-shadow 0.8s ease-in-out',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  submitButtonHover: {
    transform: 'scale(1.001)',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.3)',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  message: {
    marginBottom: 20,
    padding: 10,
    borderRadius: 5,
    textAlign: 'center',
    width: '80%',
  },
  successMessage: {
    backgroundColor: '#e6ffe6',
    color: '#006600',
  },
  errorMessage: {
    backgroundColor: '#ffe6e6',
    color: '#cc0000',
  },
  backToLoginText: {
    color: '#6200EE',
    fontSize: 14,
  },
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

export default ForgotPasswordScreen;
import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Image, Platform, Linking, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';

const LoginScreen = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();
  const { width } = useWindowDimensions();

  const isMobile = width <= 768;

  // Dans la fonction handleLogin du composant LoginScreen
  const handleLogin = async () => {
    try {
      const response = await fetch(`http://localhost:8080/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();
      console.log('Réponse du serveur:', data);

      if (data.authenticated) {
        if (data.requirePasswordChange) {
          router.push('/change-password');
        } else {
          router.push('/home');
        }
      } else {
        setErrorMessage(data.error || 'Erreur lors de la connexion.');
      }
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      setErrorMessage('Erreur de connexion au serveur');
    }
  };

  const handleGoogleLogin = () => {
    const googleLoginURL = `http://localhost:8080/login/google`;
    if (Platform.OS === 'web') {
      window.location.href = googleLoginURL; // For web platforms
    } else {
      Linking.openURL(googleLoginURL); // For Android and iOS platforms
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
        <Text style={styles.tagline}>Raccoon is here for you !</Text>
        <Text style={styles.subTagline}>Create your own automatisms with Actions and Reactions</Text>

        <Pressable style={styles.googleButton} onPress={handleGoogleLogin}>
          <Image source={require('../../assets/logos/google.png')} style={styles.googleIcon} />
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </Pressable>

        <Text style={styles.orText}>or Sign in with Email</Text>

        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#d3d3d3"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#d3d3d3"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Pressable
          style={[styles.loginButton, isHovered && styles.loginButtonHover]}
          onPress={handleLogin}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Text style={styles.loginButtonText}>Login</Text>
        </Pressable>

        <Pressable onPress={() => router.push('/forgot-password')}>
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </Pressable>

        <Pressable onPress={() => router.push('/register')}>
          <Text style={styles.registerRedirectText}>Not registered yet? Register here</Text>
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
  raccoonImage: {
    width: 150,
    height: 150,
    marginBottom: 20,
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
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  googleButtonText: {
    fontSize: 16,
    color: '#333',
  },
  orText: {
    marginVertical: 10,
    color: '#888',
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
  loginButton: {
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
  loginButtonHover: {
    transform: 'scale(1.001)',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.3)',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  forgotPasswordText: {
    color: '#6200EE',
    marginTop: 10,
    marginBottom: 20,
    fontSize: 14,
  },
  registerRedirectText: {
    color: '#6200EE',
    marginTop: 20,
    fontSize: 14,
  },
  error: {
    color: 'red',
    marginBottom: 20,
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

export default LoginScreen;
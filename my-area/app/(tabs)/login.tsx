import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Platform } from 'react-native';
import { useRouter } from 'expo-router';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const response = await fetch(`http://localhost:5000/login`, {
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
        router.push('/home');
      } else {
        setErrorMessage(data.error || 'Erreur lors de la connexion.');
      }
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `http://localhost:5000/login/google`;
  };

  return (
    <View style={styles.containerMain}>
      {Platform.OS === 'web' && <View style={styles.leftBar}></View>}
      <View style={styles.container}>
        <Image source={require('../../assets/images/favicon.png')} style={styles.raccoonImage} />
        <Text style={styles.tagline}>Raccoon is here for you !</Text>
        <Text style={styles.subTagline}>Create your own automatisms with Actions and Reactions</Text>

        <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
          <Image source={require('../../assets/logos/google.png')} style={styles.googleIcon} />
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </TouchableOpacity>

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
          placeholder="Mot de passe"
          placeholderTextColor="#d3d3d3"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/forgot-password')}>
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/register')}>
          <Text style={styles.registerRedirectText}>Not registered yet? Register here</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  containerMain: {
    display: 'flex',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  leftBar: {
    backgroundColor: '#594F48',
    borderTopEndRadius: 300,
    width: '50%',
    height: '100%',
  },
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 20,
    marginTop: 100,
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

export default LoginScreen;

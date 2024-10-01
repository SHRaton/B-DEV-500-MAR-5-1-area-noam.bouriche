import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';

const RegisterScreen = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();

  const handleRegister = async () => {
    console.log('Données envoyées:', {
      username: username,
      email: email,
      password: password
    });

    try {
      const response = await fetch('http://localhost:5000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          email: email,
          password: password,
        }),
      });

      const data = await response.json();
      console.log('Réponse du serveur:', data);

      if (response.status === 201) {
        setSuccessMessage('Inscription réussie. Redirection vers la page de login...');
        setErrorMessage('');  // Efface le message d'erreur s'il y en avait un
        setTimeout(() => {
          router.push('/login');  // Redirection après 2 secondes
        }, 2000);
      } else {
        setErrorMessage(data.error || 'Erreur lors de l\'inscription.');
        setSuccessMessage('');  // Efface le message de succès
      }
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      setErrorMessage('Erreur de connexion au serveur');
      setSuccessMessage('');
    }
  };

  return (
    <View style={styles.containerMain}>
      {Platform.OS === 'web' && <View style={styles.leftBar}></View>}
      <View style={styles.container}>
        <Text style={styles.title}>Create a new account</Text>
        {/* Affiche un message d'erreur si l'inscription échoue */}
        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
        {/* Affiche un message de succès si l'inscription réussit */}
        {successMessage ? <Text style={styles.success}>{successMessage}</Text> : null}

        <TextInput
          style={styles.input}
          placeholder="Nom d'utilisateur"
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Mot de passe"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <Button title="S'inscrire" onPress={handleRegister} />
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
    marginTop: 200,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    width: '80%',
  },
  error: {
    color: 'red',
    marginBottom: 20,
  },
  success: {
    color: 'green',
    marginBottom: 20,
  },
});

export default RegisterScreen;

import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';

const TelegramForm = ({ onClose, onSuccess }) => {
  const [chatId, setChatId] = useState('');
  const [apiToken, setApiToken] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!chatId || !apiToken) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/connect-telegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          chatId,
          apiToken
        })
      });

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to connect Telegram');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Connect to Telegram</Text>
        <Text style={styles.subtitle}>Please enter your Telegram credentials</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Chat ID"
          keyboardType='numeric'
          value={chatId}
          onChangeText={setChatId}
          placeholderTextColor="#666"
        />
        
        <TextInput
          style={styles.input}
          placeholder="API Token"
          value={apiToken}
          onChangeText={setApiToken}
          placeholderTextColor="#666"
        />
        
        {error && <Text style={styles.error}>{error}</Text>}
        
        <View style={styles.buttonContainer}>
          <Pressable style={[styles.button, styles.cancelButton]} onPress={onClose}>
            <Text style={styles.buttonText}>Cancel</Text>
          </Pressable>
          <Pressable style={[styles.button, styles.submitButton]} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Connect</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  error: {
    color: 'red',
    marginBottom: 16,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#2B211B',
  },
  submitButton: {
    backgroundColor: '#514137',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TelegramForm;
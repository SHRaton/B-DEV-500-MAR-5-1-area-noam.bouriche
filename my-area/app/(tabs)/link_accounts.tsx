import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Image, Platform, Linking, useWindowDimensions } from 'react-native';

export default function DiscordAuthPage() {

  const handleDiscordLogin = () => {
    const discordLoginURL = `http://localhost:5000/login/discord`;
    if (Platform.OS === 'web') {
      window.location.href = discordLoginURL; // Pour les plateformes web
    } else {
      Linking.openURL(discordLoginURL); // Pour Android et iOS
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connect with Discord</Text>
      <Pressable style={styles.button} onPress={handleDiscordLogin}>
        <Text style={styles.buttonText}>Login with Discord</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#7289da',
    padding: 15,
    borderRadius: 5,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

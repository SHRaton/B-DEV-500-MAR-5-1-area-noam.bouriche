import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Image, Platform, Linking, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';

export default function AuthPage() {
  const [discordStatus, setDiscordStatus] = useState(false);
  const [telegramStatus, setTelegramStatus] = useState(false);
  const [spotifyStatus, setSpotifyStatus] = useState(false);
  const [loading, setLoading] = useState(true); // État de chargement
  const router = useRouter();

  useEffect(() => {
    const checkAllConnections = async () => {
      await Promise.all([
        checkConnectionStatus('discord', setDiscordStatus),
        checkConnectionStatus('telegram', setTelegramStatus),
        checkConnectionStatus('spotify', setSpotifyStatus),
      ]);
      setLoading(false); // Fin du chargement
    };

    checkAllConnections();
  }, []);

  const checkConnectionStatus = async (service, setStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/is-connected-${service}`, {
        credentials: 'include', // Inclure les cookies si nécessaire
      });
      const data = await response.json();
      setStatus(data.connected); 
    } catch (error) {
      console.error(`Error checking ${service} connection:`, error);
    }
  };

  const handleLogin = (service) => {
    const loginURL = `http://localhost:5000/login/${service}`;
    if (Platform.OS === 'web') {
      window.location.href = loginURL;
    } else {
      Linking.openURL(loginURL);
    }
  };

  const renderServiceRow = (serviceName, logoSource, status, onPress) => (
    <View style={styles.serviceRow}>
      <Image source={logoSource} style={styles.logo} />
      <Pressable style={styles.button} onPress={onPress}>
        <Text style={styles.buttonText}>Login with {serviceName}</Text>
        <Text style={[styles.status, status ? styles.connected : styles.disconnected]}>
          {status ? 'Connected' : 'Not connected'}
        </Text>
      </Pressable>
    </View>
  );

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
        <Text style={styles.titleBack}>Home Page</Text>
      </View>
      <Text style={styles.title}>Connect to Services</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#7289da" />
      ) : (
        <>
          {renderServiceRow('Discord', require('../../assets/logos/discord.png'), discordStatus, () => handleLogin('discord'))}
          {renderServiceRow('Telegram', require('../../assets/logos/telegram.png'), telegramStatus, () => handleLogin('telegram'))}
          {renderServiceRow('Spotify', require('../../assets/logos/spotify.png'), spotifyStatus, () => handleLogin('spotify'))}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 200,
  },
  back: {
    marginRight: 10,
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  titleBack: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  logo: {
    width: 40,
    height: 40,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#514137',
    padding: 15,
    marginLeft: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  status: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  connected: {
    color: 'green',
    backgroundColor: '#64ff54',
    padding: 3,
    borderRadius: 3,
  },
  disconnected: {
    color: 'red',
    backgroundColor: '#ff8989',
    padding: 3,
    borderRadius: 3,
  },
});

import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Image, Platform, Linking, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import TelegramForm from './TelegramForm';

export default function AuthPage() {
  const [showTelegramForm, setShowTelegramForm] = useState(false);
  const [discordStatus, setDiscordStatus] = useState(false);
  const [telegramStatus, setTelegramStatus] = useState(false);
  const [spotifyStatus, setSpotifyStatus] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const checkAllConnections = async () => {
    try {
      await Promise.all([
        checkConnectionStatus('discord', setDiscordStatus),
        checkConnectionStatus('telegram', setTelegramStatus),
        checkConnectionStatus('spotify', setSpotifyStatus),
      ]);
    } catch (error) {
      console.error('Error checking connections:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAllConnections();
  }, []);

  const checkConnectionStatus = async (service, setStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/is-connected-${service}`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setStatus(data.connected);
    } catch (error) {
      console.error(`Error checking ${service} connection:`, error);
      setStatus(false);
    }
  };

  const handleDisconnect = async (service, setStatus) => {
    console.log("okokokok")
    try {
      const response = await fetch(`http://localhost:5000/disconnect-${service}`, {
        method: 'GET',
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setStatus(false);
      // Refresh connection status after disconnecting
      await checkAllConnections();
    } catch (error) {
      console.error(`Error disconnecting ${service}:`, error);
    }
  };

  const handleLogin = (service) => {
    if (service === 'telegram') {
      setShowTelegramForm(true);
    } else {
      const loginURL = `http://localhost:5000/login/${service}`;
      if (Platform.OS === 'web') {
        window.location.href = loginURL;
      } else {
        Linking.openURL(loginURL);
      }
    }
  };

  const renderServiceRow = (serviceName, logoSource, status, setStatus) => (
    <View style={styles.serviceRow}>
      <Image source={logoSource} style={styles.logo} />
      <View style={styles.buttonContainer}>
        <Pressable 
          style={styles.button} 
          onPress={() => handleLogin(serviceName.toLowerCase())}
        >
          <Text style={styles.buttonText}>Login with {serviceName}</Text>
          <Text style={[styles.status, status ? styles.connected : styles.disconnected]}>
            {status ? 'Connected' : 'Not connected'}
          </Text>
        </Pressable>
        
        {status && (
          <Pressable 
            style={styles.disconnectButton}
            onPress={() => handleDisconnect(serviceName.toLowerCase(), setStatus)}
          >
            <Text style={styles.disconnectText}>Disconnect</Text>
          </Pressable>
        )}
      </View>
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
          {renderServiceRow('Discord', require('../../assets/logos/discord.png'), discordStatus, setDiscordStatus)}
          {renderServiceRow('Telegram', require('../../assets/logos/telegram.png'), telegramStatus, setTelegramStatus)}
          {renderServiceRow('Spotify', require('../../assets/logos/spotify.png'), spotifyStatus, setSpotifyStatus)}
        </>
      )}
      
      {showTelegramForm && (
        <TelegramForm 
          onClose={() => setShowTelegramForm(false)}
          onSuccess={async () => {
            setShowTelegramForm(false);
            await checkAllConnections();
          }}
        />
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
  buttonContainer: {
    flex: 1,
  },
  disconnectButton: {
    backgroundColor: '#ff4444',
    padding: 7,
    borderRadius: 5,
    marginTop: 8,
    alignItems: 'center',
  },
  disconnectText: {
    color: 'white',
    fontSize: 14,
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

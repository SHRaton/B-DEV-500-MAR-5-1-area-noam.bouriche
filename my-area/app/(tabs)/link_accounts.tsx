import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Image, Platform, Linking, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { LogOut, LogIn } from 'lucide-react';
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
      const response = await fetch(`http://localhost:8080/is-connected-${service}`, {
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
      const response = await fetch(`http://localhost:8080/disconnect-${service}`, {
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
      const loginURL = `http://localhost:8080/login/${service}`;
      if (Platform.OS === 'web') {
        window.location.href = loginURL;
      } else {
        Linking.openURL(loginURL);
      }
    }
  };

  const renderServiceRow = (serviceName, logoSource, status, setStatus) => (
    <View style={styles.serviceContainer}>
      <View style={[
        styles.servicePanel,
        status ? styles.connectedPanel : styles.disconnectedPanel
      ]}>
        <View style={styles.servicePanelContent}>
          <View style={styles.serviceInfo}>
            <Image source={logoSource} style={styles.logoContainer} />
            <Text style={styles.serviceName}>
              {serviceName}
            </Text>
            <View style={[
              styles.statusBadge,
              status ? styles.connected : styles.disconnected
            ]}>
              <Text style={styles.statusText}>
                {status ? 'Connected' : 'Not connected'}
              </Text>
            </View>
          </View>
          
          <View style={styles.actionArea}>
            {!status ? (
              <Pressable
              style={styles.loginButton}
              onPress={() => handleLogin(serviceName.toLowerCase())}
            >
              <LogIn size={20} color="#fff" /> {/* Icône en blanc */}
              <Text style={styles.loginText}>Login</Text>
            </Pressable>
            ) : (
              <Pressable
              style={styles.disconnectButton}
              onPress={() => handleDisconnect(serviceName.toLowerCase(), setStatus)}
            >
              <LogOut size={20} color="#fff" /> {/* Icône en blanc */}
              <Text style={styles.disconnectText}>Logout</Text>
            </Pressable>
            )}
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable 
          style={styles.backButton} 
          onPress={() => router.push("/home")}
        >
          <Image
            source={require('../../assets/images/left.png')}
            style={styles.backIcon}
            resizeMode="contain"
          />
          <Text style={styles.headerTitle}>Home Page</Text>
        </Pressable>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Left Section */}
        <View style={styles.leftSection}>
          <View style={styles.textContent}>
            <Text style={styles.title}>Connect to Services</Text>
            <Text style={styles.description}>
              Link your accounts to unlock the full potential of our automation platform. 
              Connect with Discord, Telegram, and Spotify to create powerful automated workflows 
              and integrate your favorite services seamlessly.
            </Text>
          </View>
          
          <Image
            source={require('../../assets/images/raton_gaming.jpg')}
            style={styles.descriptionImage}
            resizeMode="cover"
          />
        </View>

        {/* Right Section - Services */}
        <View style={styles.rightSection}>
          {loading ? (
            <ActivityIndicator size="large" color="#7289da" />
          ) : (
            <View style={styles.servicesGrid}>
              {renderServiceRow('Discord', require('../../assets/logos/discord.png'), discordStatus, setDiscordStatus)}
              {renderServiceRow('Telegram', require('../../assets/logos/telegram.png'), telegramStatus, setTelegramStatus)}
              {renderServiceRow('Spotify', require('../../assets/logos/spotify.png'), spotifyStatus, setSpotifyStatus)}
            </View>
          )}
        </View>
      </View>

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
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
    padding: 40,
    gap: 40,
  },
  leftSection: {
    flex: 1,
    gap: 30,
  },
  textContent: {
    gap: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 50,
  },
  description: {
    fontSize: 18,
    color: '#666',
    lineHeight: 28,
    marginBottom: 30,
    marginLeft: 50,
  },
  descriptionImage: {
    width: '70%',
    height: 500,
    borderRadius: 20,
    marginLeft: 50,
  },
  rightSection: {
    flex: 1,
    justifyContent: 'center',
  },
  servicesGrid: {
    gap: 20,
    marginTop: 70,
  },
  serviceContainer: {
    backgroundColor: '#614b40',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
  },
  servicePanelContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  serviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  logoContainer: {
    width: 48,
    height: 48,
  },
  serviceName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  connected: {
    backgroundColor: '#4CAF50',
  },
  disconnected: {
    backgroundColor: '#FF5252',
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#7289DA',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loginText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disconnectButton: {
    backgroundColor: '#FF5252',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  disconnectText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
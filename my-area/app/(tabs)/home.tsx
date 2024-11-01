import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Pressable, SafeAreaView, ScrollView, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Home, User, Link, LogOut, ChevronDown } from 'lucide-react';

const AreaDashboard = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  const scrollY = useRef(new Animated.Value(0)).current;
  const arrowOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    // Vérifier l'authentification de l'utilisateur
    const checkAuth = async () => {
      const response = await fetch(`http://localhost:5000/check-auth`, {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();
      setIsLoggedIn(data.authenticated);

      if (!data.authenticated) {
        router.push('/');
      }
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch(`http://localhost:5000/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      if (response.ok) {
        router.push('/');
      } else {
        console.error('Erreur lors de la déconnexion');
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const handleProfile = () => {
    router.push('/profile');
  };

  const handleLinkAccounts = () => {
    router.push('/link_accounts');
  };

  return (
    <SafeAreaView style={styles.pageContainer}>
      <ScrollView 
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
      >
        <View style={styles.contentContainer}>
          <View style={styles.leftColumn}>
            <View style={styles.textContainer}>
              <Text style={styles.welcomeTitle}>Welcome to your AREA Dashboard 🧩</Text>
              <Text style={styles.welcomeSubtitle}>Automate your daily tasks easily</Text>
            </View>
            <View style={styles.imageContainer}>
              <Image
                source={require('../../assets/images/favicon.png')}
                style={styles.image}
                resizeMode="contain"
              />
            </View>
          </View>
          
          <View style={styles.rightColumn}>
            <View style={styles.buttonGrid}>
              <Pressable style={styles.buttonMyAreas} onPress={() => router.push('/my_areas')}>
                <Home size={24} color="#fff" />
                <Text style={styles.buttonText}>My Areas</Text>
              </Pressable>
              <Pressable style={styles.buttonProfile} onPress={handleProfile}>
                <User size={24} color="#fff" />
                <Text style={styles.buttonText}>Profile</Text>
              </Pressable>
              <Pressable style={styles.buttonLinkAccounts} onPress={handleLinkAccounts}>
                <Link size={24} color="#fff" />
                <Text style={styles.buttonText}>Link Accounts</Text>
              </Pressable>
              <Pressable style={styles.buttonDisconnect} onPress={handleLogout}>
                <LogOut size={24} color="#fff" />
                <Text style={styles.buttonText}>Disconnect</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.triggerSection}>
          <Animated.View style={[styles.arrowContainer, { opacity: arrowOpacity }]}>
            <ChevronDown size={80} color="#614b40" />
          </Animated.View>
          <Image
            source={require('../../assets/images/whatis.png')}
            style={styles.triggerImage}
            resizeMode="contain"
          />
        </View>

          <View style={styles.triggerSection}>
            <Image
              source={require('../../assets/images/trigger.png')}
              style={styles.triggerImage}
              resizeMode="contain"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  contentContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 80,
  },
  leftColumn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 30,
  },
  rightColumn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 38,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 100,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 28,
    color: '#666',
    textAlign: 'center',
  },
  imageContainer: {
    width: '100%',
    maxHeight: 400,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 500,
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  buttonMyAreas: {
    width: '35%',
    padding: 20,
    height: 100,
    backgroundColor: '#614b40',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  buttonProfile: {
    width: '55%',
    padding: 20,
    height: 100,
    backgroundColor: '#514137',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  buttonLinkAccounts: {
    width: '55%',
    height: 100,
    padding: 20,
    backgroundColor: '#00b33c',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  buttonDisconnect: {
    width: '35%',
    padding: 20,
    height: 100,
    backgroundColor: '#ff3333',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 25,
    fontWeight: 'bold',
  },
  triggerSection: {
    width: '100%',
    alignItems: 'center',
    marginTop: 200,
  },
  triggerImage: {
    width: '150%',
    height: 900,
    marginTop: 50
  },
  arrowContainer: {
    position: 'absolute',
    top: -50,
    alignSelf: 'center',
    zIndex: 1,
  },
});

export default AreaDashboard;
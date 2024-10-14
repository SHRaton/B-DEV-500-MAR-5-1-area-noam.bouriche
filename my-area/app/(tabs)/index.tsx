import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions, Platform } from 'react-native';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

const HomeScreen = () => {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const response = await fetch('http://localhost:5000/check-auth', {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();

      if (data.authenticated) {
        router.push('/home');
      }
    };

    checkAuth();
  }, []);

  const isMobile = width < 768;

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Areacoon</Text>
        <Text style={styles.subtitle}>
          Welcome visitor !{'\n'}
          Thanks to Areacoon, automate your tasks like never before !
        </Text>
        <Text style={styles.sub_subtitle}>
          The automation platform for your digital life.
        </Text>
        <View style={isMobile ? styles.mobileLayout : styles.desktopLayout}>
          <View style={styles.imageContainer}>
            <Image
              source={require('../../assets/images/favicon.png')}
              style={[styles.image, isMobile && styles.mobileImage]}
              resizeMode="contain"
            />
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={() => router.push('/register')}>
              <Text style={styles.buttonText}>SIGN UP</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.signInButton]} onPress={() => router.push('/login')}>
              <Text style={styles.signInButtonText}>SIGN IN</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#514137',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 24,
    color: '#555',
    marginBottom: 10,
    textAlign: 'center',
    maxWidth: '80%',
  },
  sub_subtitle: {
    fontSize: 20,
    color: '#555',
    marginBottom: 20,
    textAlign: 'center',
    maxWidth: '80%',
  },
  desktopLayout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 1000,
  },
  mobileLayout: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  imageContainer: {
    marginRight: width < 768 ? 0 : 40,
    marginBottom: width < 768 ? 20 : 0,
  },
  image: {
    width: 450,
    height: 450,
  },
  mobileImage: {
    width: width * 0.7,
    height: width * 0.7,
    maxWidth: 350,
    maxHeight: 350,
  },
  buttonContainer: {
    width: width < 768 ? '100%' : 500,
  },
  button: {
    backgroundColor: '#514137',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  signInButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#514137',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: width < 768 ? 16 : 18,
    fontWeight: 'bold',
  },
  signInButtonText: {
    color: '#514137',
    fontSize: width < 768 ? 16 : 18,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
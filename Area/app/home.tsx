import React, { useEffect } from 'react';
import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';

const HomeScreen = () => {
  const router = useRouter();

  useEffect(() => {
    // Vérifie si l'utilisateur est authentifié
    const checkAuth = async () => {
      const response = await fetch('http://localhost:5000/check-auth', {
        method: 'GET',
        credentials: 'include',  // Envoie les cookies pour la session
      });
      const data = await response.json();

      if (!data.authenticated) {
        router.push('/login');  // Redirige vers la page de login si non authentifié
      }
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:5000/logout', {
        method: 'POST',
        credentials: 'include',  // Envoie les cookies pour détruire la session
      });

      if (response.ok) {
        router.push('/login');  // Redirige l'utilisateur vers la page de login après la déconnexion
      } else {
        console.error('Erreur lors de la déconnexion');
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <View>
      <Text>Bienvenue sur la page d'accueil !</Text>
      <Button title="Se déconnecter" onPress={handleLogout} />  {/* Bouton de déconnexion */}
    </View>
  );
};

export default HomeScreen;

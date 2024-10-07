import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

interface Area {
  id: number;
  user_id: number;
  name: string;
  description: string;
  key: string;
  reaction_1?: string;
  reaction_2?: string;
  reaction_3?: string;
  reaction_4?: string;
  reaction_5?: string;
  reaction_6?: string;
}

const MyAreas: React.FC = () => {
  const [areas, setAreas] = useState<Area[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Vérifie si l'utilisateur est authentifié
    const checkAuth = async () => {
      const response = await fetch(`http://localhost:5000/check-auth`, {
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

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const response = await fetch(`http://localhost:5000/get-areas`, {
          method: 'GET',
          credentials: 'include',
        });
        const data = await response.json();
        setAreas(data);
      } catch (error) {
        console.error('Erreur lors de la récupération des areas:', error);
      }
    };

    fetchAreas();
  }, []);

  const renderArea = ({ item }: { item: Area }) => (
    <View style={styles.areaContainer}>
      <Text style={styles.areaName}>{item.name}</Text>
      <Text style={styles.areaDescription}>{item.description}</Text>
      <ScrollView>
        {[...Array(6)].map((_, index) => (
          item[`reaction_${index + 1}` as keyof Area] ? (
            <Text key={index} style={styles.areaReaction}>
              Reaction {index + 1}: {item[`reaction_${index + 1}` as keyof Area]}
            </Text>
          ) : null
        ))}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Areas</Text>
      <FlatList
        data={areas}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderArea}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  areaContainer: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  areaName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  areaDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  areaReaction: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
});

export default MyAreas;

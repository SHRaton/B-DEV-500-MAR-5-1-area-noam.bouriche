import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, Pressable, Image, Switch } from 'react-native';
import { useRouter } from 'expo-router';

interface Area {
  id: number;
  user_id: number;
  name: string;
  description: string;
  key: string;
  isActive: boolean;
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
    const checkAuth = async () => {
      const response = await fetch(`http://localhost:5000/check-auth`, {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();
      
      if (!data.authenticated) {
        router.push('/');
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

  const toggleAreaStatus = async (areaId: number, newStatus: boolean) => {
    try {
      const response = await fetch(`http://localhost:5000/update-area-status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          areaId,
          isActive: newStatus,
        }),
      });
      if (response.ok) {
        setAreas(prevAreas =>
          prevAreas.map(area =>
            area.id === areaId ? { ...area, isActive: newStatus } : area
          )
        );
      } else {
        console.error('Failed to update area status');
      }
    } catch (error) {
      console.error('Error updating area status:', error);
    }
  };

  const renderArea = ({ item }: { item: Area }) => (
    <Pressable 
      style={styles.areaContainer} 
      onPress={() => {
        // Handle area click logic
        console.log(`Area clicked: ${item.name}`);
      }}
    >
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
      {/* Toggle Switch for Area Activation */}
      <View style={styles.toggleContainer}>
        <Text style={styles.toggleLabel}>Active:</Text>
        <Switch
          value={item.isActive}
          onValueChange={(newStatus) => toggleAreaStatus(item.id, newStatus)}
        />
      </View>
    </Pressable>
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
        <Text style={styles.title}>My Areas</Text>
      </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  back: {
    marginRight: 10,
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
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
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  toggleLabel: {
    marginRight: 10,
    fontSize: 16,
  },
});

export default MyAreas;

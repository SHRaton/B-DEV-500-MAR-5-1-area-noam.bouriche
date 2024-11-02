import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, Pressable, Image, Switch, TouchableOpacity, Modal } from 'react-native';
import { useRouter } from 'expo-router';

interface Area {
  id: number;
  user_id: number;
  name: string;
  description: string;
  key: string;
  isActive: boolean;
  action_1?: string;
  action_1_info?: string;
  reaction_1?: string;
  reaction_1_info?: string;
  reaction_2?: string;
  reaction_2_info?: string;
  reaction_3?: string;
  reaction_3_info?: string;
  reaction_4?: string;
  reaction_4_info?: string;
  reaction_5?: string;
  reaction_5_info?: string;
  reaction_6?: string;
  reaction_6_info?: string;
}

const MyAreas: React.FC = () => {
  const [areas, setAreas] = useState<Area[]>([]);
  const router = useRouter();
  const [hoveredButtons, setHoveredButtons] = useState<{ [key: number]: boolean }>({});
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [areaToDelete, setAreaToDelete] = useState<Area | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const response = await fetch(`http://localhost:8080/check-auth`, {
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
        const response = await fetch(`http://localhost:8080/get-areas`, {
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
      const response = await fetch(`http://localhost:8080/update-area-status`, {
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

  const handleDeleteArea = async () => {
    if (!areaToDelete) return;

    try {
      const response = await fetch(`http://localhost:8080/delete-area`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          areaId: areaToDelete.id,
        }),
      });

      if (response.ok) {
        setAreas(prevAreas => prevAreas.filter(area => area.id !== areaToDelete.id));
        setIsDeleteModalVisible(false);
        setAreaToDelete(null);
      } else {
        console.error('Failed to delete area');
      }
    } catch (error) {
      console.error('Error deleting area:', error);
    }
  };

  const renderArea = ({ item }: { item: Area }) => (
    <Pressable 
      style={styles.areaContainer} 
      onPress={() => {
        console.log(`Area clicked: ${item.name}`);
      }}
    >
      <View style={styles.areaInfo}>
        <Text style={styles.areaName}>{item.name}</Text>
        <Text style={styles.areaDescription}>{item.description}</Text>
        <View style={styles.actionContainer}>
          <Image source={getLogoSource(item.action_1)} style={styles.actionLogoLarge} resizeMode="contain"/>
          <Text style={styles.areaReaction}>Action : {getSummaryText(item.action_1, item.action_1_info)}</Text>
        </View>
        <ScrollView style={styles.scrollview}>
          {[...Array(6)].map((_, index) => {
            const reactionKey = `reaction_${index + 1}` as keyof Area;
            const reactionInfoKey = `reaction_${index + 1}_info` as keyof Area;
            const reactionName = item[reactionKey];
            const reactionInfo = parseDetails(item[reactionInfoKey] as string | undefined);

            return reactionName ? (
              <View style={styles.reactionContainer} key={index}>
                <Image source={getLogoSource(reactionName)} style={styles.actionLogoLarge} resizeMode="contain"/>
                <Text style={styles.areaReaction}>
                  Reaction {index + 1}: {getSummaryText(reactionName as string, reactionInfo)}
                </Text>
              </View>
            ) : null;
          })}
        </ScrollView>
      </View>
      <TouchableOpacity
        style={[
          styles.deleteButton,
          hoveredButtons[item.id] && styles.deleteButtonHover
        ]}
        onMouseEnter={() => setHoveredButtons(prev => ({ ...prev, [item.id]: true }))}
        onMouseLeave={() => setHoveredButtons(prev => ({ ...prev, [item.id]: false }))}
        onPress={() => {
          setAreaToDelete(item);
          setIsDeleteModalVisible(true);
        }}
      >
        <Text style={{ color: '#ef4444' }}>Delete</Text>
      </TouchableOpacity>
      <Switch
        value={item.isActive}
        onValueChange={(newStatus) => toggleAreaStatus(item.id, newStatus)}
        style={styles.switch}
      />
    </Pressable>
  );

  const parseDetails = (details: string | undefined) => {
    try {
      return details ? JSON.parse(details) : {};
    } catch (error) {
      console.error("Error parsing details:", error);
      return {};
    }
  };

  const getLogoSource = (logoName: string | undefined) => {
    switch (logoName) {
      case 'Deepl_1':
        return require('../../assets/logos/deepl.png');
      case 'Discord_1':
        return require('../../assets/logos/discord.png');
      case 'Discord_2':
        return require('../../assets/logos/discord.png');
      case 'Spotify_1':
        return require('../../assets/logos/spotify.png');
      case 'Spotify_2':
        return require('../../assets/logos/spotify.png');
      case 'Spotify_3':
        return require('../../assets/logos/spotify.png');
      case 'Spotify_4':
        return require('../../assets/logos/spotify.png');
      case 'Spotify_5':
        return require('../../assets/logos/spotify.png');
      case 'Spotify_6':
        return require('../../assets/logos/spotify.png');
      case 'Telegram_1':
        return require('../../assets/logos/telegram.png');
      case 'BTC':
        return require('../../assets/logos/gecko.png');
      case 'IS_STREAMING':
        return require('../../assets/logos/twitch.png');
      case 'DETECT_MESSAGE':
        return require('../../assets/logos/twitch.png');
      case 'IS_RAINING':
        return require('../../assets/logos/weather.png');
      case 'IS_NIGHT':
        return require('../../assets/logos/weather.png');
      case 'none':
      default:
        return require('../../assets/logos/none.png');
    }
  };

  const getSummaryText = (actionName: string | undefined, details: { [key: string]: string | "test"}) => {
    console.log(actionName);
    console.log(details);
    switch (actionName) {
      case 'Deepl_1':
        return `Traduit le texte "${details.message}" en ${details.langue}.`;
      case 'Discord_1':
        return `Envoie un message privé (${details.message}) à ${details.person}.`;
      case 'Discord_2':
        return `Envoie un message dans le canal défini avec le contenu (${details.message}).`;
      case 'Spotify_1':
        return `Récupère la playlist de l'utilisateur.`;
      case 'Spotify_2':
        return `Récupère les 5 titres préférés de l'utilisateur}.`;
      case 'Spotify_3':
        return `Recommande 10 chansons similaires à "${details.song}".`;
      case 'Spotify_4':
        return `Recommande 10 artistes similaires à "${details.artist}".`;
      case 'Spotify_5':
        return `Récupère les dernières sorties musicales de l'utilisateur ${details.user}.`;
      case 'Telegram_1':
        return `Envoie un message (${details.message}) à ${details.person} sur Telegram.`;
      case 'BTC':
        return `Vérifie si le prix du Bitcoin a augmenté.`;
      case 'IS_STREAMING':
        return `Vérifie si le streamer ${details.streamer} est en live.`;
      case 'DETECT_MESSAGE':
        return `Détecte un nouveau message de ${details.person} sur Twitch.`;
      case 'IS_RAINING':
        return `Vérifie si il pleut.`;
      case 'IS_NIGHT':
        return `Vérifie si il fait nuit.`;
      default:
        return `Aucune action spécifiée pour ${actionName}.`;
    }
  };

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
        <Pressable style={styles.addAreasButton} onPress={() => router.push("/add_area")}>
          <Text style={styles.addAreasButtonText}>+ Add an Area</Text>
        </Pressable>
      </View>
      <FlatList
        data={areas}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderArea}
        contentContainerStyle={{ flexGrow: 1 }}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        visible={isDeleteModalVisible}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Deletion</Text>
            <Text style={styles.modalText}>
              Are you sure you want to delete area "{areaToDelete?.name}"?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setIsDeleteModalVisible(false);
                  setAreaToDelete(null);
                }}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleDeleteArea}
              >
                <Text style={[styles.modalButtonText, { color: 'white' }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  addAreasButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addAreasButton: {
    backgroundColor: '#2B211B',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginVertical: 10,
    width: '10%',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  confirmButton: {
    backgroundColor: '#ef4444',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  deleteButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    fontSize: 18,
    borderWidth: 2,
    borderColor: '#ef4444',
    borderRadius: 8,
    color: '#ef4444',
    marginRight: 25,
    backgroundColor: 'white',
  },
  deleteButtonHover: {
    backgroundColor: '#fef2f2',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    marginRight: 1510,
  },
  areaContainer: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'black',
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',  // Espace entre les éléments
  },
  areaInfo: {
    flex: 1,  // Prend tout l'espace disponible sauf pour le switch
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
  switch: {
    color: '#2545',
    transform: [{ scaleX: 1.5 }, { scaleY: 1.5 }],  // Agrandir le switch
    alignSelf: 'center',  // Centre verticalement le switch
    marginRight: 50,
  },
  areaReaction: {
    fontSize: 17,
    color: '#333',
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center', // Centers text and image vertically
    marginBottom: 20,
    backgroundColor: '#d3d3d3', // Light gray background
    marginRight: 50,
    borderRadius: 10,
    padding: 12,
    shadowColor: '#000', // Shadow for subtle depth
    shadowOpacity: 0.2,
    shadowOffset: { width: 1, height: 2 },
    shadowRadius: 4,
  },
  reactionContainer: {
    flexDirection: 'row',
    alignItems: 'center', // Centers text and image vertically
    marginVertical: 8,
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  actionLogoLarge: {
    width: 35,
    height: 35,
    marginRight: 15,
  },
  scrollview: {
    padding: 12,
    marginRight: 50,
    borderRadius: 10,
    backgroundColor: '#f5f3e7', // Soft, raccoon-inspired beige
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 1, height: 3 },
    shadowRadius: 4,
    backgroundImage: 'linear-gradient(45deg, #e8e6e1, #d5d2cd)',
  },
});

export default MyAreas;

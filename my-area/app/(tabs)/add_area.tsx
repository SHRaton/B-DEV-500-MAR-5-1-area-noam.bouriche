import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Modal, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

const AddArea = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedApi, setSelectedApi] = useState<string | null>(null);
  const [selectedApiAction, setSelectedApiAction] = useState<string | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [showApiModal, setShowApiModal] = useState(false);
  const [reactions, setReactions] = useState<{ logo: string, name: string }[]>(Array(6).fill({ logo: 'none', name: 'None' }));
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [currentReactionIndex, setCurrentReactionIndex] = useState<number | null>(null);
  const [showSubServiceModal, setShowSubServiceModal] = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const router = useRouter();

  const MAX_REACTIONS = 6;

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`http://localhost:5000/check-auth`, {
          method: 'GET',
          credentials: 'include',
        });
        const data = await response.json();

        if (!data.authenticated) {
          router.push('/login');
        } else {
          setAuthenticated(true);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'authentification:', error);
        router.push('/login');
      }
    };

    checkAuth();
  }, []);

  const openReactionModal = (index: number) => {
    setCurrentReactionIndex(index);
    setShowServiceModal(true);
  };

  const getLogoSource = (logoName: string) => {
    switch (logoName) {
      case 'deepl':
        return require('../../assets/logos/deepl.png');
      case 'discord':
        return require('../../assets/logos/discord.png');
      case 'twitch':
        return require('../../assets/logos/twitch.png');
      case 'spotify':
        return require('../../assets/logos/spotify.png');
      case 'none':
      default:
        return require('../../assets/logos/none.png');
    }
  };

  const handleServiceSelect = (service: string) => {
    setSelectedService(service);
    setShowServiceModal(false);
    setShowSubServiceModal(true);
  };

  const handleSubServiceSelect = (subService: string, logo: string) => {
    if (currentReactionIndex !== null) {
      const updatedReactions = [...reactions];
      updatedReactions[currentReactionIndex] = { logo, name: subService };
      setReactions(updatedReactions);
      setCurrentReactionIndex(null);
      setShowSubServiceModal(false);
    }
  };

  const handleSubmitArea = () => {
    // Logique pour ajouter l'area
    console.log('Ajouter l\'area avec:', {
      name,
      description,
      selectedApi,
      selectedApiAction,
      reactions
    });
  };

  if (!authenticated) {
    return null;
  }

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
        <Text style={styles.title}>Créer une nouvelle Area</Text>
      </View>
      <ScrollView contentContainerStyle={styles.innerContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nom de l'Area"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Description de l'Area"
          value={description}
          onChangeText={setDescription}
        />
        {/* Choisir une action de départ */}
        <Text style={styles.subtitle}>Choisir une action de départ</Text>
        <View style={styles.fastFoodContainer}>
          <TouchableOpacity style={styles.serviceBox} onPress={() => setSelectedApi('Riot Games')}>
            <Image source={require('../../assets/logos/riot_games.png')} style={styles.serviceImage} />
            <Text style={styles.serviceText}>Riot Games</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.serviceBox} onPress={() => setSelectedApi('Twitch')}>
            <Image source={require('../../assets/logos/twitch.png')} style={styles.serviceImage} />
            <Text style={styles.serviceText}>Twitch</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.serviceBox} onPress={() => setSelectedApi('YouTube')}>
            <Image source={require('../../assets/logos/youtube.png')} style={styles.serviceImage} />
            <Text style={styles.serviceText}>YouTube</Text>
          </TouchableOpacity>
        </View>

        {/* Réactions ajoutées */}
        <Text style={styles.subtitle}>Réactions ({reactions.length}/{MAX_REACTIONS})</Text>
        <View style={styles.reactionContainer}>
          {reactions.map((reaction, index) => (
            <TouchableOpacity key={index} onPress={() => openReactionModal(index)} style={styles.reactionBox}>
              <Image source={getLogoSource(reaction.logo)} style={styles.reactionLogo} />
              <Text style={styles.reactionText}>{reaction.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmitArea}>
          <Text style={styles.submitButtonText}>Ajouter l'area</Text>
        </TouchableOpacity>

        {/* Modal pour sélectionner le service */}
        <Modal visible={showServiceModal} transparent={true} animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Sélectionnez un service</Text>
              <TouchableOpacity onPress={() => handleServiceSelect('Deepl')}>
                <Image source={require('../../assets/logos/deepl.png')} style={styles.serviceLogo} />
                <Text style={styles.optionText}>Deepl</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleServiceSelect('Discord')}>
                <Image source={require('../../assets/logos/discord.png')} style={styles.serviceLogo} />
                <Text style={styles.optionText}>Discord</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleServiceSelect('Twitch')}>
                <Image source={require('../../assets/logos/twitch.png')} style={styles.serviceLogo} />
                <Text style={styles.optionText}>Twitch</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleServiceSelect('Spotify')}>
                <Image source={require('../../assets/logos/spotify.png')} style={styles.serviceLogo} />
                <Text style={styles.optionText}>Spotify</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleServiceSelect('None')}>
                <Image source={require('../../assets/logos/none.png')} style={styles.serviceLogo} />
                <Text style={styles.optionText}>None</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Modal pour sélectionner la sous-partie */}
        <Modal visible={showSubServiceModal} transparent={true} animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Sélectionnez une option pour {selectedService}</Text>
              {selectedService === 'Deepl' && (
                <>
                  <TouchableOpacity onPress={() => handleSubServiceSelect('Traduction rapide', 'deepl')}>
                    <Text style={styles.optionText}>Traduction rapide</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleSubServiceSelect('Traduction complète', 'deepl')}>
                    <Text style={styles.optionText}>Traduction complète</Text>
                  </TouchableOpacity>
                </>
              )}
              {selectedService === 'Discord' && (
                <>
                  <TouchableOpacity onPress={() => handleSubServiceSelect('Envoyer un message', 'discord')}>
                    <Text style={styles.optionText}>Envoyer un message</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleSubServiceSelect('Recevoir une notification', 'discord')}>
                    <Text style={styles.optionText}>Recevoir une notification</Text>
                  </TouchableOpacity>
                </>
              )}
              {/* Ajout des autres options */}
              <TouchableOpacity onPress={() => setShowSubServiceModal(false)} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>Fermer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  back: {
    paddingRight: 10,
  },
  backIcon: {
    width: 30,
    height: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  innerContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    width: '80%',
  },
  fastFoodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginVertical: 20,
  },
  serviceBox: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 10,
    alignItems: 'center',
    width: 120,
    height: 150,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  serviceImage: {
    width: 60,
    height: 60,
    marginBottom: 10,
  },
  serviceText: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  reactionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
  reactionBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    margin: 10,
    width: 120,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  reactionLogo: {
    width: 60,
    height: 60,
    marginBottom: 10,
  },
  reactionText: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 5,
    marginTop: 30,
    width: '80%',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  optionText: {
    fontSize: 18,
    marginVertical: 10,
    color: '#007bff',
  },
  serviceLogo: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#ff0000',
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default AddArea;

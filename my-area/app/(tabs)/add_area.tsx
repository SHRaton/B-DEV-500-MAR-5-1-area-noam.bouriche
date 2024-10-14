import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Modal, Pressable, Button } from 'react-native';
import { useRouter } from 'expo-router';

const AddArea = () => {
  const [step, setStep] = useState(1); // Étape actuelle
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedApi, setSelectedApi] = useState<string | null>(null);
  const [selectedApiAction, setSelectedApiAction] = useState<string | null>(null);
  const [reactions, setReactions] = useState<{ logo: string, name: string }[]>(Array(6).fill({ logo: 'none', name: 'None' }));
  const [showServiceModal, setShowServiceModal] = useState(false); // Affichage de la pop-up pour ajouter une réaction
  const [currentReactionIndex, setCurrentReactionIndex] = useState<number | null>(null); // Indice de la réaction en cours d'ajout
  const [showSubServiceModal, setShowSubServiceModal] = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [error, setError] = useState(''); // État pour stocker le message d'erreur
  const router = useRouter();
  const MAX_REACTIONS = 6;

  // Navigation entre les étapes
  const goNextStep = () => {
    // Vérification si l'un des champs est vide
    if (!name || !description) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
  
    setError(''); // Réinitialise l'erreur si les champs sont remplis    
    setStep((prev) => prev + 1);
  }
  const goPreviousStep = () => setStep((prev) => prev - 1);

  // Sélection d'un service à partir de la modale principale
  const handleServiceSelect = (service: string) => {
    setSelectedService(service);
    setShowServiceModal(false); // Fermer la modale principale
    setShowSubServiceModal(true); // Ouvrir la sous-modale des options de réaction
  };

  useEffect(() => {
    // Vérifie si l'utilisateur est authentifié
    const checkAuth = async () => {
      const response = await fetch(`http://localhost:5000/check-auth`, {
        method: 'GET',
        credentials: 'include',  // Envoie les cookies pour la session
      });
      const data = await response.json();

      if (!data.authenticated) {
        router.push('/');  // Redirige vers la page de login si non authentifié
      }
    };
    
    checkAuth();
  }, []);

  // Sélection d'une sous-réaction (option après le choix du service)
  const handleSubServiceSelect = (subService: string, logo: string) => {
    if (currentReactionIndex !== null) {
      const updatedReactions = [...reactions];
      updatedReactions[currentReactionIndex] = { logo, name: subService };
      setReactions(updatedReactions); // Mettre à jour les réactions avec la nouvelle sélection
      setCurrentReactionIndex(null);
      setShowSubServiceModal(false); // Fermer la sous-modale après avoir sélectionné
    }
  };

  // Ouvrir la modale pour ajouter une nouvelle réaction
  const openReactionModal = (index: number) => {
    setCurrentReactionIndex(index);
    setShowServiceModal(true); // Ouvrir la modale de sélection de service
  };

  // Soumettre l'area une fois que tout est configuré
  const handleSubmitArea = async () => {
    const areaData = {
      isActive: true,
      isPublic: false,
      name,
      description,
      selectedApi,
      selectedApiAction,
      // Map the reactions to the format expected by the API
      ...reactions.reduce((acc, reaction, index) => {
        if (reaction.name !== 'None') {
          acc[`reaction_${index + 1}`] = reaction.name;
          acc[`reaction_${index + 1}_info`] = reaction.message || reaction.info || '';
        }
        return acc;
      }, {})
    };

    try {
      const response = await fetch('http://localhost:5000/add-area', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(areaData),
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to add area');
      }
      const result = await response.json();
      console.log('Area added successfully:', result);
      setError('');
      router.push('/home');
    } catch (error) {
      console.error('Error adding area:', error);
      setError('Failed to add area. Please try again.');
    }
  };

  // Contenu dynamique selon l'étape actuelle
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <TextInput
              style={styles.input}
              placeholder="Nom de l'Area"
              value={name}
              onChangeText={(text) => {
                setName(text);
                setError(''); // Effacer l'erreur lors de la saisie
              }}
            />
            <TextInput
              style={styles.input}
              placeholder="Description de l'Area"
              value={description}
              onChangeText={(text) => {
                setDescription(text);
                setError(''); // Effacer l'erreur lors de la saisie
              }}
            />
            
            {/* Affichage du message d'erreur si un champ est manquant */}
            {error ? <Text style={{ color: 'red' }}>{error}</Text> : null}
        
            <TouchableOpacity style={styles.button} onPress={goNextStep}>
              <Text style={styles.buttonText}>Suivant</Text>
            </TouchableOpacity>
          </>
        );
        case 2:
          return (
            <>
              <Text style={styles.subtitle}>Choisir une action de départ</Text>
              <View style={styles.serviceContainer}>
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

              {/* Afficher la pop-up pour les sous-services après avoir sélectionné un service */}
              {selectedApi && (
                <Modal visible={true} transparent={true} animationType="slide">
                  <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                      <Pressable style ={styles.crossbutton} onPress={() => setSelectedApi('')}>
                        <Image source={require('../../assets/images/cross.png')} style={styles.cross}/>
                      </Pressable>
                      <Text style={styles.modalTitle}>Choisir une action pour {selectedApi}</Text>

                      {selectedApi === 'Riot Games' && (
                        <>
                          <TouchableOpacity 
                            onPress={() => {
                              setSelectedApiAction('Game started');
                              setShowSubServiceModal(false); // Fermer la modale
                              goNextStep(); // Aller à l'étape suivante
                            }}>
                            <Text style={styles.optionText}>Game started</Text>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            onPress={() => {
                              setSelectedApiAction('Game ended');
                              setShowSubServiceModal(false); // Fermer la modale
                              goNextStep(); // Aller à l'étape suivante
                            }}>
                            <Text style={styles.optionText}>Game ended</Text>
                          </TouchableOpacity>
                        </>
                      )}
                      {selectedApi === 'Twitch' && (
                        <>
                          <TouchableOpacity 
                            onPress={() => {
                              setSelectedApiAction('Streamer starts a stream');
                              setShowSubServiceModal(false); // Fermer la modale
                              goNextStep(); // Aller à l'étape suivante
                            }}>
                            <Text style={styles.optionText}>Streamer starts a stream</Text>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            onPress={() => {
                              setSelectedApiAction('Streamer ends a stream');
                              setShowSubServiceModal(false); // Fermer la modale
                              goNextStep(); // Aller à l'étape suivante
                            }}>
                            <Text style={styles.optionText}>Streamer ends a stream</Text>
                          </TouchableOpacity>
                        </>
                      )}
                      {selectedApi === 'YouTube' && (
                        <>
                          <TouchableOpacity 
                            onPress={() => {
                              setSelectedApiAction('New video posted');
                              setShowSubServiceModal(false); // Fermer la modale
                              goNextStep(); // Aller à l'étape suivante
                            }}>
                            <Text style={styles.optionText}>New video posted</Text>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            onPress={() => {
                              setSelectedApiAction('Live stream started');
                              setShowSubServiceModal(false); // Fermer la modale
                              goNextStep(); // Aller à l'étape suivante
                            }}>
                            <Text style={styles.optionText}>Live stream started</Text>
                          </TouchableOpacity>
                        </>
                      )}
                    </View>
                  </View>
                </Modal>
              )}

              <TouchableOpacity style={styles.buttonBack} onPress={goPreviousStep}>
                <Text style={styles.buttonText}>Retour</Text>
              </TouchableOpacity>
            </>
          );
          case 3:
  return (
    <>
      <Text style={styles.subtitle}>Ajouter des réactions</Text>
      <View style={styles.reactionContainer}>
        {reactions.map((reaction, index) => (
          <View key={index} style={styles.reactionBox}>
            {/* Logo et nom du service */}
            <TouchableOpacity onPress={() => openReactionModal(index)} style={styles.reactionHeader}>
              <Image source={getLogoSource(reaction.logo)} style={styles.reactionLogoLarge} />
              <Text style={styles.reactionTextLarge}>{reaction.name}</Text>
            </TouchableOpacity>

            {/* Afficher la section des informations uniquement si une réaction a été sélectionnée */}
            {reaction.name !== 'None' && (
              <View style={styles.informationBox}>
                {reaction.name === 'Envoyer un message' && (
                  <>
                    <Text style={styles.informationTitle}>Message à envoyer</Text>
                    <TextInput
                      style={styles.messageInputLarge}
                      placeholder="Quel message souhaitez-vous envoyer ?"
                      value={reaction.message || ''}
                      onChangeText={(text) => {
                        const updatedReactions = [...reactions];
                        updatedReactions[index].message = text; // Mettre à jour le message pour cette réaction
                        setReactions(updatedReactions);
                      }}
                    />
                  </>
                )}

                {/* Informations supplémentaires par défaut pour les autres réactions */}
                {reaction.name !== 'Envoyer un message' && (
                  <>
                    <Text style={styles.informationTitle}>Informations :</Text>
                    <TextInput
                      style={styles.messageInputLarge}
                      placeholder="Informations supplémentaires"
                      value={reaction.info || ''}
                      onChangeText={(text) => {
                        const updatedReactions = [...reactions];
                        updatedReactions[index].info = text; // Mettre à jour les informations pour cette réaction
                        setReactions(updatedReactions);
                      }}
                    />
                  </>
                )}
              </View>
            )}
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSubmitArea}>
        <Text style={styles.buttonText}>Terminer et ajouter l'area</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.buttonBack} onPress={goPreviousStep} onPressIn={() => setSelectedApi('')}>
        <Text style={styles.buttonText}>Retour</Text>
      </TouchableOpacity>

      {/* Modal pour sélectionner un service */}
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
              <Text style={styles.optionText}>None</Text>
            </TouchableOpacity>

            {/* Bouton pour fermer la modal */}
            <TouchableOpacity onPress={() => setShowServiceModal(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Fermer</Text>
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
            <TouchableOpacity onPress={() => setShowSubServiceModal(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );        
      default:
        return null;
    }
  };

  return (
    <View style={styles.all}>
      <View style={styles.header}>
        <Pressable style={styles.back} onPress={() => router.push("/home")}>
          <Image
            source={require('../../assets/images/left.png')}
            style={styles.backIcon}
            resizeMode="contain"
          />
        </Pressable>
        <Text style={styles.title}>Add Areas</Text>
      </View>
      <View style={styles.container}>
        <Text style={styles.stepIndicator}>Étape {step} / 3</Text>
        {renderStepContent()}
      </View>
    </View>
  );
};

// Fonction pour récupérer les logos en fonction du service
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
    case 'riot_games':
      return require('../../assets/logos/riot_games.png');
    case 'youtube':
      return require('../../assets/logos/youtube.png');
    case 'none':
    default:
      return require('../../assets/logos/none.png');
  }
};

const styles = StyleSheet.create({
  crossbutton:{
    position: 'absolute',  // Position absolue dans le conteneur
    top: '8%',             // 5% de l'espace en haut du conteneur
    left: '2%',            // 5% de l'espace depuis la gauche  
  },
  cross:{
    width: 24,
    height: 24,
  },
  all: {
    flex: 1,
    padding: 20,
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f4f4', // Couleur de fond légère
  },
  header: {
    top: 10,
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
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 15,
    marginBottom: 20,
    borderRadius: 10,
    width: '90%',
    backgroundColor: '#fff',
    fontSize: 16,
  },
  subtitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#2B211B',
    padding: 15,
    borderRadius: 30, // Boutons plus arrondis
    alignItems: 'center',
    width: '80%',
    marginVertical: 10,
  },
  buttonBack: {
    backgroundColor: '#5C4033',
    padding: 15,
    borderRadius: 30, // Boutons plus arrondis
    alignItems: 'center',
    width: '80%',
    marginVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  stepIndicator: {
    fontSize: 16,
    marginBottom: 20,
    color: '#666',
    textAlign: 'center',
  },
  serviceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 20,
  },
  serviceBox: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
    width: 160,
    height: 180,
    justifyContent: 'center',
  },
  serviceImage: {
    width: 70,
    height: 70,
    marginBottom: 15,
  },
  serviceText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  reactionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginVertical: 30,
  },
  reactionBox: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25, // Plus de padding pour agrandir les cases
    margin: 20,
    width: 250, // Boîte plus large pour accueillir plus d'informations
    height: 400, // Hauteur augmentée
    alignItems: 'flex-start',
    justifyContent: 'space-between', // Espace entre le logo et la section infos
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10, // Élévation augmentée pour un effet moderne
  },
  reactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 20, // Taille du logo augmentée
    width: '100%',
  },
  reactionLogoLarge: {
    width: 70,
    height: 70,
    marginRight: 20,
  },
  reactionTextLarge: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'left',
  },
  informationBox: {
    width: '100%',
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  informationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#007bff',
  },
  messageInputLarge: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    backgroundColor: '#fff',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fond assombri pour la modale
  },
  modalContent: {
    width: '85%',
    padding: 25,
    backgroundColor: '#fff',
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  optionText: {
    fontSize: 18,
    marginVertical: 15,
    color: '#007bff',
  },
  serviceLogo: {
    width: 60,
    height: 60,
    marginBottom: 10,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#ff0000',
    padding: 12,
    borderRadius: 25,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});



export default AddArea;

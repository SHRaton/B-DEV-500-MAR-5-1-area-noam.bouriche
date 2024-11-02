import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, Image, StyleSheet, Modal, Button } from 'react-native';
import { useRouter } from 'expo-router';

const AddArea = () => {
  const [step, setStep] = useState(1); // Étape actuelle
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedApi, setSelectedApi] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [selectedApiAction, setSelectedApiAction] = useState<string | null>(null);
  const [showStreamerInput, setShowStreamerInput] = useState(false);
  const [streamerName, setStreamerName] = useState('');
  const [reactions, setReactions] = useState<{ logo: string, name: string, description: string }[]>(Array(6).fill({ logo: 'none', name: 'None', description: 'None' }));
  const [showServiceModal, setShowServiceModal] = useState(false); // Affichage de la pop-up pour ajouter une réaction
  const [currentReactionIndex, setCurrentReactionIndex] = useState<number | null>(null); // Indice de la réaction en cours d'ajout
  const [showSubServiceModal, setShowSubServiceModal] = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [error, setError] = useState(''); // État pour stocker le message d'erreur
  const router = useRouter();
  const MAX_REACTIONS = 6;

  const [showMissingRequirementsModal, setShowMissingRequirementsModal] = useState(false);
  const [missingRequirements, setMissingRequirements] = useState([]);
  const requiredReactions = {
    spotify: ['discord', 'telegram', 'deepl'],
    deepl: ['discord', 'telegram'],
  };

  // Check missing reactions for the selected reactions
  const getMissingReactions = () => {
    const missing = []; // Initialiser un tableau vide pour stocker les messages d'erreur
    // Parcourir les réactions pour vérifier les exigences
    for (let i = 0; i < reactions.length; i++) {
      const reaction = reactions[i];
      // Vérifier si la réaction actuelle est Spotify
      if (reaction.logo === 'spotify') {
        // Vérifier s'il y a une réaction suivante
        if (i + 1 < reactions.length) {
          const nextReaction = reactions[i + 1];
          // Vérifier si la réaction suivante est l'une des réactions requises
          if (!requiredReactions.spotify.some(req => nextReaction.logo.toLowerCase() === req.toLowerCase())) {
            missing.push("Spotify output requires the next reaction to be Discord, Telegram, or Deepl.");
          }
        } else {
          missing.push("Spotify output requires a following reaction.");
        }
      }
      // Vérifier les exigences pour Deepl
      if (reaction.name === 'Deepl_1' && reaction.logo === 'deepl') {
        if (!requiredReactions.deepl.some(req => reactions.some(r => r.logo.toLowerCase() === req.toLowerCase()))) {
          missing.push("Deepl translation requires a reaction with Discord or Telegram.");
        }
      }
    }
    return missing; // Retourner les messages d'erreur trouvés
  };

  // Navigation entre les étapes
  const goNextStep = () => {
    // Vérification si l'un des champs est vide
    if (!name || !description) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
    if (step == 2 && !streamerName && selectedApi == 'Twitch') {
      setError('Give a name of streamer')
      return;
    }
    if (step == 2 && streamerName && selectedApi == 'Twitch') {
      setSelectedAction('IS_STREAMING');
      setSelectedApiAction(streamerName);
      setShowSubServiceModal(false);
    } else if (step == 2) {
      setSelectedApiAction('');
    }
    setSelectedApiAction
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
      const response = await fetch(`http://localhost:8080/check-auth`, {
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

  useEffect(() => {
    const updatedReactions = reactions.map((reaction, index) => {
      // Check if the reaction needs "output" based on conditions
      if (
        (reaction.name === 'Discord_1' && reaction.logo === 'discord') ||
        (reaction.name === 'Discord_2' && reaction.logo === 'discord') ||
        (reaction.name === 'Telegram_1' && reaction.logo === 'telegram')
      ) {
        // Verify if previous reaction is Spotify or Deepl
        if (index > 0 && (reactions[index - 1].logo === 'spotify' || reactions[index - 1].logo === 'deepl')) {
          // Only set "output" if it isn't already
          return { ...reaction, message: "output" };
        }
      }
      return reaction;
    });
    // Update reactions only if they have changed
    if (JSON.stringify(reactions) !== JSON.stringify(updatedReactions)) {
      setReactions(updatedReactions);
    }
  }, [reactions]); // Dependency on `reactions` to trigger only when they change

  // Sélection d'une sous-réaction (option après le choix du service)
  const handleSubServiceSelect = (subService: string, logo: string) => {
    if (currentReactionIndex !== null) {
      const updatedReactions = [...reactions];
      let desc = "";
      if (subService == "Deepl_1") {
        desc = "Traduction";
      }
      if (subService == "Discord_1") {
        desc = "Envoyer un message privé";
      }
      if (subService == "Discord_2") {
        desc = "Envoyer un message dans un channel";
      }
      if (subService == "Spotify_1") {
        desc = "Recuperer les playlists";
      }
      if (subService == "Spotify_2") {
        desc = "Recuperer les 5 top titres";
      }
      if (subService == "Spotify_3") {
        desc = "Recuperer les 10 recommendations de sons";
      }
      if (subService == "Spotify_4") {
        desc = "Recuperer les 10 recommendations d'artistes";
      }
      if (subService == "Spotify_5") {
        desc = "Recuperer les derniers sons sortis";
      }
      if (subService == "Telegram_1") {
        desc = "Envoyer un message dans un canal";
      }
      updatedReactions[currentReactionIndex] = { logo, name: subService, description: desc };
      setReactions(updatedReactions); // Mettre à jour les réactions avec la nouvelle sélection
      setCurrentReactionIndex(null);
      setShowSubServiceModal(false); // Fermer la sous-modale après avoir sélectionné
    }
  };

  const get_desc_from_action = (action: string) => {
    if (action == 'IS_STREAMING')
      return 'Streamer starts a stream > ';
    if (action == 'BTC')
      return 'The price of bitcoin has increased';
    if (action == 'DETECT_MESSAGE')
      return 'Message received';
    if (action == 'IS_RAINING')
      return 'Raining time';
    if (action == 'IS_NIGHT')
      return 'Night time';
  }

  // Ouvrir la modale pour ajouter une nouvelle réaction
  const openReactionModal = (index: number) => {
    setCurrentReactionIndex(index);
    setShowServiceModal(true); // Ouvrir la modale de sélection de service
  };

  // Soumettre l'area une fois que tout est configuré
  const handleSubmitArea = async () => {
    const missing = getMissingReactions();
    if (missing.length > 0) {
      setMissingRequirements(missing);
      setShowMissingRequirementsModal(true);
      return;
    }

    const areaData = {
      isActive: true,
      isPublic: false,
      name,
      description,
      selectedAction,
      selectedApiAction,
      // Map the reactions to the format expected by the API
      ...reactions.reduce((acc, reaction, index) => {
        if (reaction.name !== 'None') {
          acc[`reaction_${index + 1}`] = reaction.name;
          const reactionInfo = {};
          if (reaction.info) reactionInfo.info = reaction.info;
          if (reaction.message) reactionInfo.message = reaction.message;
          if (reaction.person) reactionInfo.person = reaction.person;
          if (reaction.langue) reactionInfo.langue = reaction.langue;
          // Assigner l'objet JSON comme chaîne de caractères
          acc[`reaction_${index + 1}_info`] = JSON.stringify(reactionInfo);
        }
        return acc;
      }, {})
    };
    try {
      const response = await fetch('http://localhost:8080/add-area', {
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

  const handleTwitchActionSelect = () => {
    setSelectedApiAction('Streamer starts a stream');
    setShowStreamerInput(true); // Show the input field for Twitch
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
            <Pressable style={styles.button} onPress={goNextStep}>
              <Text style={styles.buttonText}>Suivant</Text>
            </Pressable>
          </>
        );
        case 2:
          return (
            <>
              <Text style={styles.subtitle}>Choisir une action de départ</Text>
              <View style={styles.serviceContainer}>
                <Pressable style={styles.serviceBox} onPress={() => setSelectedApi('Twitch')}>
                  <Image source={require('../../assets/logos/twitch.png')} style={styles.serviceImage} resizeMode="contain"/>
                  <Text style={styles.serviceText}>Twitch</Text>
                </Pressable>
                <Pressable style={styles.serviceBox} onPress={() => setSelectedApi('Gecko')}>
                  <Image source={require('../../assets/logos/gecko.png')} style={styles.serviceImage} resizeMode="contain"/>
                  <Text style={styles.serviceText}>Gecko</Text>
                </Pressable>
                <Pressable style={styles.serviceBox} onPress={() => setSelectedApi('Discord')}>
                  <Image source={require('../../assets/logos/discord.png')} style={styles.serviceImage} resizeMode="contain"/>
                  <Text style={styles.serviceText}>Discord</Text>
                </Pressable>
                <Pressable style={styles.serviceBox} onPress={() => setSelectedApi('Weather')}>
                  <Image source={require('../../assets/logos/weather.png')} style={styles.serviceImage} resizeMode="contain"/>
                  <Text style={styles.serviceText}>Weather</Text>
                </Pressable>
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
                      {selectedApi === 'Twitch' && (
                        <>
                          <Pressable onPress={handleTwitchActionSelect}>
                            <Text style={styles.optionText}>Streamer starts a stream</Text>
                          </Pressable>
                          {showStreamerInput && (
                            <View style={styles.inputContainer}>
                              {error ? <Text style={{ color: 'red' }}>{error}</Text> : null}
                              <TextInput
                                style={styles.input}
                                placeholder="Streamer Name"
                                value={streamerName}
                                onChangeText={setStreamerName}
                              />
                              <Pressable style={styles.button}
                                onPress={() => {
                                goNextStep();
                              }}>
                                <Text style={styles.buttonText}>Next</Text>
                              </Pressable>
                            </View>
                          )}
                        </>
                      )}
                      {selectedApi === 'Gecko' && (
                        <>
                          <Pressable 
                            onPress={() => {
                              setSelectedAction('BTC');
                              setShowSubServiceModal(false);
                              goNextStep();
                            }}>
                            <Text style={styles.optionText}>The price of bitcoin has increased</Text>
                          </Pressable>
                        </>
                      )}
                      {selectedApi === 'Discord' && (
                        <>
                          <Pressable 
                            onPress={() => {
                              setSelectedAction('DETECT_MESSAGE');
                              setShowSubServiceModal(false);
                              goNextStep();
                            }}>
                            <Text style={styles.optionText}>Message received</Text>
                          </Pressable>
                        </>
                      )}
                      {selectedApi === 'Weather' && (
                        <>
                          <Pressable 
                            onPress={() => {
                              setSelectedAction('IS_RAINING');
                              setShowSubServiceModal(false);
                              goNextStep();
                            }}>
                            <Text style={styles.optionText}>Raining Time</Text>
                          </Pressable>
                          <Pressable 
                            onPress={() => {
                              setSelectedAction('IS_NIGHT');
                              setShowSubServiceModal(false);
                              goNextStep();
                            }}>
                            <Text style={styles.optionText}>Night Time</Text>
                          </Pressable>
                        </>
                      )}
                    </View>
                  </View>
                </Modal>
              )}

              <Pressable style={styles.buttonBack} onPress={goPreviousStep}>
                <Text style={styles.buttonText}>Retour</Text>
              </Pressable>
            </>
          );
          case 3:
  return (
    <>
      <View style={styles.actionContainer}>
          <Image source={getLogoSource(selectedApi)} style={styles.actionLogoLarge} resizeMode="contain"/>
          <Text style={styles.subtitleAction}>   {get_desc_from_action(selectedAction)}
            {selectedApiAction ? <Text style={styles.subtitleAction}> {selectedApiAction}</Text> : null}
          </Text>
      </View>
      <Text style={styles.subtitle}>Ajouter des réactions</Text>
      <View style={styles.reactionContainer}>
        {reactions.map((reaction, index) => (
          <View key={index} style={styles.reactionBox}>
            {/* Logo et nom du service */}
            <Pressable onPress={() => openReactionModal(index)} style={styles.reactionHeader}>
              <Image source={getLogoSource(reaction.logo)} style={styles.reactionLogoLarge} />
              <Text style={styles.reactionTextLarge}>{reaction.description}</Text>
            </Pressable>

            {/* Afficher la section des informations uniquement si une réaction a été sélectionnée */}
            {reaction.name !== 'None' && (
              <View style={styles.informationBox}>
                {reaction.name === 'Deepl_1' && reaction.logo === 'deepl' && (
                  <>
                    <Text style={styles.informationTitle}>Langue finale</Text>
                    <TextInput
                      style={styles.messageInputLarge}
                      placeholder="En quelle langue souhaitez vous traduire votre texte ?"
                      value={reaction.langue || ''}
                      onChangeText={(text) => {
                        const updatedReactions = [...reactions];
                        updatedReactions[index].langue = text; // Mettre à jour le message pour cette réaction
                        setReactions(updatedReactions);
                      }}
                    />
                    <Text style={styles.informationTitle}>Texte à traduire</Text>
                    <TextInput
                      style={styles.messageInputLarge}
                      placeholder="Quel texte souhaitez-vous traduire ?"
                      value={reaction.message || ''}
                      onChangeText={(text) => {
                        const updatedReactions = [...reactions];
                        updatedReactions[index].message = text; // Mettre à jour le message pour cette réaction
                        setReactions(updatedReactions);
                      }}
                    />
                  </>
                )}
                {reaction.name === 'Telegram_1' && reaction.logo === 'telegram' && (
                  <>
                    <Text style={styles.informationTitle}>Message à envoyer</Text>
                    {index > 0 && (reactions[index - 1].logo === 'spotify' || reactions[index - 1].logo === 'deepl') ? (
                      <Text style={styles.outputText}>OUTPUT</Text>
                    ) : (
                      <TextInput
                        style={styles.messageInputLarge}
                        placeholder="Quel message souhaitez-vous envoyer ?"
                        value={reaction.message || ''}
                        onChangeText={(text) => {
                          const updatedReactions = [...reactions];
                          updatedReactions[index].message = text;
                          setReactions(updatedReactions);
                        }}
                      />
                    )}
                  </>
                )}
                {reaction.name === 'Discord_1' && reaction.logo === 'discord' && (
                  <>
                    <Text style={styles.informationTitle}>Personne a qui envoyer</Text>
                    <TextInput
                      style={styles.messageInputLarge}
                      placeholder="A qui souhaitez-vous envoyer le message ?"
                      value={reaction.person || ''}
                      onChangeText={(text) => {
                        const updatedReactions = [...reactions];
                        updatedReactions[index].person = text;
                        setReactions(updatedReactions);
                      }}
                    />
                    <Text style={styles.informationTitle}>Message à envoyer</Text>
                    {index > 0 && (reactions[index - 1].logo === 'spotify' || reactions[index - 1].logo === 'deepl') ? (
                      <Text style={styles.outputText}>OUTPUT</Text>
                    ) : (
                      <TextInput
                        style={styles.messageInputLarge}
                        placeholder="Quel message souhaitez-vous envoyer ?"
                        value={reaction.message || ''}
                        onChangeText={(text) => {
                          const updatedReactions = [...reactions];
                          updatedReactions[index].message = text;
                          setReactions(updatedReactions);
                        }}
                      />
                    )}
                  </>
                )}
                {reaction.name === 'Discord_2' && reaction.logo === 'discord' && (
                  <>
                    <Text style={styles.informationTitle}>Channel dans lequel envoyer</Text>
                    <TextInput
                      style={styles.messageInputLarge}
                      placeholder="channel"
                      value={reaction.person || ''}
                      onChangeText={(text) => {
                        const updatedReactions = [...reactions];
                        updatedReactions[index].person = text; // Mettre à jour le message pour cette réaction
                        setReactions(updatedReactions);
                      }}
                    />
                    <Text style={styles.informationTitle}>Message à envoyer</Text>
                    {index > 0 && (reactions[index - 1].logo === 'spotify' || reactions[index - 1].logo === 'deepl') ? (
                      <Text style={styles.outputText}>OUTPUT</Text>
                    ) : (
                      <TextInput
                        style={styles.messageInputLarge}
                        placeholder="message"
                        value={reaction.message || ''}
                        onChangeText={(text) => {
                          const updatedReactions = [...reactions];
                          updatedReactions[index].message = text; // Mettre à jour le message pour cette réaction
                          setReactions(updatedReactions);
                        }}
                      />
                    )}
                  </>
                )}

              </View>
            )}
          </View>
        ))}
      </View>

      {/* Modal for missing requirements */}
      <Modal visible={showMissingRequirementsModal} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Conditions manquantes</Text>
            {missingRequirements.map((requirement, index) => (
              <Text key={index} style={styles.missingText}>{requirement}</Text>
            ))}
            <Pressable onPress={() => setShowMissingRequirementsModal(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Fermer</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Pressable style={styles.button} onPress={handleSubmitArea}>
        <Text style={styles.buttonText}>Terminer et ajouter l'area</Text>
      </Pressable>
      <Pressable style={styles.buttonBack} onPress={goPreviousStep} onPressIn={() => setSelectedApi('')}>
        <Text style={styles.buttonText}>Retour</Text>
      </Pressable>

      {/* Modal pour sélectionner un service */}
      <Modal visible={showServiceModal} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sélectionnez un service</Text>
            <Pressable onPress={() => handleServiceSelect('Deepl')}>
              <Image source={require('../../assets/logos/deepl.png')} style={styles.serviceLogo} resizeMode="contain"/>
              <Text style={styles.optionText}>Deepl</Text>
            </Pressable>
            <Pressable onPress={() => handleServiceSelect('Discord')}>
              <Image source={require('../../assets/logos/discord.png')} style={styles.serviceLogo} resizeMode="contain"/>
              <Text style={styles.optionText}>Discord</Text>
            </Pressable>
            <Pressable onPress={() => handleServiceSelect('Spotify')}>
              <Image source={require('../../assets/logos/spotify.png')} style={styles.serviceLogo} resizeMode="contain"/>
              <Text style={styles.optionText}>Spotify</Text>
            </Pressable>
            <Pressable onPress={() => handleServiceSelect('Telegram')}>
              <Image source={require('../../assets/logos/telegram.png')} style={styles.serviceLogo} resizeMode="contain"/>
              <Text style={styles.optionText}>Telegram</Text>
            </Pressable>
            <Pressable onPress={() => handleServiceSelect('None')}>
            <Image source={require('../../assets/logos/none.png')} style={styles.serviceLogo} resizeMode="contain"/>
              <Text style={styles.optionText}>None</Text>
            </Pressable>

            {/* Bouton pour fermer la modal */}
            <Pressable onPress={() => setShowServiceModal(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Fermer</Text>
            </Pressable>
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
                <Pressable onPress={() => handleSubServiceSelect('Deepl_1', 'deepl')}>
                  <Text style={styles.optionText}>Traduction</Text>
                </Pressable>
              </>
            )}
            {selectedService === 'Discord' && (
              <>
                <Pressable onPress={() => handleSubServiceSelect('Discord_1', 'discord')}>
                  <Text style={styles.optionText}>Envoyer un message privé</Text>
                </Pressable>
                <Pressable onPress={() => handleSubServiceSelect('Discord_2', 'discord')}>
                  <Text style={styles.optionText}>Envoyer un message dans un channel</Text>
                </Pressable>
              </>
            )}
            {selectedService === 'Spotify' && (
              <>
                <Pressable onPress={() => handleSubServiceSelect('Spotify_1', 'spotify')}>
                  <Text style={styles.optionText}>Recuperer les playlists</Text>
                </Pressable>
                <Pressable onPress={() => handleSubServiceSelect('Spotify_2', 'spotify')}>
                  <Text style={styles.optionText}>Recuperer les 5 top titres</Text>
                </Pressable>
                <Pressable onPress={() => handleSubServiceSelect('Spotify_3', 'spotify')}>
                  <Text style={styles.optionText}>Recuperer les 10 recommendations de sons</Text>
                </Pressable>
                <Pressable onPress={() => handleSubServiceSelect('Spotify_4', 'spotify')}>
                  <Text style={styles.optionText}>Recuperer les 10 recommendations d'artistes</Text>
                </Pressable>
                <Pressable onPress={() => handleSubServiceSelect('Spotify_5', 'spotify')}>
                  <Text style={styles.optionText}>Recuperer les derniers sons sortis</Text>
                </Pressable>
              </>
            )}
            {selectedService === 'Telegram' && (
              <>
                <Pressable onPress={() => handleSubServiceSelect('Telegram_1', 'telegram')}>
                  <Text style={styles.optionText}>Envoyer un message</Text>
                </Pressable>
              </>
            )}
            <Pressable onPress={() => setShowSubServiceModal(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Fermer</Text>
            </Pressable>
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
  const normalizedLogoName = logoName.toLowerCase()
  switch (normalizedLogoName) {
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
    case 'telegram':
      return require('../../assets/logos/telegram.png');
    case 'gecko':
      return require('../../assets/logos/gecko.png');
    case 'weather':
      return require('../../assets/logos/weather.png');
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
    color: '#333',
    textAlign: 'center',
  },
  subtitleAction: {
    fontSize: 18,
    color: 'red',
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
  outputText: {
    color: 'green',
    borderRadius: 5,
    fontSize: 25,
    justifyContent: 'center',
    alignSelf: 'center',
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
    justifyContent: 'space-around',
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
    marginVertical: 20,
  },
  actionContainer: {
    width: '40%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 15,
    backgroundColor: '#d7d7d7',
    borderRadius: 100,
  },
  actionLogoLarge: {
    width: 60,
    height: 60,
    marginRight: 10,
  },
  reactionBox: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25, // Plus de padding pour agrandir les cases
    margin: 10,
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
    marginTop: 10,
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

  inputContainer: {
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
    alignItems: 'center',
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

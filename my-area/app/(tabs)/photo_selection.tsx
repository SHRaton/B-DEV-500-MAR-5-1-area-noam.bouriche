import React from 'react';
import { View, Text, Pressable, Image, StyleSheet } from 'react-native';

const photoList = Array.from({ length: 11 }, (_, i) => `photo_${i}.png`);

const photos = {
  1: require('../../assets/images/photo_1.png'),
  2: require('../../assets/images/photo_2.png'),
  3: require('../../assets/images/photo_3.png'),
  4: require('../../assets/images/photo_4.png'),
  5: require('../../assets/images/photo_5.png'),
  6: require('../../assets/images/photo_6.png'),
  7: require('../../assets/images/photo_7.png'),
  8: require('../../assets/images/photo_8.png'),
  9: require('../../assets/images/photo_9.png'),
  10: require('../../assets/images/photo_10.png'),
};

export default function PhotoSelection({ onSelect, onClose }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choisissez votre photo de profil</Text>
      <View style={styles.photosContainer}>
        {photoList.map((photo, index) => (
          <Pressable key={index} onPress={() => onSelect(index)}>
            <Image 
              source={photos[index]}
              style={styles.photo} 
              resizeMode="cover" 
            />
          </Pressable>
        ))}
      </View>
      <Pressable style={styles.closeButton} onPress={onClose}>
        <Text style={styles.closeButtonText}>Fermer</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  photosContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  photo: { width: 80, height: 80, margin: 5, borderRadius: 40 },
  closeButton: { marginTop: 20, padding: 10, backgroundColor: '#333' },
  closeButtonText: { color: '#fff', fontWeight: 'bold' },
});

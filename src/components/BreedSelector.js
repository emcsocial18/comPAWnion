import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput
} from 'react-native';
import { getBreedsList } from '../data/breeds';

export default function BreedSelector({ selectedBreed, onSelectBreed, visible, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  const breeds = getBreedsList();

  const filteredBreeds = breeds.filter(breed =>
    breed.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Breed</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.searchInput}
            placeholder="Search breeds..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />

          <ScrollView style={styles.breedsList}>
            {filteredBreeds.map((breed) => (
              <TouchableOpacity
                key={breed.id}
                style={[
                  styles.breedItem,
                  selectedBreed === breed.id && styles.breedItemSelected
                ]}
                onPress={() => {
                  onSelectBreed(breed.id);
                  onClose();
                }}
              >
                <Text style={styles.breedEmoji}>{breed.emoji}</Text>
                <View style={styles.breedInfo}>
                  <Text style={styles.breedName}>{breed.name}</Text>
                  <Text style={styles.breedTraits}>
                    {breed.traits.join(' • ')}
                  </Text>
                  <Text style={styles.breedEnergy}>
                    Energy: {breed.energyLevel} | Playfulness: {breed.playfulness}%
                  </Text>
                </View>
                {selectedBreed === breed.id && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2b2b2b',
  },
  closeButton: {
    fontSize: 24,
    color: '#999',
    fontWeight: '300',
  },
  searchInput: {
    margin: 16,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    fontSize: 16,
    color: '#2b2b2b',
  },
  breedsList: {
    flex: 1,
  },
  breedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  breedItemSelected: {
    backgroundColor: '#E8F4FD',
    borderColor: '#FF9B50',
  },
  breedEmoji: {
    fontSize: 40,
    marginRight: 16,
  },
  breedInfo: {
    flex: 1,
  },
  breedName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2b2b2b',
    marginBottom: 4,
  },
  breedTraits: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  breedEnergy: {
    fontSize: 11,
    color: '#999',
  },
  checkmark: {
    fontSize: 24,
    color: '#FF9B50',
    fontWeight: '700',
  },
});

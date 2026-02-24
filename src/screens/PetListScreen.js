import React, { useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert
} from 'react-native';
import { AppContext } from '../context/AppContext';

export default function PetListScreen({ navigation }) {
  const { pets, pet: currentPet, switchPet, deletePet } = useContext(AppContext);

  function handleSelectPet(selectedPet) {
    switchPet(selectedPet);
    navigation.goBack();
  }

  function handleDeletePet(petToDelete) {
    if (pets.length === 1) {
      Alert.alert('Cannot Delete', 'You must have at least one pet');
      return;
    }

    Alert.alert(
      'Delete Pet',
      `Are you sure you want to delete ${petToDelete.name}? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deletePet(petToDelete.id)
        }
      ]
    );
  }

  function handleAddPet() {
    navigation.navigate('PetModeSelection');
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Pets</Text>
        <Text style={styles.subtitle}>{pets.length} {pets.length === 1 ? 'pet' : 'pets'}</Text>
      </View>

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {pets.map((p) => (
          <View key={p.id} style={[styles.petCard, currentPet?.id === p.id && styles.petCardActive]}>
            <TouchableOpacity style={{flex:1}} onPress={() => handleSelectPet(p)}>
              <View style={styles.petInfo}>
                <Text style={styles.petName}>{p.name}</Text>
                {p.breed && <Text style={styles.petBreed}>{p.breed}</Text>}
                <Text style={styles.petType}>
                  {p.isPawPal === false || p.mode === 'remember' ? '🌈 Furever Bestfriend' : '🐾 Virtual PawPal'}
                </Text>
                {((p.isPawPal === false || p.mode === 'remember')) && (
                  <TouchableOpacity
                    style={{marginTop: 8, backgroundColor: '#e0e0e0', padding: 6, borderRadius: 8}}
                    onPress={() => navigation.navigate('PetProfile', { petId: p.id, mode: 'edit' })}
                  >
                    <Text style={{color: '#333'}}>View/Edit Profile</Text>
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
            {currentPet?.id === p.id && (
              <View style={styles.activeIndicator}>
                <Text style={styles.activeText}>✓</Text>
              </View>
            )}
            <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeletePet(p)}>
              <Text style={styles.deleteIcon}>🗑️</Text>
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity style={styles.addButton} onPress={handleAddPet}>
          <Text style={styles.addButtonText}>+ Add Another Pet</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
    deleteButton: {
      marginLeft: 12,
      padding: 8,
      borderRadius: 16,
      backgroundColor: '#FFF0F0',
      alignItems: 'center',
      justifyContent: 'center',
    },
    deleteIcon: {
      fontSize: 22,
      color: '#E74C3C',
    },
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  header: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  petCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: '#EEE',
  },
  petCardActive: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  petInfo: {
    flex: 1,
  },
  petName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  petBreed: {
    fontSize: 15,
    color: '#666',
    marginBottom: 4,
  },
  petType: {
    fontSize: 13,
    color: '#999',
  },
  activeIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#007AFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginTop: 12,
  },
  addButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});

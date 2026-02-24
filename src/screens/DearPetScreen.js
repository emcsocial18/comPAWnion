import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppContext } from '../context/AppContext';

export default function DearPetScreen({ navigation }) {
  const { pet } = useContext(AppContext);
  const [entries, setEntries] = useState([]);
  const [isWriting, setIsWriting] = useState(false);
  const [currentEntry, setCurrentEntry] = useState('');

  useEffect(() => {
    loadEntries();
  }, [pet]);

  async function loadEntries() {
    try {
      if (pet?.id) {
        const key = `@dearPet_${pet.id}`;
        const stored = await AsyncStorage.getItem(key);
        if (stored) {
          setEntries(JSON.parse(stored));
        }
      }
    } catch (e) {
      console.log('Error loading entries:', e);
    }
  }

  async function saveEntry() {
    if (!currentEntry.trim()) {
      Alert.alert('Empty Entry', 'Please write something before saving.');
      return;
    }

    const newEntry = {
      id: Date.now().toString(),
      text: currentEntry.trim(),
      date: new Date().toISOString(),
      petName: pet?.name || 'My Pet'
    };

    const updatedEntries = [newEntry, ...entries];
    setEntries(updatedEntries);

    try {
      const key = `@dearPet_${pet.id}`;
      await AsyncStorage.setItem(key, JSON.stringify(updatedEntries));
      setCurrentEntry('');
      setIsWriting(false);
      Alert.alert('Saved', 'Your entry has been saved.');
    } catch (e) {
      Alert.alert('Error', 'Failed to save entry.');
    }
  }

  async function deleteEntry(entryId) {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updatedEntries = entries.filter(e => e.id !== entryId);
            setEntries(updatedEntries);
            try {
              const key = `@dearPet_${pet.id}`;
              await AsyncStorage.setItem(key, JSON.stringify(updatedEntries));
            } catch (e) {
              console.log('Error deleting entry:', e);
            }
          }
        }
      ]
    );
  }

  function formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  }

  if (isWriting) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setIsWriting(false)}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Dear {pet?.name}</Text>
          <TouchableOpacity onPress={saveEntry}>
            <Text style={styles.saveButton}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.writeContainer}>
          <Text style={styles.dateText}>{formatDate(new Date().toISOString())}</Text>
          <TextInput
            style={styles.entryInput}
            value={currentEntry}
            onChangeText={setCurrentEntry}
            placeholder={`Dear ${pet?.name},\n\nToday I wanted to share with you...`}
            placeholderTextColor="#aaa"
            multiline
            autoFocus
            textAlignVertical="top"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dear {pet?.name}</Text>
        <TouchableOpacity onPress={() => setIsWriting(true)}>
          <Text style={styles.writeButton}>+ Write</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.entriesContainer}>
        {entries.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>💌</Text>
            <Text style={styles.emptyTitle}>No entries yet</Text>
            <Text style={styles.emptyText}>
              Start writing to {pet?.name}. Share your thoughts, feelings, and daily moments.
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => setIsWriting(true)}
            >
              <Text style={styles.emptyButtonText}>Write First Entry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          entries.map((entry) => (
            <View key={entry.id} style={styles.entryCard}>
              <View style={styles.entryHeader}>
                <Text style={styles.entryDate}>{formatDate(entry.date)}</Text>
                <TouchableOpacity onPress={() => deleteEntry(entry.id)}>
                  <Text style={styles.deleteButton}>🗑️</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.entryText}>{entry.text}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 60,
    backgroundColor: '#FFE8F5',
    borderBottomWidth: 1,
    borderBottomColor: '#FFD4EC',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2b2b2b',
  },
  backButton: {
    fontSize: 16,
    color: '#FF6B9D',
    fontWeight: '600',
  },
  writeButton: {
    fontSize: 16,
    color: '#FF6B9D',
    fontWeight: '600',
  },
  cancelButton: {
    fontSize: 16,
    color: '#888',
    fontWeight: '600',
  },
  saveButton: {
    fontSize: 16,
    color: '#FF6B9D',
    fontWeight: '700',
  },
  entriesContainer: {
    flex: 1,
    padding: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2b2b2b',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#FF6B9D',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  entryCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B9D',
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  entryDate: {
    fontSize: 13,
    color: '#888',
    fontWeight: '500',
  },
  deleteButton: {
    fontSize: 18,
    opacity: 0.6,
  },
  entryText: {
    fontSize: 16,
    color: '#2b2b2b',
    lineHeight: 24,
  },
  writeContainer: {
    flex: 1,
    padding: 20,
  },
  dateText: {
    fontSize: 14,
    color: '#888',
    marginBottom: 16,
    fontWeight: '500',
  },
  entryInput: {
    fontSize: 16,
    color: '#2b2b2b',
    lineHeight: 26,
    minHeight: 400,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
});

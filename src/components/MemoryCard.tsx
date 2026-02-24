import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Modal } from 'react-native';
import { Video } from 'expo-av';

type Memory = { 
  id: string; 
  text: string; 
  date: string;
  photo?: string;
  video?: string;
};

export default function MemoryCard({ memory }: { memory: Memory }){
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <View style={styles.card}>
        {memory.photo && (
          <TouchableOpacity 
            onPress={() => setShowModal(true)}
            activeOpacity={0.7}
          >
            <Image 
              source={{ uri: memory.photo }} 
              style={styles.media}
              resizeMode="cover"
            />
          </TouchableOpacity>
        )}
        
        {memory.video && (
          <TouchableOpacity 
            onPress={() => setShowModal(true)}
            activeOpacity={0.7}
          >
            <Video
              source={{ uri: memory.video }}
              style={styles.media}
              useNativeControls
              resizeMode="contain"
              isLooping
            />
          </TouchableOpacity>
        )}
        
        <Text style={styles.text}>{memory.text}</Text>
        <Text style={styles.date}>{new Date(memory.date).toLocaleString()}</Text>
      </View>

      <Modal 
        visible={showModal} 
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setShowModal(false)}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>

          {memory.photo && (
            <Image 
              source={{ uri: memory.photo }} 
              style={styles.modalMedia}
              resizeMode="contain"
            />
          )}
          
          {memory.video && (
            <Video
              source={{ uri: memory.video }}
              style={styles.modalMedia}
              useNativeControls
              resizeMode="contain"
              isLooping
              shouldPlay
            />
          )}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  media: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  text: {
    fontSize: 16,
    color: '#222',
    lineHeight: 22,
  },
  date: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalMedia: {
    width: '90%',
    height: '80%',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
  },
});
